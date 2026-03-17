# SettingsNotificationsView Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Settings > Notifications page with global notification settings, entity defaults, do-not-disturb, channel priority, and retention settings.

**Architecture:**

- Backend: SQLite table + Rust models + Tauri commands
- Frontend: React Query for state + 6 modular components + drag-drop sorting
- Pattern: Following existing SettingsChannelsView and SettingsDailySummaryView patterns

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Tauri v2 (Rust), React Query, @dnd-kit

---

## File Structure

### Backend (Rust)

| File                                                               | Responsibility             |
| ------------------------------------------------------------------ | -------------------------- |
| `src-tauri/migrations/2026_03_14_global_notification_settings.sql` | Database migration         |
| `src-tauri/src/models/notification.rs`                             | Rust structs for settings  |
| `src-tauri/src/commands/notifications.rs:123`                      | Add 3 new commands         |
| `src-tauri/src/db.rs:456`                                          | Add settings query helpers |

### Frontend (TypeScript/React)

| File                                                | Responsibility             |
| --------------------------------------------------- | -------------------------- |
| `src/lib/types/notification.ts:100`                 | Extend types               |
| `src/hooks/useGlobalNotificationSettings.ts`        | React Query hooks          |
| `src/components/settings/GlobalTogglesSection.tsx`  | Global switches card       |
| `src/components/settings/ReminderTimeSelector.tsx`  | Multi-select time buttons  |
| `src/components/settings/EntityDefaultsCard.tsx`    | Per-entity-type config     |
| `src/components/settings/DoNotDisturbSection.tsx`   | DND time + repeat settings |
| `src/components/settings/ChannelPrioritySorter.tsx` | Drag-drop sortable list    |
| `src/components/settings/RetentionSettings.tsx`     | Days slider + actions      |
| `src/app/views/SettingsNotificationsView.tsx`       | Main page container        |
| `src/app/settings/notifications/page.tsx`           | Next.js route              |

### Tests

| File                                                              | Responsibility    |
| ----------------------------------------------------------------- | ----------------- |
| `src/components/settings/__tests__/ReminderTimeSelector.test.tsx` | Unit tests        |
| `src/components/settings/__tests__/DoNotDisturbSection.test.tsx`  | Unit tests        |
| `src/app/views/__tests__/SettingsNotificationsView.test.tsx`      | Integration tests |

---

## Chunk 1: Backend Foundation

### Task 1.1: Database Migration

**Files:**

- Create: `src-tauri/migrations/2026_03_14_global_notification_settings.sql`

- [ ] **Step 1: Write migration file**

```sql
-- global_notification_settings table
CREATE TABLE IF NOT EXISTS global_notification_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    enabled BOOLEAN NOT NULL DEFAULT true,
    desktop_notifications BOOLEAN NOT NULL DEFAULT true,
    sound_enabled BOOLEAN NOT NULL DEFAULT false,
    default_reminder_times TEXT NOT NULL DEFAULT '[5, 30, 60]',
    do_not_disturb_enabled BOOLEAN NOT NULL DEFAULT false,
    do_not_disturb_start_time TEXT NOT NULL DEFAULT '22:00',
    do_not_disturb_end_time TEXT NOT NULL DEFAULT '08:00',
    do_not_disturb_repeat TEXT NOT NULL DEFAULT 'daily',
    do_not_disturb_custom_days TEXT,
    entity_defaults TEXT NOT NULL DEFAULT '{"todo":{"enabled":true,"use_global_default":true},"plan":{"enabled":true,"use_global_default":true},"target":{"enabled":true,"use_global_default":true}}',
    channel_priority TEXT NOT NULL DEFAULT '[]',
    history_retention_days INTEGER NOT NULL DEFAULT 30,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default record if not exists
INSERT OR IGNORE INTO global_notification_settings (id) VALUES ('global');

-- Index
CREATE INDEX IF NOT EXISTS idx_global_settings_updated ON global_notification_settings(updated_at);
```

- [ ] **Step 2: Run migration**

```bash
cd src-tauri && cargo sqlx migrate run
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/migrations/2026_03_14_global_notification_settings.sql
git commit -m "feat(notifications): add global_notification_settings table migration"
```

---

### Task 1.2: Rust Models

**Files:**

- Modify: `src-tauri/src/models/notification.rs` (create if not exists)
- Create: `src-tauri/src/models/mod.rs` (export)

- [ ] **Step 1: Write Rust models**

```rust
// src-tauri/src/models/notification.rs

use serde::{Deserialize, Serialize};
use sqlx::FromRow;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoNotDisturbSettings {
    pub enabled: bool,
    pub start_time: String,
    pub end_time: String,
    pub repeat: DoNotDisturbRepeat,
    pub custom_days: Option<Vec<i32>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DoNotDisturbRepeat {
    Daily,
    Weekdays,
    Weekends,
    Custom,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityDefaultSettings {
    pub enabled: bool,
    pub use_global_default: bool,
    pub custom_reminder_times: Option<Vec<i32>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityDefaultsConfig {
    pub todo: EntityDefaultSettings,
    pub plan: EntityDefaultSettings,
    pub target: EntityDefaultSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct GlobalNotificationSettings {
    pub id: String,
    pub enabled: bool,
    pub desktop_notifications: bool,
    pub sound_enabled: bool,
    pub default_reminder_times: String,
    pub do_not_disturb_enabled: bool,
    pub do_not_disturb_start_time: String,
    pub do_not_disturb_end_time: String,
    pub do_not_disturb_repeat: String,
    pub do_not_disturb_custom_days: Option<String>,
    pub entity_defaults: String,
    pub channel_priority: String,
    pub history_retention_days: i32,
    pub created_at: String,
    pub updated_at: String,
}

// Response with parsed JSON fields
#[derive(Debug, Clone, Serialize)]
pub struct GlobalNotificationSettingsResponse {
    pub id: String,
    pub enabled: bool,
    pub desktop_notifications: bool,
    pub sound_enabled: bool,
    pub default_reminder_times: Vec<i32>,
    pub do_not_disturb: DoNotDisturbSettings,
    pub entity_defaults: EntityDefaultsConfig,
    pub channel_priority: Vec<String>,
    pub history_retention_days: i32,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateGlobalNotificationSettingsRequest {
    pub enabled: bool,
    pub desktop_notifications: bool,
    pub sound_enabled: bool,
    pub default_reminder_times: Vec<i32>,
    pub do_not_disturb: DoNotDisturbSettings,
    pub entity_defaults: EntityDefaultsConfig,
    pub channel_priority: Vec<String>,
    pub history_retention_days: i32,
}

#[derive(Debug, Clone, Serialize)]
pub struct CleanupResult {
    pub deleted_count: i64,
    pub remaining_count: i64,
}
```

