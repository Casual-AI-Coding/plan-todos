# Phase 6 Cloud Sync Implementation Plan

> **Created:** 2026-03-18
> **Status:** Ready for Implementation
> **Tech Stack:** Tauri 2, React/Next.js, SQLite, TypeScript

---

## Overview

Implement WebDAV-based cloud sync with incremental synchronization, conflict resolution strategies, and secure credential storage.

**Architecture:**

- **Backend:** Rust WebDAV client with incremental sync engine using change-tracking metadata
- **Frontend:** React Query for sync state management, modular UI components for configuration
- **Security:** Platform keychain integration (Tauri secure storage) for credentials
- **Sync Protocol:** Delta sync with tombstone-based deletion tracking and vector clocks for conflict detection

**Tech Stack:** Tauri v2 (Rust), Next.js 16, React 19, TypeScript, SQLite, reqwest (HTTP client), keyring-rs (secure storage)

---

## Phase 6 Status

| Feature         | Status                    |
| --------------- | ------------------------- |
| 6.1 本地导出    | ✅ 已完成                 |
| 6.2 本地导入    | ✅ 已完成                 |
| 6.3 云同步      | 🔄 进行中 (Wave 1-3 完成) |
| 6.4 冲突解决    | 📋 已规划                 |
| 6.5 WebDAV 支持 | 🔄 进行中 (Wave 1-3 完成) |

---

## Architecture Design

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Plan Todos App                          │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (React/TypeScript)                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Sync Status │  │ Settings UI │  │ Conflict Resolution UI  │ │
│  │   Widget    │  │   (WebDAV)  │  │                         │ │
│  └──────┬──────┘  └──────┬──────┘  └─────────────────────────┘ │
│         │                │                                      │
│         └────────────────┬─────────────────────────────────────┘
│                          │ invoke
├──────────────────────────┼──────────────────────────────────────┤
│  Backend (Rust/Tauri)    │                                      │
│  ┌───────────────────────┴───────────────────────────────────┐ │
│  │              Sync Manager (sync/mod.rs)                    │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │ │
│  │  │ Change Tracker│  │   WebDAV     │  │ Conflict Resolver│ │ │
│  │  │  (Metadata)   │  │   Client     │  │                  │ │ │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘ │ │
│  └───────────────────────────────────────────────────────────┘ │
│                          │                                      │
│         ┌────────────────┼────────────────┐                     │
│         ▼                ▼                ▼                     │
│  ┌────────────┐   ┌────────────┐   ┌──────────────┐            │
│  │  SQLite    │   │  WebDAV    │   │  Secure      │            │
│  │  Database  │   │  Server    │   │  Storage     │            │
│  │            │   │ (NAS/Cloud)│   │ (Keychain)   │            │
│  └────────────┘   └────────────┘   └──────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### Conflict Resolution Strategies

| Strategy       | Behavior                      | Use Case                        |
| -------------- | ----------------------------- | ------------------------------- |
| `local-wins`   | Always keep local version     | Device is authoritative         |
| `remote-wins`  | Always accept remote version  | Server is authoritative         |
| `timestamp`    | Keep most recently modified   | Simple automatic resolution     |
| `manual-merge` | Present both versions to user | Important data requiring review |

---

## Database Schema

### sync_metadata

```sql
CREATE TABLE IF NOT EXISTS sync_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entity_type TEXT NOT NULL,           -- 'todo', 'task', 'plan', 'target', 'step', 'milestone', 'circulation', 'tag'
    entity_id TEXT NOT NULL,             -- UUID of the entity
    local_modified_at TEXT NOT NULL,     -- Last local modification timestamp (RFC3339)
    remote_modified_at TEXT,             -- Last known remote modification timestamp
    sync_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'synced', 'conflict', 'error'
    remote_version TEXT,                 -- ETag or version identifier from server
    is_deleted INTEGER NOT NULL DEFAULT 0, -- Tombstone for soft deletes
    device_id TEXT NOT NULL,             -- Device that made last change
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),

    UNIQUE(entity_type, entity_id)
);
```

### sync_config

