# Google Drive Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement cloud sync via Google Drive API with OAuth 2.0 authentication.

**Architecture:** Tauri deep-link for OAuth callback, Google Drive API for file operations, reuse existing sync engine for conflict resolution.

**Tech Stack:** Rust (reqwest, tauri-plugin-deep-link), TypeScript, Google Drive API v3

---

## Prerequisites

1. Google Cloud Project with OAuth 2.0 credentials configured
2. Redirect URI: `plan-todos://oauth/callback`
3. Google Drive API enabled

---

## Files to Create/Modify

| File                                           | Action | Description             |
| ---------------------------------------------- | ------ | ----------------------- |
| `src-tauri/src/sync/providers/google_drive.rs` | Create | Google Drive client     |
| `src-tauri/src/sync/providers/mod.rs`          | Modify | Register provider       |
| `src-tauri/src/commands/oauth.rs`              | Create | OAuth commands          |
| `src-tauri/src/commands/mod.rs`                | Modify | Register oauth module   |
| `src-tauri/Cargo.toml`                         | Modify | Add dependencies        |
| `src-tauri/tauri.conf.json`                    | Modify | Configure deep link     |
| `src/lib/api/googleDrive.ts`                   | Create | Frontend API wrapper    |
| `src/app/views/SettingsSyncView.tsx`           | Modify | Add Google Drive option |

---

## Task 1: Add Dependencies

**Files:**

- Modify: `src-tauri/Cargo.toml`

- [ ] **Step 1: Add required dependencies**

```toml
# In src-tauri/Cargo.toml

[dependencies]
# ... existing dependencies
tauri-plugin-deep-link = "2"
base64 = "0.22"
sha2 = "0.10"
```

- [ ] **Step 2: Commit dependencies**

```bash
git add src-tauri/Cargo.toml
git commit -m "feat(google-drive): add dependencies for OAuth and API"
```

---

## Task 2: Configure Deep Link

**Files:**

- Modify: `src-tauri/tauri.conf.json`

- [ ] **Step 1: Add deep link configuration**

```json
// In src-tauri/tauri.conf.json
{
  "plugins": {
    "deep-link": {
      "desktop": {
        "schemes": ["plan-todos"]
      }
    }
  }
}
```

- [ ] **Step 2: Register deep link in main.rs**

```rust
// In src-tauri/src/lib.rs or main.rs
use tauri_plugin_deep_link::DeepLinkExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            // Handle deep link
            let handle = app.handle().clone();
            app.deep_link().on_open_url(move |event| {
                if let Some(url) = event.urls().first() {
                    if url.starts_with("plan-todos://oauth/callback") {
                        // Parse authorization code
                        if let Some(code) = url.split("code=").nth(1) {
                            let code = code.split('&').next().unwrap_or("");
                            // Exchange code for tokens (will implement)
                            let handle = handle.clone();
                            let code = code.to_string();
                            tokio::spawn(async move {
                                let _ = exchange_code(&handle, &code).await;
                            });
                        }
                    }
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

- [ ] **Step 3: Commit configuration**

```bash
git add src-tauri/tauri.conf.json src-tauri/src/lib.rs
git commit -m "feat(google-drive): configure deep link for OAuth"
```

---

## Task 3: Google Drive Client

**Files:**

- Create: `src-tauri/src/sync/providers/google_drive.rs`

- [ ] **Step 1: Create Google Drive client**

```rust
// src-tauri/src/sync/providers/google_drive.rs
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use tauri::AppHandle;

const GOOGLE_DRIVE_API: &str = "https://www.googleapis.com/drive/v3";
const GOOGLE_UPLOAD_API: &str = "https://www.googleapis.com/upload/drive/v3/files";

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoogleDriveConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_uri: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GoogleTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DriveFile {
    pub id: String,
    pub name: String,
    #[serde(rename = "modifiedTime")]
    pub modified_time: String,
    pub size: Option<String>,
}