- [ ] **Step 2: Update models/mod.rs**

```rust
// src-tauri/src/models/mod.rs
pub mod notification;
```

- [ ] **Step 3: Commit**

```bash
git add src-tauri/src/models/
git commit -m "feat(notifications): add GlobalNotificationSettings Rust models"
```

---

### Task 1.3: Backend API Commands

**Files:**

- Modify: `src-tauri/src/commands/notifications.rs`

- [ ] **Step 1: Add imports and helper functions**

```rust
// At top of file
use crate::models::notification::*;
use serde_json;

// Helper: Parse settings from DB row
fn parse_global_settings(row: GlobalNotificationSettings) -> Result<GlobalNotificationSettingsResponse, String> {
    let default_reminder_times: Vec<i32> = serde_json::from_str(&row.default_reminder_times)
        .map_err(|e| format!("Failed to parse reminder times: {}", e))?;

    let do_not_disturb = DoNotDisturbSettings {
        enabled: row.do_not_disturb_enabled,
        start_time: row.do_not_disturb_start_time.clone(),
        end_time: row.do_not_disturb_end_time.clone(),
        repeat: match row.do_not_disturb_repeat.as_str() {
            "daily" => DoNotDisturbRepeat::Daily,
            "weekdays" => DoNotDisturbRepeat::Weekdays,
            "weekends" => DoNotDisturbRepeat::Weekends,
            _ => DoNotDisturbRepeat::Custom,
        },
        custom_days: row.do_not_disturb_custom_days.as_ref()
            .and_then(|s| serde_json::from_str(s).ok()),
    };

    let entity_defaults: EntityDefaultsConfig = serde_json::from_str(&row.entity_defaults)
        .map_err(|e| format!("Failed to parse entity defaults: {}", e))?;

    let channel_priority: Vec<String> = serde_json::from_str(&row.channel_priority)
        .map_err(|e| format!("Failed to parse channel priority: {}", e))?;

    Ok(GlobalNotificationSettingsResponse {
        id: row.id,
        enabled: row.enabled,
        desktop_notifications: row.desktop_notifications,
        sound_enabled: row.sound_enabled,
        default_reminder_times,
        do_not_disturb,
        entity_defaults,
        channel_priority,
        history_retention_days: row.history_retention_days,
        created_at: row.created_at,
        updated_at: row.updated_at,
    })
}
```

- [ ] **Step 2: Add get_global_notification_settings command**

```rust
#[tauri::command]
pub async fn get_global_notification_settings(
    state: State<'_, AppState>,
) -> Result<GlobalNotificationSettingsResponse, String> {
    let db = state.db();

    let row: GlobalNotificationSettings = sqlx::query_as(
        "SELECT * FROM global_notification_settings WHERE id = 'global'"
    )
    .fetch_one(db.pool())
    .await
    .map_err(|e| format!("Failed to fetch settings: {}", e))?;

    parse_global_settings(row)
}
```

- [ ] **Step 3: Add update_global_notification_settings command**

```rust
#[tauri::command]
pub async fn update_global_notification_settings(
    state: State<'_, AppState>,
    request: UpdateGlobalNotificationSettingsRequest,
) -> Result<GlobalNotificationSettingsResponse, String> {
    let db = state.db();

    // Serialize complex fields
    let reminder_times_json = serde_json::to_string(&request.default_reminder_times)
        .map_err(|e| format!("Failed to serialize reminder times: {}", e))?;

    let dnd_repeat = match request.do_not_disturb.repeat {
        DoNotDisturbRepeat::Daily => "daily",
        DoNotDisturbRepeat::Weekdays => "weekdays",
        DoNotDisturbRepeat::Weekends => "weekends",
        DoNotDisturbRepeat::Custom => "custom",
    };

    let dnd_custom_days = request.do_not_disturb.custom_days.as_ref()
        .map(|days| serde_json::to_string(days).ok())
        .flatten();

    let entity_defaults_json = serde_json::to_string(&request.entity_defaults)
        .map_err(|e| format!("Failed to serialize entity defaults: {}", e))?;

    let channel_priority_json = serde_json::to_string(&request.channel_priority)
        .map_err(|e| format!("Failed to serialize channel priority: {}", e))?;

    // Update database
    sqlx::query(
        r#"
        UPDATE global_notification_settings SET
            enabled = ?,
            desktop_notifications = ?,
            sound_enabled = ?,
            default_reminder_times = ?,
            do_not_disturb_enabled = ?,
            do_not_disturb_start_time = ?,
            do_not_disturb_end_time = ?,
            do_not_disturb_repeat = ?,
            do_not_disturb_custom_days = ?,
            entity_defaults = ?,
            channel_priority = ?,
            history_retention_days = ?,
            updated_at = datetime('now')
        WHERE id = 'global'
        "#
    )
    .bind(request.enabled)
    .bind(request.desktop_notifications)
    .bind(request.sound_enabled)
    .bind(reminder_times_json)
    .bind(request.do_not_disturb.enabled)
    .bind(&request.do_not_disturb.start_time)
    .bind(&request.do_not_disturb.end_time)
    .bind(dnd_repeat)
    .bind(dnd_custom_days)
    .bind(entity_defaults_json)
    .bind(channel_priority_json)
    .bind(request.history_retention_days)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to update settings: {}", e))?;

    // Return updated settings
    get_global_notification_settings(state).await
}
```

- [ ] **Step 4: Add cleanup_notification_history command**