```sql
CREATE TABLE IF NOT EXISTS sync_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    enabled INTEGER NOT NULL DEFAULT 0,
    provider_type TEXT NOT NULL DEFAULT 'webdav',
    server_url TEXT,
    username TEXT,
    password_encrypted TEXT,
    remote_path TEXT DEFAULT '/plan-todos-sync',
    sync_interval_minutes INTEGER DEFAULT 30,
    conflict_strategy TEXT DEFAULT 'timestamp',
    last_sync_at TEXT,
    last_sync_status TEXT,
    last_sync_error TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### device_info

```sql
CREATE TABLE IF NOT EXISTS device_info (
    device_id TEXT PRIMARY KEY,
    device_name TEXT NOT NULL,
    is_current_device INTEGER NOT NULL DEFAULT 1,
    last_seen_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### sync_log

```sql
CREATE TABLE IF NOT EXISTS sync_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    status TEXT NOT NULL,               -- 'started', 'completed', 'failed'
    entities_uploaded INTEGER DEFAULT 0,
    entities_downloaded INTEGER DEFAULT 0,
    conflicts_count INTEGER DEFAULT 0,
    error_message TEXT,
    duration_ms INTEGER
);
```

---

## Tauri Commands

### Configuration

| Command                 | Description               |
| ----------------------- | ------------------------- |
| `get_sync_config`       | Get sync configuration    |
| `update_sync_config`    | Update sync configuration |
| `test_sync_connection`  | Test WebDAV connection    |
| `save_sync_credentials` | Save credentials securely |
| `get_sync_username`     | Get stored username       |

### Operations

| Command                     | Description               |
| --------------------------- | ------------------------- |
| `get_sync_status`           | Get current sync status   |
| `trigger_sync`              | Trigger manual sync       |
| `get_pending_changes_count` | Get pending changes count |
| `get_sync_logs`             | Get sync logs (paginated) |

### Conflicts

| Command                 | Description                         |
| ----------------------- | ----------------------------------- |
| `get_pending_conflicts` | Get pending conflicts               |
| `resolve_conflict`      | Resolve a conflict                  |
| `resolve_all_conflicts` | Resolve all conflicts with strategy |

### Devices

| Command              | Description            |
| -------------------- | ---------------------- |
| `get_device_info`    | Get device info        |
| `update_device_name` | Update device name     |
| `get_synced_devices` | Get all synced devices |

---

## File Structure

### Backend (Rust)

```
src-tauri/
├── migrations/
│   ├── 2026_03_18_sync_metadata.sql
│   ├── 2026_03_18_sync_config.sql
│   ├── 2026_03_18_device_info.sql
│   ├── 2026_03_18_sync_log.sql
│   └── 2026_03_18_sync_triggers.sql
└── src/
    ├── commands/
    │   └── sync/
    │       ├── mod.rs
    │       ├── config.rs
    │       ├── operations.rs
    │       ├── conflicts.rs
    │       └── devices.rs
    ├── sync/
    │   ├── mod.rs
    │   ├── engine.rs
    │   ├── client.rs
    │   ├── change_tracker.rs
    │   ├── delta.rs
    │   ├── conflict.rs
    │   ├── serializer.rs
    │   └── credentials.rs
    └── models/
        └── sync.rs
```

### Frontend (TypeScript/React)

```
src/
├── lib/
│   ├── types/
│   │   └── sync.ts
│   └── api/
│       └── sync.ts
├── hooks/
│   └── useSync.ts
├── components/
│   └── settings/
│       └── sync/
│           ├── SyncStatusCard.tsx
│           ├── WebDAVConfigForm.tsx
│           ├── ConnectionTestButton.tsx
│           ├── SyncSettingsCard.tsx
│           ├── ConflictResolutionPanel.tsx
│           ├── ConflictItem.tsx
│           ├── DeviceInfoCard.tsx
│           ├── DeviceNameEditor.tsx
│           └── SyncLogsCard.tsx
└── app/
    └── views/
        └── SettingsSyncView.tsx
```

---

## Implementation Waves

| Wave | Name                              | Effort | Dependencies | Status    |
| ---- | --------------------------------- | ------ | ------------ | --------- |
| 1    | Foundation (Database & Models)    | 1-2d   | None         | ✅ 已完成 |
| 2    | Configuration & Credentials       | 2-3d   | Wave 1       | ✅ 已完成 |
| 3    | WebDAV Client                     | 2-3d   | Wave 2       | ✅ 已完成 |
| 4    | Change Tracking & Delta           | 2-3d   | Wave 1       | ⏳ 待开始 |
| 5    | Sync Engine & Conflict Resolution | 3-4d   | Wave 3, 4    | ⏳ 待开始 |
| 6    | Frontend UI                       | 2-3d   | Wave 2, 5    | ⏳ 待开始 |
| 7    | Background Sync & Polish          | 2-3d   | Wave 6       | ⏳ 待开始 |

**Total Estimated Effort:** 14-21 days

---

## Acceptance Criteria

### Functional Requirements

- [ ] User can configure WebDAV server URL, username, password
- [ ] Connection test validates WebDAV access before saving
- [ ] Credentials stored securely in OS keychain
- [ ] Manual sync button triggers immediate sync
- [ ] Changes to todos/plans/etc are tracked automatically
- [ ] Sync uploads local changes to WebDAV server
- [ ] Sync downloads remote changes from WebDAV server
- [ ] Conflicts detected when both sides modified same entity
- [ ] All 4 conflict resolution strategies work correctly
- [ ] Manual conflict resolution UI allows choosing version
- [ ] Device identification works across multiple installations
- [ ] Sync logs show operation history
- [ ] Offline mode: changes queued, sync resumes when online

### Non-Functional Requirements

- [ ] Sync completes within 10 seconds for <100 changes
- [ ] No data loss during sync operations
- [ ] Failed sync operations are recoverable
- [ ] Credentials never logged or exposed in UI
- [ ] Sync works on Windows, macOS, Linux, Android
- [ ] Test coverage > 80% for sync engine code