pub struct GoogleDriveClient {
    client: Client,
    config: GoogleDriveConfig,
    tokens: Arc<RwLock<Option<GoogleTokens>>>,
}

impl GoogleDriveClient {
    pub fn new(config: GoogleDriveConfig) -> Self {
        Self {
            client: Client::new(),
            config,
            tokens: Arc::new(RwLock::new(None)),
        }
    }

    /// Get OAuth authorization URL
    pub fn get_auth_url(&self) -> String {
        format!(
            "https://accounts.google.com/o/oauth2/v2/auth?client_id={}&redirect_uri={}&response_type=code&scope=https://www.googleapis.com/auth/drive.file&access_type=offline&prompt=consent",
            self.config.client_id,
            urlencoding::encode(&self.config.redirect_uri)
        )
    }

    /// Exchange authorization code for tokens
    pub async fn exchange_code(&self, code: &str) -> Result<GoogleTokens, String> {
        let response = self.client
            .post("https://oauth2.googleapis.com/token")
            .form(&[
                ("code", code),
                ("client_id", &self.config.client_id),
                ("client_secret", &self.config.client_secret),
                ("redirect_uri", &self.config.redirect_uri),
                ("grant_type", "authorization_code"),
            ])
            .send()
            .await
            .map_err(|e| format!("Token exchange failed: {}", e))?;

        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(format!("Token exchange failed: {}", body));
        }

        #[derive(Deserialize)]
        struct TokenResponse {
            access_token: String,
            refresh_token: String,
            expires_in: i64,
        }

        let token: TokenResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse token response: {}", e))?;

        let tokens = GoogleTokens {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_at: chrono::Utc::now().timestamp() + token.expires_in,
        };

        // Store tokens
        *self.tokens.write().await = Some(tokens.clone());