```rust
#[tauri::command]
pub async fn cleanup_notification_history(
    state: State<'_, AppState>,
    retention_days: i32,
) -> Result<CleanupResult, String> {
    let db = state.db();

    // Get count before deletion
    let total_count: i64 = sqlx::query_scalar(
        "SELECT COUNT(*) FROM notification_history"
    )
    .fetch_one(db.pool())
    .await
    .map_err(|e| format!("Failed to count history: {}", e))?;

    // Delete old records
    let result = sqlx::query(
        "DELETE FROM notification_history WHERE created_at < datetime('now', '-' || ? || ' days')"
    )
    .bind(retention_days)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to cleanup history: {}", e))?;

    let deleted_count = result.rows_affected() as i64;
    let remaining_count = total_count - deleted_count;

    Ok(CleanupResult {
        deleted_count,
        remaining_count,
    })
}
```

- [ ] **Step 5: Export commands in main.rs**

Update `src-tauri/src/main.rs` to include the new commands:

```rust
.tauri::generate_handler![
    // ... existing commands ...
    notifications::get_global_notification_settings,
    notifications::update_global_notification_settings,
    notifications::cleanup_notification_history,
]
```

- [ ] **Step 6: Commit**

```bash
git add src-tauri/src/commands/notifications.rs src-tauri/src/main.rs
git commit -m "feat(notifications): add global settings CRUD APIs"
```

---

## Chunk 2: Frontend Types and Hooks

### Task 2.1: Extend TypeScript Types

**Files:**

- Modify: `src/lib/types/notification.ts`

- [ ] **Step 1: Add new types**

```typescript
// Add at end of file (line ~136)

/**
 * DoNotDisturbRepeat - 免打扰重复模式
 */
export type DoNotDisturbRepeat =
  | "daily" // 每天
  | "weekdays" // 工作日
  | "weekends" // 周末
  | "custom"; // 自定义

/**
 * DoNotDisturbSettings - 免打扰设置
 */
export interface DoNotDisturbSettings {
  enabled: boolean;
  start_time: string; // "HH:MM"
  end_time: string; // "HH:MM"
  repeat: DoNotDisturbRepeat;
  custom_days?: number[]; // 0=周日, 1=周一, ...
}

/**
 * EntityNotificationDefaults - 实体类型默认通知配置
 */
export interface EntityNotificationDefaults {
  enabled: boolean;
  use_global_default: boolean;
  custom_reminder_times?: number[];
}

/**
 * EntityDefaultsConfig - 所有实体类型的默认配置
 */
export interface EntityDefaultsConfig {
  todo: EntityNotificationDefaults;
  plan: EntityNotificationDefaults;
  target: EntityNotificationDefaults;
}

/**
 * GlobalNotificationSettings - 全局通知设置
 */
export interface GlobalNotificationSettings {
  id: string;
  enabled: boolean;
  desktop_notifications: boolean;
  sound_enabled: boolean;
  default_reminder_times: number[];
  do_not_disturb: DoNotDisturbSettings;
  entity_defaults: EntityDefaultsConfig;
  channel_priority: string[];
  history_retention_days: number;
  created_at: string;
  updated_at: string;
}

/**
 * UpdateGlobalNotificationSettingsRequest - 更新请求
 */
export interface UpdateGlobalNotificationSettingsRequest {
  enabled: boolean;
  desktop_notifications: boolean;
  sound_enabled: boolean;
  default_reminder_times: number[];
  do_not_disturb: DoNotDisturbSettings;
  entity_defaults: EntityDefaultsConfig;
  channel_priority: string[];
  history_retention_days: number;
}

/**
 * GlobalNotificationSettingsResponse - API 响应
 */
export interface GlobalNotificationSettingsResponse {
  settings: GlobalNotificationSettings;
  available_channels: NotificationPlugin[];
}

/**
 * CleanupResult - 清理结果
 */
export interface CleanupResult {
  deleted_count: number;
  remaining_count: number;
}

/**
 * NotificationSettingsFormState - 表单状态
 */
export interface NotificationSettingsFormState {
  enabled: boolean;
  desktop_notifications: boolean;
  sound_enabled: boolean;
  default_reminder_times: number[];
  do_not_disturb: DoNotDisturbSettings;
  entity_defaults: EntityDefaultsConfig;
  channel_priority: string[];
  history_retention_days: number;
}

// 提醒时间预设选项
export const REMINDER_TIME_OPTIONS = [
  { value: 5, label: "5分钟", icon: "⚡", description: "截止前5分钟" },
  { value: 15, label: "15分钟", icon: "⏱️", description: "截止前15分钟" },
  { value: 30, label: "30分钟", icon: "🕐", description: "截止前30分钟" },
  { value: 60, label: "1小时", icon: "🕑", description: "截止前1小时" },
  { value: 1440, label: "1天", icon: "📅", description: "截止前1天" },
] as const;

// 免打扰重复选项
export const DO_NOT_DISTURB_REPEAT_OPTIONS = [
  { value: "daily", label: "每天" },
  { value: "weekdays", label: "工作日" },
  { value: "weekends", label: "周末" },
  { value: "custom", label: "自定义" },
] as const;

// 星期选项
export const WEEKDAY_OPTIONS = [
  { value: 1, label: "周一", short: "一" },
  { value: 2, label: "周二", short: "二" },
  { value: 3, label: "周三", short: "三" },
  { value: 4, label: "周四", short: "四" },
  { value: 5, label: "周五", short: "五" },
  { value: 6, label: "周六", short: "六" },
  { value: 0, label: "周日", short: "日" },
] as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types/notification.ts
git commit -m "feat(notifications): extend types for global settings"
```

---

### Task 2.2: React Query Hooks

**Files:**

- Create: `src/hooks/useGlobalNotificationSettings.ts`

- [ ] **Step 1: Write the hooks**

```typescript
// src/hooks/useGlobalNotificationSettings.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import type {
  GlobalNotificationSettingsResponse,
  UpdateGlobalNotificationSettingsRequest,
  CleanupResult,
} from "@/lib/types";

const QUERY_KEY = ["settings", "notifications", "global"];

export function useGlobalNotificationSettings() {
  return useQuery<GlobalNotificationSettingsResponse>({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      return await invoke<GlobalNotificationSettingsResponse>(
        "get_global_notification_settings",
      );
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateGlobalNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation<
    GlobalNotificationSettingsResponse,
    Error,
    UpdateGlobalNotificationSettingsRequest
  >({
    mutationFn: async (settings) => {
      return await invoke<GlobalNotificationSettingsResponse>(
        "update_global_notification_settings",
        { request: settings },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useNotificationHistoryCleanup() {
  const queryClient = useQueryClient();

  return useMutation<CleanupResult, Error, number>({
    mutationFn: async (retentionDays) => {
      return await invoke<CleanupResult>("cleanup_notification_history", {
        retention_days: retentionDays,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "history"],
      });
    },
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useGlobalNotificationSettings.ts
git commit -m "feat(notifications): add React Query hooks for global settings"
```

