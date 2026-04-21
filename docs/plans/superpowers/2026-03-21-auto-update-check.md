# Auto Update Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement automatic version checking on app startup and manual check button in Settings > About page.

**Architecture:** Backend calls GitHub Releases API to check for new versions, compares using semver, stores check history and skipped versions locally. Frontend displays update notification with download link.

**Tech Stack:** Rust (reqwest, semver), TypeScript, Tauri v2

---

## Files to Create/Modify

| File                                  | Action | Description              |
| ------------------------------------- | ------ | ------------------------ |
| `src-tauri/src/commands/update.rs`    | Create | Update check commands    |
| `src-tauri/src/commands/mod.rs`       | Modify | Register update module   |
| `src-tauri/src/lib.rs`                | Modify | Register commands        |
| `src-tauri/Cargo.toml`                | Modify | Add reqwest, semver deps |
| `src/lib/api/update.ts`               | Create | Frontend API wrapper     |
| `src/app/views/SettingsAboutView.tsx` | Modify | Add update check UI      |
| `src/hooks/useAutoUpdate.ts`          | Create | Auto-update hook         |

---

## Task 1: Backend - Update Check Commands

**Files:**

- Create: `src-tauri/src/commands/update.rs`
- Modify: `src-tauri/src/commands/mod.rs`
- Modify: `src-tauri/src/lib.rs`
- Modify: `src-tauri/Cargo.toml`

- [ ] **Step 1: Add dependencies to Cargo.toml**

```toml
# In src-tauri/Cargo.toml, add under [dependencies]
reqwest = { version = "0.12", features = ["json"] }
semver = "1.0"
```

- [ ] **Step 2: Create update.rs with data structures**

```rust
// src-tauri/src/commands/update.rs
use serde::{Deserialize, Serialize};
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct UpdateInfo {
    pub has_update: bool,
    pub current_version: String,
    pub latest_version: String,
    pub release_url: String,
    pub release_notes: String,
}

#[derive(Debug, Deserialize)]
struct GitHubRelease {
    tag_name: String,
    html_url: String,
    body: Option<String>,
}

const GITHUB_REPO: &str = "oGsLP/plan-todos";
```

- [ ] **Step 3: Implement check_for_updates command**

```rust
#[tauri::command]
pub async fn check_for_updates(app: AppHandle) -> Result<Option<UpdateInfo>, String> {
    // Get current version
    let current_version = app.package_info().version.to_string();

    // Check if we should skip (throttle to once per 24h)
    if let Ok(Some(last_check)) = get_last_check_time(&app) {
        let hours_since = (chrono::Utc::now() - last_check).num_hours();
        if hours_since < 24 {
            return Ok(None);
        }
    }

    // Call GitHub API
    let url = format!("https://api.github.com/repos/{}/releases/latest", GITHUB_REPO);
    let client = reqwest::Client::new();

    let response = client
        .get(&url)
        .header("User-Agent", "plan-todos")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch release: {}", e))?;

    if !response.status().is_success() {
        return Err(format!("GitHub API error: {}", response.status()));
    }

    let release: GitHubRelease = response
        .json()
        .await
        .map_err(|e| format!("Failed to parse response: {}", e))?;

    // Update last check time
    let _ = save_last_check_time(&app);

    // Compare versions
    let latest_version = release.tag_name.trim_start_matches('v').to_string();

    let has_update = semver::Version::parse(&latest_version)
        .ok()
        .zip(semver::Version::parse(&current_version).ok())
        .map(|(latest, current)| latest > current)
        .unwrap_or(false);

    if !has_update {
        return Ok(None);
    }

    // Check if user skipped this version
    if let Ok(Some(skipped)) = get_skipped_version(&app) {
        if skipped == latest_version {
            return Ok(None);
        }
    }

    Ok(Some(UpdateInfo {
        has_update,
        current_version,
        latest_version,
        release_url: release.html_url,
        release_notes: release.body.unwrap_or_default(),
    }))
}
```

- [ ] **Step 4: Implement skip_version command**