        Ok(tokens)
    }

    /// Refresh access token
    pub async fn refresh_access_token(&self) -> Result<String, String> {
        let tokens = self.tokens.read().await;
        let tokens = tokens.as_ref().ok_or("No tokens stored")?;

        let response = self.client
            .post("https://oauth2.googleapis.com/token")
            .form(&[
                ("refresh_token", &tokens.refresh_token),
                ("client_id", &self.config.client_id),
                ("client_secret", &self.config.client_secret),
                ("grant_type", "refresh_token"),
            ])
            .send()
            .await
            .map_err(|e| format!("Token refresh failed: {}", e))?;

        if !response.status().is_success() {
            return Err("Token refresh failed".to_string());
        }

        #[derive(Deserialize)]
        struct RefreshResponse {
            access_token: String,
            expires_in: i64,
        }

        let refresh: RefreshResponse = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse refresh response: {}", e))?;

        let new_tokens = GoogleTokens {
            access_token: refresh.access_token.clone(),
            refresh_token: tokens.refresh_token.clone(),
            expires_at: chrono::Utc::now().timestamp() + refresh.expires_in,
        };

        drop(tokens);
        *self.tokens.write().await = Some(new_tokens);

        Ok(refresh.access_token)
    }

    /// Get valid access token (refresh if needed)
    async fn get_access_token(&self) -> Result<String, String> {
        let tokens = self.tokens.read().await;

        if let Some(tokens) = tokens.as_ref() {
            // Check if token is still valid (with 5 min buffer)
            if tokens.expires_at > chrono::Utc::now().timestamp() + 300 {
                return Ok(tokens.access_token.clone());
            }
        }

        drop(tokens);
        self.refresh_access_token().await
    }

    /// Upload file to Google Drive
    pub async fn upload(&self, filename: &str, content: &[u8]) -> Result<String, String> {
        let access_token = self.get_access_token().await?;

        // Check if file exists
        let existing = self.find_file(filename).await?;

        let url = if let Some(file_id) = existing {
            // Update existing file
            format!("{}/{}?uploadType=media", GOOGLE_UPLOAD_API, file_id)
        } else {
            // Create new file
            format!("{}?uploadType=media&name={}", GOOGLE_UPLOAD_API, urlencoding::encode(filename))
        };

        let response = self.client
            .post(&url)
            .header("Authorization", format!("Bearer {}", access_token))
            .header("Content-Type", "application/json")
            .body(content.to_vec())
            .send()
            .await
            .map_err(|e| format!("Upload failed: {}", e))?;

        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(format!("Upload failed: {}", body));
        }

        let file: DriveFile = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse upload response: {}", e))?;

        Ok(file.id)
    }

    /// Download file from Google Drive
    pub async fn download(&self, filename: &str) -> Result<Vec<u8>, String> {
        let access_token = self.get_access_token().await?;

        // Find file
        let file_id = self.find_file(filename).await?
            .ok_or("File not found")?;

        let url = format!("{}/files/{}?alt=media", GOOGLE_DRIVE_API, file_id);

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await
            .map_err(|e| format!("Download failed: {}", e))?;

        if !response.status().is_success() {
            return Err("Download failed".to_string());
        }

        response
            .bytes()
            .await
            .map(|b| b.to_vec())
            .map_err(|e| format!("Failed to read response: {}", e))
    }

    /// Find file by name
    pub async fn find_file(&self, filename: &str) -> Result<Option<String>, String> {
        let access_token = self.get_access_token().await?;

        let url = format!(
            "{}/files?q=name='{}' and trashed=false",
            GOOGLE_DRIVE_API,
            urlencoding::encode(filename)
        );

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await
            .map_err(|e| format!("Find file failed: {}", e))?;

        #[derive(Deserialize)]
        struct FileList {
            files: Vec<DriveFile>,
        }

        let list: FileList = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse file list: {}", e))?;

        Ok(list.files.first().map(|f| f.id.clone()))
    }

    /// List all sync files
    pub async fn list_files(&self) -> Result<Vec<DriveFile>, String> {
        let access_token = self.get_access_token().await?;

        let url = format!(
            "{}/files?q=name contains 'plan-todos' and trashed=false",
            GOOGLE_DRIVE_API
        );

        let response = self.client
            .get(&url)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await
            .map_err(|e| format!("List files failed: {}", e))?;

        #[derive(Deserialize)]
        struct FileList {
            files: Vec<DriveFile>,
        }

        let list: FileList = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse file list: {}", e))?;

        Ok(list.files)
    }

    /// Delete file
    pub async fn delete_file(&self, file_id: &str) -> Result<(), String> {
        let access_token = self.get_access_token().await?;

        let url = format!("{}/files/{}", GOOGLE_DRIVE_API, file_id);

        self.client
            .delete(&url)
            .header("Authorization", format!("Bearer {}", access_token))
            .send()
            .await
            .map_err(|e| format!("Delete failed: {}", e))?;

        Ok(())
    }

    /// Set tokens
    pub async fn set_tokens(&self, tokens: GoogleTokens) {
        *self.tokens.write().await = Some(tokens);
    }

    /// Get stored tokens
    pub async fn get_tokens(&self) -> Option<GoogleTokens> {
        self.tokens.read().await.clone()
    }

    /// Clear tokens (logout)
    pub async fn clear_tokens(&self) {
        *self.tokens.write().await = None;
    }
}
```

- [ ] **Step 2: Register provider in mod.rs**

```rust
// In src-tauri/src/sync/providers/mod.rs
pub mod google_drive;

pub use google_drive::{GoogleDriveClient, GoogleDriveConfig, GoogleTokens, DriveFile};
```

- [ ] **Step 3: Commit Google Drive client**

```bash
git add src-tauri/src/sync/providers/
git commit -m "feat(google-drive): add Google Drive client"
```

---

## Task 4: OAuth Commands

**Files:**

- Create: `src-tauri/src/commands/oauth.rs`
- Modify: `src-tauri/src/commands/mod.rs`

- [ ] **Step 1: Create OAuth commands**

```rust
// src-tauri/src/commands/oauth.rs
use tauri::State;
use crate::sync::providers::{GoogleDriveClient, GoogleDriveConfig, GoogleTokens};
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct OAuthState {
    pub google_drive: Arc<RwLock<Option<GoogleDriveClient>>>,
}