---

## Chunk 3: UI Components

### Task 3.1: GlobalTogglesSection

**Files:**

- Create: `src/components/settings/GlobalTogglesSection.tsx`
- Create: `src/components/settings/__tests__/GlobalTogglesSection.test.tsx`

- [ ] **Step 1: Write component**

```typescript
// src/components/settings/GlobalTogglesSection.tsx

import { Card } from "@/components/ui";

interface GlobalTogglesSectionProps {
  enabled: boolean;
  desktopNotifications: boolean;
  soundEnabled: boolean;
  onChange: (field: string, value: boolean) => void;
  disabled?: boolean;
}

export function GlobalTogglesSection({
  enabled,
  desktopNotifications,
  soundEnabled,
  onChange,
  disabled = false,
}: GlobalTogglesSectionProps) {
  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-4">全局开关</h3>
      <div className="space-y-4">
        {/* Master Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">启用通知</div>
            <div className="text-sm text-gray-500">
              {enabled
                ? "通知已启用"
                : "通知已禁用，您将不再收到任何提醒"}
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => onChange("enabled", e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
          </label>
        </div>

        {/* Desktop Notifications */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">桌面通知</div>
            <div className="text-sm text-gray-500">在系统托盘显示通知</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={desktopNotifications}
              onChange={(e) =>
                onChange("desktop_notifications", e.target.checked)
              }
              disabled={disabled || !enabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
          </label>
        </div>

        {/* Sound */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <div className="font-medium">声音提醒</div>
            <div className="text-sm text-gray-500">通知到达时播放提示音</div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => onChange("sound_enabled", e.target.checked)}
              disabled={disabled || !enabled}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
          </label>
        </div>
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Write tests**

```typescript
// src/components/settings/__tests__/GlobalTogglesSection.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlobalTogglesSection } from "../GlobalTogglesSection";