```rust
#[tauri::command]
pub fn skip_version(app: AppHandle, version: String) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create dir: {}", e))?;

    let skip_file = app_data_dir.join(".skip_version");
    std::fs::write(&skip_file, &version)
        .map_err(|e| format!("Failed to write skip file: {}", e))
}

// Helper functions
fn get_last_check_time(app: &AppHandle) -> Result<Option<chrono::DateTime<chrono::Utc>>, String> {
    let app_data_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let check_file = app_data_dir.join(".last_update_check");
    if !check_file.exists() {
        return Ok(None);
    }

    let content = std::fs::read_to_string(&check_file)
        .map_err(|e| format!("Failed to read check file: {}", e))?;

    Ok(chrono::DateTime::parse_from_rfc3339(&content)
        .ok()
        .map(|dt| dt.with_timezone(&chrono::Utc)))
}

fn save_last_check_time(app: &AppHandle) -> Result<(), String> {
    let app_data_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    std::fs::create_dir_all(&app_data_dir)
        .map_err(|e| format!("Failed to create dir: {}", e))?;

    let check_file = app_data_dir.join(".last_update_check");
    let now = chrono::Utc::now().to_rfc3339();
    std::fs::write(&check_file, &now)
        .map_err(|e| format!("Failed to write check file: {}", e))
}

fn get_skipped_version(app: &AppHandle) -> Result<Option<String>, String> {
    let app_data_dir = app.path().app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    let skip_file = app_data_dir.join(".skip_version");
    if !skip_file.exists() {
        return Ok(None);
    }

    std::fs::read_to_string(&skip_file)
        .map(|e| format!("Failed to read skip file: {}", e))
        .map(Some)
}
```

- [ ] **Step 5: Register module in commands/mod.rs**

```rust
// In src-tauri/src/commands/mod.rs, add:
pub mod update;
```

- [ ] **Step 6: Register commands in lib.rs**

```rust
// In src-tauri/src/lib.rs, add to invoke_handler:
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::update::check_for_updates,
    commands::update::skip_version,
])
```

- [ ] **Step 7: Run cargo check**

```bash
cd src-tauri && cargo check
```

Expected: No errors

- [ ] **Step 8: Commit backend changes**

```bash
git add src-tauri/
git commit -m "feat(update): add update check backend commands"
```

---

## Task 2: Frontend API Wrapper

**Files:**

- Create: `src/lib/api/update.ts`

- [ ] **Step 1: Create update API wrapper**

```typescript
// src/lib/api/update.ts
import { invoke } from "@tauri-apps/api/core";

export interface UpdateInfo {
  has_update: boolean;
  current_version: string;
  latest_version: string;
  release_url: string;
  release_notes: string;
}

export async function checkForUpdates(): Promise<UpdateInfo | null> {
  return await invoke<UpdateInfo | null>("check_for_updates");
}

export async function skipVersion(version: string): Promise<void> {
  await invoke("skip_version", { version });
}
```

- [ ] **Step 2: Commit API wrapper**

```bash
git add src/lib/api/update.ts
git commit -m "feat(update): add frontend API wrapper"
```

---

## Task 3: Frontend - Settings UI

**Files:**

- Modify: `src/app/views/SettingsAboutView.tsx`
- Create: `src/hooks/useAutoUpdate.ts`

- [ ] **Step 1: Create useAutoUpdate hook**

```typescript
// src/hooks/useAutoUpdate.ts
import { useState, useEffect } from "react";
import { checkForUpdates, UpdateInfo, skipVersion } from "@/lib/api/update";

export function useAutoUpdate() {
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkUpdate = async () => {
    setChecking(true);
    setError(null);
    try {
      const info = await checkForUpdates();
      setUpdateInfo(info);
    } catch (e) {
      setError(e instanceof Error ? e.message : "检查更新失败");
    } finally {
      setChecking(false);
    }
  };

  const handleSkip = async () => {
    if (updateInfo) {
      await skipVersion(updateInfo.latest_version);
      setUpdateInfo(null);
    }
  };

  // Auto-check on mount (with throttle handled by backend)
  useEffect(() => {
    checkUpdate();
  }, []);

  return {
    checking,
    updateInfo,
    error,
    checkUpdate,
    handleSkip,
  };
}
```