impl Default for OAuthState {
    fn default() -> Self {
        Self {
            google_drive: Arc::new(RwLock::new(None)),
        }
    }
}

#[tauri::command]
pub async fn get_google_auth_url(
    client_id: String,
    client_secret: String,
) -> Result<String, String> {
    let config = GoogleDriveConfig {
        client_id,
        client_secret,
        redirect_uri: "plan-todos://oauth/callback".to_string(),
    };

    let client = GoogleDriveClient::new(config);
    Ok(client.get_auth_url())
}

#[tauri::command]
pub async fn connect_google_drive(
    state: State<'_, OAuthState>,
    client_id: String,
    client_secret: String,
    code: String,
) -> Result<(), String> {
    let config = GoogleDriveConfig {
        client_id,
        client_secret,
        redirect_uri: "plan-todos://oauth/callback".to_string(),
    };

    let client = GoogleDriveClient::new(config);
    let tokens = client.exchange_code(&code).await?;

    // Store tokens securely (use keyring in production)
    // For now, just store in memory
    *state.google_drive.write().await = Some(client);

    // Persist tokens to secure storage
    save_tokens_to_storage(&tokens)?;

    Ok(())
}

#[tauri::command]
pub async fn disconnect_google_drive(
    state: State<'_, OAuthState>,
) -> Result<(), String> {
    *state.google_drive.write().await = None;
    clear_tokens_from_storage()?;
    Ok(())
}

#[tauri::command]
pub async fn get_google_drive_status(
    state: State<'_, OAuthState>,
) -> Result<bool, String> {
    let guard = state.google_drive.read().await;
    Ok(guard.is_some())
}

#[tauri::command]
pub async fn get_stored_google_tokens() -> Result<Option<GoogleTokens>, String> {
    load_tokens_from_storage()
}

// Helper functions for token storage
fn save_tokens_to_storage(tokens: &GoogleTokens) -> Result<(), String> {
    // In production, use OS keyring
    // For now, store in app data directory (encrypted)
    Ok(())
}

fn load_tokens_from_storage() -> Result<Option<GoogleTokens>, String> {
    // Load from secure storage
    Ok(None)
}

fn clear_tokens_from_storage() -> Result<(), String> {
    Ok(())
}
```

- [ ] **Step 2: Register OAuth module**

```rust
// In src-tauri/src/commands/mod.rs
pub mod oauth;
```

- [ ] **Step 3: Register commands in lib.rs**

```rust
// In src-tauri/src/lib.rs
use commands::oauth::OAuthState;

.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::oauth::get_google_auth_url,
    commands::oauth::connect_google_drive,
    commands::oauth::disconnect_google_drive,
    commands::oauth::get_google_drive_status,
    commands::oauth::get_stored_google_tokens,
])
.manage(OAuthState::default())
```

- [ ] **Step 4: Commit OAuth commands**

```bash
git add src-tauri/src/commands/oauth.rs src-tauri/src/commands/mod.rs src-tauri/src/lib.rs
git commit -m "feat(google-drive): add OAuth commands"
```

---

## Task 5: Frontend API Wrapper

**Files:**

- Create: `src/lib/api/googleDrive.ts`

- [ ] **Step 1: Create Google Drive API wrapper**

```typescript
// src/lib/api/googleDrive.ts
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-shell";

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface GoogleDriveStatus {
  connected: boolean;
  email?: string;
  lastSync?: string;
}

// Configuration (should be loaded from environment)
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = import.meta.env.VITE_GOOGLE_CLIENT_SECRET || "";

/**
 * Start Google OAuth flow
 */