describe("GlobalTogglesSection", () => {
  const defaultProps = {
    enabled: true,
    desktopNotifications: true,
    soundEnabled: false,
    onChange: vi.fn(),
  };

  it("renders all toggles", () => {
    render(<GlobalTogglesSection {...defaultProps} />);
    expect(screen.getByText("启用通知")).toBeInTheDocument();
    expect(screen.getByText("桌面通知")).toBeInTheDocument();
    expect(screen.getByText("声音提醒")).toBeInTheDocument();
  });

  it("calls onChange when master toggle is clicked", () => {
    render(<GlobalTogglesSection {...defaultProps} />);
    const toggle = screen.getAllByRole("checkbox")[0];
    fireEvent.click(toggle);
    expect(defaultProps.onChange).toHaveBeenCalledWith("enabled", false);
  });

  it("disables child toggles when master is off", () => {
    render(<GlobalTogglesSection {...defaultProps} enabled={false} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[1]).toBeDisabled();
    expect(checkboxes[2]).toBeDisabled();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm run test -- src/components/settings/__tests__/GlobalTogglesSection.test.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/GlobalTogglesSection.tsx src/components/settings/__tests__/
git commit -m "feat(notifications): add GlobalTogglesSection component"
```

---

### Task 3.2: ReminderTimeSelector

**Files:**

- Create: `src/components/settings/ReminderTimeSelector.tsx`
- Create: `src/components/settings/__tests__/ReminderTimeSelector.test.tsx`

- [ ] **Step 1: Write component**

```typescript
// src/components/settings/ReminderTimeSelector.tsx

import { Card } from "@/components/ui";
import { REMINDER_TIME_OPTIONS } from "@/lib/types";

interface ReminderTimeSelectorProps {
  selectedTimes: number[];
  onChange: (times: number[]) => void;
  disabled?: boolean;
}

export function ReminderTimeSelector({
  selectedTimes,
  onChange,
  disabled = false,
}: ReminderTimeSelectorProps) {
  const toggleTime = (time: number) => {
    if (selectedTimes.includes(time)) {
      onChange(selectedTimes.filter((t) => t !== time));
    } else {
      onChange([...selectedTimes, time].sort((a, b) => a - b));
    }
  };

  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-2">默认提醒时间</h3>
      <p className="text-sm text-gray-500 mb-4">
        为新创建的 Todo/Plan/Target 设置默认提醒时间
      </p>

      <div className="flex flex-wrap gap-2">
        {REMINDER_TIME_OPTIONS.map((option) => {
          const isSelected = selectedTimes.includes(option.value);
          return (
            <button
              key={option.value}
              onClick={() => toggleTime(option.value)}
              disabled={disabled}
              className={`px-4 py-2 rounded-lg border-2 transition-all ${
                isSelected
                  ? "border-teal-500 bg-teal-50 text-teal-700"
                  : "border-gray-200 hover:border-teal-200 text-gray-600"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </button>
          );
        })}
      </div>

      {selectedTimes.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          已选择: {" "}
          {selectedTimes
            .map(
              (t) =>
                REMINDER_TIME_OPTIONS.find((o) => o.value === t)?.label || t
            )
            .join(", ")}
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Write tests**

```typescript
// src/components/settings/__tests__/ReminderTimeSelector.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReminderTimeSelector } from "../ReminderTimeSelector";

describe("ReminderTimeSelector", () => {
  const defaultProps = {
    selectedTimes: [5, 30],
    onChange: vi.fn(),
  };

  it("renders all preset time options", () => {
    render(<ReminderTimeSelector {...defaultProps} />);
    expect(screen.getByText("5分钟")).toBeInTheDocument();
    expect(screen.getByText("30分钟")).toBeInTheDocument();
    expect(screen.getByText("1小时")).toBeInTheDocument();
  });

  it("shows selected times", () => {
    render(<ReminderTimeSelector {...defaultProps} />);
    expect(screen.getByText(/已选择/)).toBeInTheDocument();
  });

  it("calls onChange when selecting time", () => {
    render(<ReminderTimeSelector {...defaultProps} />);
    const button = screen.getByText("1小时");
    fireEvent.click(button);
    expect(defaultProps.onChange).toHaveBeenCalledWith([5, 30, 60]);
  });

  it("calls onChange when deselecting time", () => {
    render(<ReminderTimeSelector {...defaultProps} />);
    const button = screen.getByText("5分钟");
    fireEvent.click(button);
    expect(defaultProps.onChange).toHaveBeenCalledWith([30]);
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm run test -- src/components/settings/__tests__/ReminderTimeSelector.test.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/ReminderTimeSelector.tsx
git commit -m "feat(notifications): add ReminderTimeSelector component"
```

---

### Task 3.3: EntityDefaultsCard

**Files:**

- Create: `src/components/settings/EntityDefaultsCard.tsx`

- [ ] **Step 1: Write component**

```typescript
// src/components/settings/EntityDefaultsCard.tsx

import { Card } from "@/components/ui";
import {
  EntityNotificationDefaults,
  REMINDER_TIME_OPTIONS,
} from "@/lib/types";

interface EntityDefaultsCardProps {
  todo: EntityNotificationDefaults;
  plan: EntityNotificationDefaults;
  target: EntityNotificationDefaults;
  globalReminderTimes: number[];
  onChange: (
    entityType: "todo" | "plan" | "target",
    config: EntityNotificationDefaults
  ) => void;
  disabled?: boolean;
}

const ENTITY_CONFIGS = [
  { type: "todo" as const, label: "待办事项", icon: "✅" },
  { type: "plan" as const, label: "计划", icon: "📋" },
  { type: "target" as const, label: "目标", icon: "🎯" },
];

function EntityConfigItem({
  type,
  label,
  icon,
  config,
  globalReminderTimes,
  onChange,
  disabled,
}: {
  type: "todo" | "plan" | "target";
  label: string;
  icon: string;
  config: EntityNotificationDefaults;
  globalReminderTimes: number[];
  onChange: (config: EntityNotificationDefaults) => void;
  disabled?: boolean;
}) {
  const effectiveReminderTimes = config.use_global_default
    ? globalReminderTimes
    : config.custom_reminder_times || [];

  const toggleReminderTime = (time: number) => {
    const currentTimes = config.custom_reminder_times || [];
    const newTimes = currentTimes.includes(time)
      ? currentTimes.filter((t) => t !== time)
      : [...currentTimes, time].sort((a, b) => a - b);
    onChange({ ...config, custom_reminder_times: newTimes });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="font-medium">{label}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={(e) =>
              onChange({ ...config, enabled: e.target.checked })
            }
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-500" />
        </label>
      </div>

      {config.enabled && (
        <div className="space-y-3">
          {/* Use Global Default */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={config.use_global_default}
              onChange={(e) =>
                onChange({ ...config, use_global_default: e.target.checked })
              }
              disabled={disabled}
              className="w-4 h-4 text-teal-500 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-600">使用全局默认提醒时间</span>
          </label>

          {/* Custom Times (when not using global) */}
          {!config.use_global_default && (
            <div className="flex flex-wrap gap-2">
              {REMINDER_TIME_OPTIONS.map((option) => {
                const isSelected = effectiveReminderTimes.includes(option.value);
                return (
                  <button
                    key={option.value}
                    onClick={() => toggleReminderTime(option.value)}
                    disabled={disabled}
                    className={`px-3 py-1 rounded border transition-all text-sm ${
                      isSelected
                        ? "border-teal-500 bg-teal-50 text-teal-700"
                        : "border-gray-200 hover:border-teal-200 text-gray-600"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EntityDefaultsCard({
  todo,
  plan,
  target,
  globalReminderTimes,
  onChange,
  disabled = false,
}: EntityDefaultsCardProps) {
  const configs = { todo, plan, target };

  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-2">实体类型默认配置</h3>
      <p className="text-sm text-gray-500 mb-4">
        为新创建的各类实体设置默认提醒策略
      </p>

      <div className="space-y-4">
        {ENTITY_CONFIGS.map(({ type, label, icon }) => (
          <EntityConfigItem
            key={type}
            type={type}
            label={label}
            icon={icon}
            config={configs[type]}
            globalReminderTimes={globalReminderTimes}
            onChange={(config) => onChange(type, config)}
            disabled={disabled}
          />
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/settings/EntityDefaultsCard.tsx
git commit -m "feat(notifications): add EntityDefaultsCard component"
```

---

### Task 3.4: DoNotDisturbSection

**Files:**

- Create: `src/components/settings/DoNotDisturbSection.tsx`
- Create: `src/components/settings/__tests__/DoNotDisturbSection.test.tsx`

- [ ] **Step 1: Write component**

```typescript
// src/components/settings/DoNotDisturbSection.tsx

import { Card } from "@/components/ui";
import {
  DoNotDisturbSettings,
  DO_NOT_DISTURB_REPEAT_OPTIONS,
  WEEKDAY_OPTIONS,
} from "@/lib/types";

interface DoNotDisturbSectionProps {
  settings: DoNotDisturbSettings;
  onChange: (settings: DoNotDisturbSettings) => void;
  disabled?: boolean;
}

export function DoNotDisturbSection({
  settings,
  onChange,
  disabled = false,
}: DoNotDisturbSectionProps) {
  const toggleDay = (day: number) => {
    const currentDays = settings.custom_days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    onChange({ ...settings, custom_days: newDays });
  };

  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-2">免打扰时段</h3>

      {/* Enable Toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4">
        <div>
          <div className="font-medium">启用免打扰</div>
          <div className="text-sm text-gray-500">
            在指定时段内不发送任何通知
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              onChange({ ...settings, enabled: e.target.checked })
            }
            disabled={disabled}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-500" />
        </label>
      </div>

      {settings.enabled && (
        <div className="space-y-4">
          {/* Time Range */}
          <div className="flex items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                开始时间
              </label>
              <input
                type="time"
                value={settings.start_time}
                onChange={(e) =>
                  onChange({ ...settings, start_time: e.target.value })
                }
                disabled={disabled}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="text-gray-400 pt-6">→</div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                结束时间
              </label>
              <input
                type="time"
                value={settings.end_time}
                onChange={(e) =>
                  onChange({ ...settings, end_time: e.target.value })
                }
                disabled={disabled}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Cross-day hint */}
          {settings.start_time > settings.end_time && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              💡 跨天时段：{settings.start_time} 到次日 {settings.end_time}
            </div>
          )}

          {/* Repeat Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              重复
            </label>
            <div className="flex flex-wrap gap-2">
              {DO_NOT_DISTURB_REPEAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() =>
                    onChange({ ...settings, repeat: option.value })
                  }
                  disabled={disabled}
                  className={`px-3 py-1 rounded border transition-all text-sm ${
                    settings.repeat === option.value
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-gray-200 hover:border-teal-200 text-gray-600"
                  } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Days */}
          {settings.repeat === "custom" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择日期
              </label>
              <div className="flex gap-2">
                {WEEKDAY_OPTIONS.map((day) => {
                  const isSelected = (settings.custom_days || []).includes(
                    day.value
                  );
                  return (
                    <button
                      key={day.value}
                      onClick={() => toggleDay(day.value)}
                      disabled={disabled}
                      className={`w-10 h-10 rounded-full border transition-all text-sm font-medium ${
                        isSelected
                          ? "border-teal-500 bg-teal-500 text-white"
                          : "border-gray-200 hover:border-teal-200 text-gray-600"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 2: Write tests**

```typescript
// src/components/settings/__tests__/DoNotDisturbSection.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DoNotDisturbSection } from "../DoNotDisturbSection";

describe("DoNotDisturbSection", () => {
  const defaultSettings = {
    enabled: true,
    start_time: "22:00",
    end_time: "08:00",
    repeat: "daily" as const,
    custom_days: [],
  };

  const defaultProps = {
    settings: defaultSettings,
    onChange: vi.fn(),
  };

  it("renders time inputs when enabled", () => {
    render(<DoNotDisturbSection {...defaultProps} />);
    expect(screen.getByDisplayValue("22:00")).toBeInTheDocument();
    expect(screen.getByDisplayValue("08:00")).toBeInTheDocument();
  });

  it("shows cross-day hint when start > end", () => {
    render(<DoNotDisturbSection {...defaultProps} />);
    expect(screen.getByText(/跨天时段/)).toBeInTheDocument();
  });

  it("shows weekday buttons when repeat is custom", () => {
    render(
      <DoNotDisturbSection
        {...defaultProps}
        settings={{ ...defaultSettings, repeat: "custom" }}
      />
    );
    expect(screen.getByText("一")).toBeInTheDocument();
    expect(screen.getByText("日")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run tests**

```bash
npm run test -- src/components/settings/__tests__/DoNotDisturbSection.test.tsx
```

- [ ] **Step 4: Commit**

```bash
git add src/components/settings/DoNotDisturbSection.tsx
git commit -m "feat(notifications): add DoNotDisturbSection component"
```

---

### Task 3.5: ChannelPrioritySorter

**Files:**

- Create: `src/components/settings/ChannelPrioritySorter.tsx`

- [ ] **Step 1: Install dependencies**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

- [ ] **Step 2: Write component**

```typescript
// src/components/settings/ChannelPrioritySorter.tsx

import { Card, Button } from "@/components/ui";
import { NotificationPlugin } from "@/lib/types";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ChannelPrioritySorterProps {
  channels: NotificationPlugin[];
  priority: string[];
  onChange: (priority: string[]) => void;
  disabled?: boolean;
}

const PLUGIN_ICONS: Record<string, string> = {
  feishu: "🔔",
  dingtalk: "💬",
  email: "📧",
  webhook: "🔗",
};

function SortableChannelItem({
  channel,
  index,
}: {
  channel: NotificationPlugin;
  index: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: channel.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100"
    >
      <span className="text-gray-400">⋮⋮</span>
      <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
      <span>{PLUGIN_ICONS[channel.plugin_type] || "📢"}</span>
      <span className="font-medium flex-1">{channel.name}</span>
      <span className="text-sm text-gray-500">
        {channel.plugin_type === "feishu" && "飞书/Lark"}
        {channel.plugin_type === "dingtalk" && "钉钉"}
        {channel.plugin_type === "email" && "邮件"}
        {channel.plugin_type === "webhook" && "Webhook"}
      </span>
      {channel.enabled ? (
        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          已启用
        </span>
      ) : (
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          已禁用
        </span>
      )}
    </div>
  );
}

export function ChannelPrioritySorter({
  channels,
  priority,
  onChange,
  disabled = false,
}: ChannelPrioritySorterProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = priority.indexOf(active.id as string);
      const newIndex = priority.indexOf(over.id as string);
      onChange(arrayMove(priority, oldIndex, newIndex));
    }
  };

  const orderedChannels = priority
    .map((id) => channels.find((c) => c.id === id))
    .filter(Boolean) as NotificationPlugin[];

  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-2">通知渠道优先级</h3>
      <p className="text-sm text-gray-500 mb-4">
        拖拽调整发送顺序，优先级高的渠道将优先尝试发送
      </p>

      {channels.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          暂无通知渠道，请先配置通知渠道
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={disabled ? undefined : handleDragEnd}
        >
          <SortableContext
            items={priority}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {orderedChannels.map((channel, index) => (
                <SortableChannelItem
                  key={channel.id}
                  channel={channel}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="mt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => (window.location.href = "/settings/channels")}
        >
          配置通知渠道
        </Button>
      </div>
    </Card>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/settings/ChannelPrioritySorter.tsx package.json package-lock.json
git commit -m "feat(notifications): add ChannelPrioritySorter with drag-drop"
```

---

### Task 3.6: RetentionSettings

**Files:**

- Create: `src/components/settings/RetentionSettings.tsx`

- [ ] **Step 1: Write component**

```typescript
// src/components/settings/RetentionSettings.tsx

import { Card, Button } from "@/components/ui";

interface RetentionSettingsProps {
  days: number;
  onChange: (days: number) => void;
  onCleanup?: () => void;
  onExport?: () => void;
  disabled?: boolean;
  minDays?: number;
  maxDays?: number;
}

export function RetentionSettings({
  days,
  onChange,
  onCleanup,
  onExport,
  disabled = false,
  minDays = 7,
  maxDays = 365,
}: RetentionSettingsProps) {
  const percentage = ((days - minDays) / (maxDays - minDays)) * 100;

  return (
    <Card className="mb-6">
      <h3 className="font-medium mb-4">高级设置</h3>

      {/* Retention Days Slider */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          通知历史保留时间
        </label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 w-8">{minDays}天</span>
          <div className="flex-1">
            <input
              type="range"
              min={minDays}
              max={maxDays}
              value={days}
              onChange={(e) => onChange(parseInt(e.target.value))}
              disabled={disabled}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-teal-500"
              style={{
                background: `linear-gradient(to right, #14b8a6 0%, #14b8a6 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-teal-600 w-12">
            {days}天
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          超过此时间的通知历史将被自动清理以节省存储空间
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-gray-100">
        {onCleanup && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onCleanup}
            disabled={disabled}
          >
            立即清理历史
          </Button>
        )}
        {onExport && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            disabled={disabled}
          >
            导出历史
          </Button>
        )}
      </div>
    </Card>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/settings/RetentionSettings.tsx
git commit -m "feat(notifications): add RetentionSettings component"
```

---

## Chunk 4: Main Page

### Task 4.1: SettingsNotificationsView

**Files:**

- Create: `src/app/views/SettingsNotificationsView.tsx`
- Create: `src/app/views/__tests__/SettingsNotificationsView.test.tsx`

- [ ] **Step 1: Write the main view**

```typescript
// src/app/views/SettingsNotificationsView.tsx

import { useState, useEffect } from "react";
import { Button, Card } from "@/components/ui";
import {
  GlobalTogglesSection,
  ReminderTimeSelector,
  EntityDefaultsCard,
  DoNotDisturbSection,
  ChannelPrioritySorter,
  RetentionSettings,
} from "@/components/settings";
import {
  useGlobalNotificationSettings,
  useUpdateGlobalNotificationSettings,
  useNotificationHistoryCleanup,
} from "@/hooks/useGlobalNotificationSettings";
import type { NotificationSettingsFormState } from "@/lib/types";

function validateForm(
  data: NotificationSettingsFormState
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (data.default_reminder_times.length === 0) {
    errors.default_reminder_times = "至少选择一个默认提醒时间";
  }

  if (
    data.history_retention_days < 7 ||
    data.history_retention_days > 365
  ) {
    errors.history_retention_days = "保留天数必须在 7-365 之间";
  }

  return errors;
}

export function SettingsNotificationsView() {
  const { data, isLoading } = useGlobalNotificationSettings();
  const updateMutation = useUpdateGlobalNotificationSettings();
  const cleanupMutation = useNotificationHistoryCleanup();

  const [formData, setFormData] = useState<NotificationSettingsFormState>({
    enabled: true,
    desktop_notifications: true,
    sound_enabled: false,
    default_reminder_times: [5, 30, 60],
    do_not_disturb: {
      enabled: false,
      start_time: "22:00",
      end_time: "08:00",
      repeat: "daily",
      custom_days: [],
    },
    entity_defaults: {
      todo: { enabled: true, use_global_default: true },
      plan: { enabled: true, use_global_default: true },
      target: { enabled: true, use_global_default: true },
    },
    channel_priority: [],
    history_retention_days: 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Load data when available
  useEffect(() => {
    if (data?.settings) {
      setFormData({
        enabled: data.settings.enabled,
        desktop_notifications: data.settings.desktop_notifications,
        sound_enabled: data.settings.sound_enabled,
        default_reminder_times: data.settings.default_reminder_times,
        do_not_disturb: data.settings.do_not_disturb,
        entity_defaults: data.settings.entity_defaults,
        channel_priority: data.settings.channel_priority,
        history_retention_days: data.settings.history_retention_days,
      });
      setLastSavedAt(new Date(data.settings.updated_at));
    }
  }, [data]);

  const handleSave = async () => {
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await updateMutation.mutateAsync(formData);
      setLastSavedAt(new Date());
      setErrors({});
      alert("设置已保存");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("保存失败，请重试");
    }
  };

  const handleCleanup = async () => {
    if (!confirm("确定要清理历史通知吗？这将删除超过保留天数的记录。")) {
      return;
    }
    try {
      const result = await cleanupMutation.mutateAsync(
        formData.history_retention_days
      );
      alert(`已清理 ${result.deleted_count} 条历史记录`);
    } catch (error) {
      console.error("Failed to cleanup:", error);
      alert("清理失败");
    }
  };

  const updateFormField = <K extends keyof NotificationSettingsFormState>(
    field: K,
    value: NotificationSettingsFormState[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">设置 &gt; 通知</h2>
        <div className="text-center text-gray-500 py-8">加载中...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">设置 &gt; 通知</h2>

      {/* Global Toggles */}
      <GlobalTogglesSection
        enabled={formData.enabled}
        desktopNotifications={formData.desktop_notifications}
        soundEnabled={formData.sound_enabled}
        onChange={(field, value) =>
          updateFormField(field as keyof NotificationSettingsFormState, value)
        }
        disabled={updateMutation.isPending}
      />

      {/* Reminder Times */}
      <ReminderTimeSelector
        selectedTimes={formData.default_reminder_times}
        onChange={(times) => updateFormField("default_reminder_times", times)}
        disabled={updateMutation.isPending}
      />

      {/* Entity Defaults */}
      <EntityDefaultsCard
        todo={formData.entity_defaults.todo}
        plan={formData.entity_defaults.plan}
        target={formData.entity_defaults.target}
        globalReminderTimes={formData.default_reminder_times}
        onChange={(type, config) =>
          setFormData((prev) => ({
            ...prev,
            entity_defaults: { ...prev.entity_defaults, [type]: config },
          }))
        }
        disabled={updateMutation.isPending}
      />

      {/* Do Not Disturb */}
      <DoNotDisturbSection
        settings={formData.do_not_disturb}
        onChange={(settings) => updateFormField("do_not_disturb", settings)}
        disabled={updateMutation.isPending}
      />

      {/* Channel Priority */}
      <ChannelPrioritySorter
        channels={data?.available_channels || []}
        priority={formData.channel_priority}
        onChange={(priority) => updateFormField("channel_priority", priority)}
        disabled={updateMutation.isPending}
      />

      {/* Retention Settings */}
      <RetentionSettings
        days={formData.history_retention_days}
        onChange={(days) => updateFormField("history_retention_days", days)}
        onCleanup={handleCleanup}
        disabled={updateMutation.isPending || cleanupMutation.isPending}
      />

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="px-8"
        >
          {updateMutation.isPending ? "保存中..." : "保存所有设置"}
        </Button>
        {lastSavedAt && (
          <span className="text-sm text-gray-500">
            上次保存: {lastSavedAt.toLocaleString()}
          </span>
        )}
      </div>

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <Card className="mt-4 border-red-200 bg-red-50">
          <h4 className="text-red-700 font-medium mb-2">请修正以下错误：</h4>
          <ul className="text-sm text-red-600 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create settings components barrel export**

```typescript
// src/components/settings/index.ts

export { GlobalTogglesSection } from "./GlobalTogglesSection";
export { ReminderTimeSelector } from "./ReminderTimeSelector";
export { EntityDefaultsCard } from "./EntityDefaultsCard";
export { DoNotDisturbSection } from "./DoNotDisturbSection";
export { ChannelPrioritySorter } from "./ChannelPrioritySorter";
export { RetentionSettings } from "./RetentionSettings";
```

- [ ] **Step 3: Create Next.js page**

```typescript
// src/app/settings/notifications/page.tsx

import { SettingsNotificationsView } from "@/app/views/SettingsNotificationsView";

export default function SettingsNotificationsPage() {
  return <SettingsNotificationsView />;
}
```

- [ ] **Step 4: Write integration tests**

```typescript
// src/app/views/__tests__/SettingsNotificationsView.test.tsx

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SettingsNotificationsView } from "../SettingsNotificationsView";

vi.mock("@/hooks/useGlobalNotificationSettings", () => ({
  useGlobalNotificationSettings: () => ({
    data: {
      settings: {
        id: "global",
        enabled: true,
        desktop_notifications: true,
        sound_enabled: false,
        default_reminder_times: [5, 30, 60],
        do_not_disturb: {
          enabled: false,
          start_time: "22:00",
          end_time: "08:00",
          repeat: "daily",
          custom_days: [],
        },
        entity_defaults: {
          todo: { enabled: true, use_global_default: true },
          plan: { enabled: true, use_global_default: true },
          target: { enabled: true, use_global_default: true },
        },
        channel_priority: [],
        history_retention_days: 30,
        created_at: "2026-03-14T00:00:00Z",
        updated_at: "2026-03-14T00:00:00Z",
      },
      available_channels: [],
    },
    isLoading: false,
  }),
  useUpdateGlobalNotificationSettings: () => ({
    mutateAsync: vi.fn().mockResolvedValue({}),
    isPending: false,
  }),
  useNotificationHistoryCleanup: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ deleted_count: 0 }),
    isPending: false,
  }),
}));

describe("SettingsNotificationsView", () => {
  const queryClient = new QueryClient();

  it("renders all setting sections", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsNotificationsView />
      </QueryClientProvider>
    );
    expect(screen.getByText("全局开关")).toBeInTheDocument();
    expect(screen.getByText("默认提醒时间")).toBeInTheDocument();
    expect(screen.getByText("实体类型默认配置")).toBeInTheDocument();
    expect(screen.getByText("免打扰时段")).toBeInTheDocument();
  });

  it("shows save button", () => {
    render(
      <QueryClientProvider client={queryClient}>
        <SettingsNotificationsView />
      </QueryClientProvider>
    );
    expect(screen.getByText("保存所有设置")).toBeInTheDocument();
  });
});
```

- [ ] **Step 5: Run all tests**

```bash
npm run test -- src/app/views/__tests__/SettingsNotificationsView.test.tsx
```

- [ ] **Step 6: Commit**

```bash
git add src/app/views/SettingsNotificationsView.tsx
git add src/app/views/__tests__/SettingsNotificationsView.test.tsx
git add src/app/settings/notifications/page.tsx
git add src/components/settings/index.ts
git commit -m "feat(notifications): add SettingsNotificationsView main page"
```

---

## Chunk 5: Integration & Polish

### Task 5.1: Add Sidebar Menu Entry

**Files:**

- Modify: `src/components/layout/Sidebar.tsx` (find notifications section)

- [ ] **Step 1: Add menu item**

Find the settings section in Sidebar.tsx and add:

```typescript
// In the notifications/settings submenu
{
  label: "全局通知设置",
  path: "/settings/notifications",
  icon: "🔔",
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/Sidebar.tsx
git commit -m "feat(notifications): add global settings to sidebar menu"
```

---

### Task 5.2: Run Full Test Suite

- [ ] **Step 1: Run all notification tests**

```bash
npm run test -- --testPathPattern="notification"
```

- [ ] **Step 2: Fix any failing tests**

- [ ] **Step 3: Type check**

```bash
npm run typecheck
```

- [ ] **Step 4: Lint**

```bash
npm run lint
```

- [ ] **Step 5: Build test**

```bash
npm run build
```

- [ ] **Step 6: Final commit**

```bash
git commit -m "feat(notifications): complete SettingsNotificationsView implementation

- Add global notification settings backend (Rust/SQLite)
- Add 6 modular UI components with tests
- Implement drag-drop channel priority sorting
- Add form validation and error handling
- Integrate with existing notification system
- All tests passing, build successful"
```

---

## Summary

### Files Created/Modified

**Backend:**

- `src-tauri/migrations/2026_03_14_global_notification_settings.sql`
- `src-tauri/src/models/notification.rs`
- `src-tauri/src/commands/notifications.rs` (+3 commands)

**Frontend:**

- `src/lib/types/notification.ts` (extended)
- `src/hooks/useGlobalNotificationSettings.ts`
- `src/components/settings/*.tsx` (6 components + tests)
- `src/app/views/SettingsNotificationsView.tsx`
- `src/app/settings/notifications/page.tsx`
- `src/components/layout/Sidebar.tsx` (menu entry)

**Dependencies:**

- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`

### Test Coverage Targets

- Component unit tests: 90%+
- Integration tests: 80%+
- E2E scenarios: Critical paths

---

**Plan complete and saved. Ready to execute?**
