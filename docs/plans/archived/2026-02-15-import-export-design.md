# Import/Export Feature Design

## Overview

Add import/export functionality to Settings > General page, allowing users to backup and restore all application data.

---

## Data Structure

### Export JSON Format

```json
{
  "version": "1.0",
  "exported_at": "2026-02-15T12:00:00Z",
  "data": {
    "todos": [...],
    "tasks": [...],
    "plans": [...],
    "targets": [...],
    "steps": [...],
    "milestones": [...],
    "tags": [...],
    "entity_tags": [...],
    "settings": {
      "notification_settings": [...],
      "daily_summary_settings": [...],
      "notification_plugins": [...]
    }
  }
}
```

### Import Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| merge | Skip on ID conflict | Incremental import |
| replace | Clear all, then import | Full overwrite |
| update | Update on ID conflict | Sync changes |

---

## UI Design

### Location
- Settings > General page (inside, not separate tab)

### Export Section
```
┌─────────────────────────────────────┐
│ 导出数据                              │
├─────────────────────────────────────┤
│ 点击导出所有数据为 JSON 文件          │
│ [导出]                               │
└─────────────────────────────────────┘
```

### Import Section
```
┌─────────────────────────────────────┐
│ 导入数据                              │
├─────────────────────────────────────┤
│ [选择文件] 或 拖拽文件到这里          │
│                                       │
│ 导入模式: ○ 合并 (merge)             │
│           ○ 替换 (replace)           │
│           ● 更新 (update)            │
│                                       │
│ [导入]                               │
└─────────────────────────────────────┘
```

---

## Backend API Design

### Export
```rust
// GET /export - Returns all data as JSON
#[tauri::command]
pub fn export_data() -> Result<ExportData, String>
```

### Import
```rust
// POST /import - Import data with mode
#[tauri::command]
pub fn import_data(data: ImportData, mode: String) -> Result<ImportResult, String>
```

---

## Implementation Steps

1. **Backend**
   - Create `export.rs` with export_data function
   - Create import_data function with merge/replace/update modes
   - Add to main.rs

2. **Frontend**
   - Add ExportImportView component
   - Integrate into SettingsGeneralView
   - Add file upload handling

3. **Testing**
   - Unit tests for import modes
   - Manual testing

---

## Acceptance Criteria

- [ ] Export downloads valid JSON file with all data
- [ ] Import merge mode skips existing IDs
- [ ] Import replace mode clears and imports
- [ ] Import update mode updates existing records
- [ ] Settings data (notifications, channels, daily summary) is included
- [ ] Tags and entity_tags are properly linked after import