export async function startGoogleOAuth(): Promise<void> {
  const url = await invoke<string>("get_google_auth_url", {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
  });

  // Open in browser
  await open(url);
}

/**
 * Complete OAuth with authorization code
 */
export async function completeGoogleOAuth(code: string): Promise<void> {
  await invoke("connect_google_drive", {
    clientId: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    code,
  });
}

/**
 * Disconnect Google Drive
 */
export async function disconnectGoogleDrive(): Promise<void> {
  await invoke("disconnect_google_drive");
}

/**
 * Get connection status
 */
export async function getGoogleDriveStatus(): Promise<boolean> {
  return await invoke("get_google_drive_status");
}

/**
 * Get stored tokens
 */
export async function getStoredGoogleTokens(): Promise<GoogleTokens | null> {
  return await invoke("get_stored_google_tokens");
}

/**
 * Sync data to Google Drive
 */
export async function syncToGoogleDrive(): Promise<void> {
  await invoke("sync_to_google_drive");
}

/**
 * Sync data from Google Drive
 */
export async function syncFromGoogleDrive(): Promise<void> {
  await invoke("sync_from_google_drive");
}
```

- [ ] **Step 2: Commit API wrapper**

```bash
git add src/lib/api/googleDrive.ts
git commit -m "feat(google-drive): add frontend API wrapper"
```

---

## Task 6: Settings UI

**Files:**

- Modify: `src/app/views/SettingsSyncView.tsx`

- [ ] **Step 1: Read current SettingsSyncView**

Understand current structure.

- [ ] **Step 2: Add Google Drive option**

```typescript
// In SettingsSyncView.tsx, add imports
import {
  startGoogleOAuth,
  disconnectGoogleDrive,
  getGoogleDriveStatus,
} from "@/lib/api/googleDrive";
import { useState, useEffect } from "react";