- [ ] **Step 2: Read current SettingsAboutView.tsx**

Read the file to understand current structure, then modify.

- [ ] **Step 3: Update SettingsAboutView.tsx**

Add update check UI:

- Replace the TODO comment with actual implementation
- Add update notification card when updateInfo is not null
- Add loading state for check button
- Add skip version button

- [ ] **Step 4: Add update notification card component**

```typescript
// Add inside SettingsAboutView.tsx

interface UpdateNotificationProps {
  updateInfo: UpdateInfo;
  onSkip: () => void;
}

function UpdateNotification({ updateInfo, onSkip }: UpdateNotificationProps) {
  return (
    <div className="mt-4 p-4 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">🎉</span>
        <span className="font-medium text-[var(--color-primary)]">
          发现新版本 {updateInfo.latest_version}
        </span>
      </div>

      <div className="text-sm text-[var(--color-text-secondary)] mb-3 whitespace-pre-line">
        {updateInfo.release_notes.slice(0, 200)}
        {updateInfo.release_notes.length > 200 && "..."}
      </div>

      <div className="flex gap-2">
        <a
          href={updateInfo.release_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-md text-sm hover:opacity-90"
        >
          立即下载
        </a>
        <a
          href={updateInfo.release_url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 border border-[var(--color-border)] rounded-md text-sm hover:bg-[var(--color-surface)]"
        >
          查看详情
        </a>
        <button
          onClick={onSkip}
          className="px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
        >
          跳过此版本
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Run TypeScript check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 6: Test manually**

1. Open Settings > About
2. Verify update check runs on load
3. If update available, verify notification shows
4. Click skip version, verify notification dismisses
5. Click check update button, verify loading state

- [ ] **Step 7: Commit frontend changes**

```bash
git add src/hooks/useAutoUpdate.ts src/app/views/SettingsAboutView.tsx
git commit -m "feat(update): add update check UI in settings"
```

---

## Task 4: Testing

**Files:**

- Create: `src-tauri/src/commands/update_test.rs` (optional, for unit tests)
- Create: `src/hooks/__tests__/useAutoUpdate.test.ts`

- [ ] **Step 1: Write useAutoUpdate hook tests**

```typescript
// src/hooks/__tests__/useAutoUpdate.test.ts
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAutoUpdate } from "../useAutoUpdate";

vi.mock("@/lib/api/update", () => ({
  checkForUpdates: vi.fn(),
  skipVersion: vi.fn(),
}));

describe("useAutoUpdate", () => {
  it("should start with checking=true on mount", () => {
    const { result } = renderHook(() => useAutoUpdate());
    expect(result.current.checking).toBe(true);
  });

  it("should set updateInfo after successful check", async () => {
    const mockInfo = {
      has_update: true,
      current_version: "0.6.0",
      latest_version: "0.7.0",
      release_url: "https://github.com/...",
      release_notes: "New features",
    };

    vi.mocked(checkForUpdates).mockResolvedValue(mockInfo);

    const { result } = renderHook(() => useAutoUpdate());

    await act(async () => {
      await new Promise((r) => setTimeout(r, 100));
    });

    expect(result.current.updateInfo).toEqual(mockInfo);
    expect(result.current.checking).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test src/hooks/__tests__/useAutoUpdate.test.ts
```

Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add src/hooks/__tests__/
git commit -m "test(update): add useAutoUpdate hook tests"
```

---

## Verification Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Manual test: Update check works on app startup
- [ ] Manual test: Manual check button works
- [ ] Manual test: Skip version persists across restarts
- [ ] Manual test: Download link opens correct URL

---

## Notes

- GitHub API has rate limit of 60 requests/hour for unauthenticated requests
- Consider adding GitHub token for higher rate limits in production
- The 24-hour throttle is handled on the backend to work across sessions