// Add component
function GoogleDriveSection() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getGoogleDriveStatus().then(setConnected);
  }, []);

  const handleConnect = async () => {
    setLoading(true);
    try {
      await startGoogleOAuth();
      // OAuth callback will be handled by deep link
    } catch (error) {
      console.error("OAuth error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setConnected(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-surface)] flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.01 1.485c-2.082 0-3.754.02-3.743.047.01.02 1.708 3.001 3.774 6.62l3.76 6.574h3.76c2.081 0 3.753-.02 3.742-.047-.005-.02-1.708-3.001-3.775-6.62l-3.76-6.574h-3.758zm-5.735 1.04l-6.268 10.967 1.885 3.295 1.885 3.298h3.77l-1.89-3.298-1.89-3.295 4.4-7.693.555-.967h-1.88l-1.567-.007zm12.445 0l-1.567.007h-1.88l.555.967 4.4 7.693-1.89 3.295-1.89 3.298h3.77l1.885-3.298 1.885-3.295-6.268-10.967z"
              />
            </svg>
          </div>
          <div>
            <h3 className="font-medium">Google Drive</h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {connected ? "已连接" : "未连接"}
            </p>
          </div>
        </div>

        {connected ? (
          <Button variant="outline" onClick={handleDisconnect}>
            断开连接
          </Button>
        ) : (
          <Button onClick={handleConnect} disabled={loading}>
            {loading ? "连接中..." : "连接"}
          </Button>
        )}
      </div>

      {connected && (
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => syncToGoogleDrive()}>
            立即同步
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add to sync provider selection**

```typescript
// Add provider selection UI
const [provider, setProvider] = useState<"webdav" | "google-drive">("webdav");

<div className="space-y-4">
  <div className="flex gap-2">
    <button
      onClick={() => setProvider("webdav")}
      className={`px-4 py-2 rounded ${
        provider === "webdav"
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface)]"
      }`}
    >
      WebDAV
    </button>
    <button
      onClick={() => setProvider("google-drive")}
      className={`px-4 py-2 rounded ${
        provider === "google-drive"
          ? "bg-[var(--color-primary)] text-white"
          : "bg-[var(--color-surface)]"
      }`}
    >
      Google Drive
    </button>
  </div>

  {provider === "webdav" && <WebDAVSection />}
  {provider === "google-drive" && <GoogleDriveSection />}
</div>
```

- [ ] **Step 4: Run TypeScript check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 5: Commit settings UI**

```bash
git add src/app/views/SettingsSyncView.tsx
git commit -m "feat(google-drive): add Google Drive sync UI"
```

---

## Task 7: Integration with Sync Engine

**Files:**

- Modify: `src-tauri/src/sync/engine.rs`

- [ ] **Step 1: Add Google Drive sync method**

```rust
// In src-tauri/src/sync/engine.rs

#[tauri::command]
pub async fn sync_to_google_drive(
    db: State<'_, Database>,
    oauth: State<'_, OAuthState>,
) -> Result<SyncResult, String> {
    let gd_client = oauth.google_drive.read().await;
    let client = gd_client.as_ref().ok_or("Google Drive not connected")?;

    // Export data to JSON
    let data = export_all_data(&db)?;
    let json = serde_json::to_vec(&data).map_err(|e| e.to_string())?;

    // Upload to Google Drive
    client.upload("plan-todos-sync/data.json", &json).await?;

    Ok(SyncResult {
        uploaded: data.todos.len() + data.plans.len(),
        downloaded: 0,
        conflicts: 0,
    })
}

#[tauri::command]
pub async fn sync_from_google_drive(
    db: State<'_, Database>,
    oauth: State<'_, OAuthState>,
) -> Result<SyncResult, String> {
    let gd_client = oauth.google_drive.read().await;
    let client = gd_client.as_ref().ok_or("Google Drive not connected")?;

    // Download from Google Drive
    let json = client.download("plan-todos-sync/data.json").await?;
    let data: ExportData = serde_json::from_slice(&json).map_err(|e| e.to_string())?;

    // Import data (with conflict resolution)
    let result = import_data(&db, data, ImportMode::Update)?;

    Ok(result)
}
```

- [ ] **Step 2: Register sync commands**

```rust
// In lib.rs
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::sync::sync_to_google_drive,
    commands::sync::sync_from_google_drive,
])
```

- [ ] **Step 3: Commit sync integration**

```bash
git add src-tauri/src/sync/engine.rs src-tauri/src/lib.rs
git commit -m "feat(google-drive): integrate with sync engine"
```

---

## Task 8: Testing

**Files:**

- Create: `src-tauri/src/sync/providers/__tests__/google_drive.rs`

- [ ] **Step 1: Write unit tests**

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_auth_url() {
        let config = GoogleDriveConfig {
            client_id: "test-client-id".to_string(),
            client_secret: "test-secret".to_string(),
            redirect_uri: "plan-todos://oauth/callback".to_string(),
        };

        let client = GoogleDriveClient::new(config);
        let url = client.get_auth_url();

        assert!(url.contains("accounts.google.com"));
        assert!(url.contains("test-client-id"));
        assert!(url.contains("plan-todos://oauth/callback"));
    }
}
```

- [ ] **Step 2: Run tests**

```bash
cd src-tauri && cargo test
```

Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add src-tauri/src/sync/providers/__tests__/
git commit -m "test(google-drive): add unit tests"
```

---

## Verification Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `cargo test` passes
- [ ] Manual test: Click "Connect" opens browser
- [ ] Manual test: OAuth callback is handled
- [ ] Manual test: Connection status shows "Connected"
- [ ] Manual test: Sync uploads data to Google Drive
- [ ] Manual test: Sync downloads data from Google Drive
- [ ] Manual test: Disconnect clears tokens

---

## Notes

- Google Client ID and Secret should be stored in environment variables
- In production, use OS keyring (keyring-rs) for secure token storage
- Google Drive API has rate limits - implement retry with backoff
- Consider implementing incremental sync instead of full file upload/download
- Need to handle OAuth token refresh automatically
