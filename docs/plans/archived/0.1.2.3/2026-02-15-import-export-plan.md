# Import/Export Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add import/export functionality to Settings > General page, allowing users to backup and restore all application data including todos, tasks, plans, targets, steps, milestones, tags, entity_tags, and settings.

**Architecture:** 
- Backend: Add Rust commands for export_data and import_data in src-tauri/src/
- Frontend: Add ImportExportView component inside SettingsGeneralView
- Use Tauri file dialog for file selection

**Tech Stack:** 
- Rust (rusqlite, serde_json)
- TypeScript/React
- Tauri file dialog API

---

## Task 1: Backend - Export Data Structure

**Files:**
- Modify: `src-tauri/src/db.rs` - Add new tables if needed
- Create: `src-tauri/src/export.rs` - Export functionality

**Step 1: Add export_data command structure**

```rust
// src-tauri/src/export.rs
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportData {
    pub version: String,
    pub exported_at: String,
    pub data: ExportDataContent,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportDataContent {
    pub todos: Vec<Todo>,
    pub tasks: Vec<Task>,
    pub plans: Vec<Plan>,
    pub targets: Vec<Target>,
    pub steps: Vec<Step>,
    pub milestones: Vec<Milestone>,
    pub tags: Vec<Tag>,
    pub entity_tags: Vec<EntityTagRow>,
    pub settings: SettingsData,
}
```

**Step 2: Add to main.rs**

```rust
mod export;
// ... add invoke handler
```

**Step 3: Commit**

---

## Task 2: Backend - Export Implementation

**Files:**
- Modify: `src-tauri/src/export.rs`

**Step 1: Implement export_data function**

```rust
#[tauri::command]
pub fn export_data(state: tauri::State<AppState>) -> Result<ExportData, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    // Query all tables and build ExportData
    // ... implementation
}
```

**Step 2: Test by building**

```bash
cd src-tauri && cargo check
```

**Step 3: Commit**

---

## Task 3: Backend - Import Data Structure

**Files:**
- Modify: `src-tauri/src/export.rs`

**Step 1: Add ImportData and ImportResult structures**

```rust
#[derive(Debug, Deserialize)]
pub struct ImportData {
    pub version: String,
    pub data: ExportDataContent,
}

#[derive(Debug, Serialize)]
pub struct ImportResult {
    pub imported: usize,
    pub skipped: usize,
    pub errors: Vec<String>,
}
```

**Step 2: Implement import_data function with modes**

```rust
#[tauri::command]
pub fn import_data(
    state: tauri::State<AppState>,
    data: ImportData,
    mode: String,
) -> Result<ImportResult, String> {
    // mode: "merge" | "replace" | "update"
    // ... implementation
}
```

**Step 3: Commit**

---

## Task 4: Backend - Import Modes Implementation

**Files:**
- Modify: `src-tauri/src/export.rs`

**Step 1: Implement merge mode (skip on conflict)**

```rust
fn import_merge(conn: &Connection, data: &ImportDataContent) -> ImportResult {
    // Check existing IDs, skip if exists
    // Insert new records
}
```

**Step 2: Implement replace mode (clear all first)**

```rust
fn import_replace(conn: &Connection, data: &ImportDataContent) -> ImportResult {
    // DELETE FROM entity_tags; DELETE FROM todos; DELETE FROM tasks; ...
    // Then insert all
}
```

**Step 3: Implement update mode (upsert)**

```rust
fn import_update(conn: &Connection, data: &ImportDataContent) -> ImportResult {
    // UPDATE if exists, INSERT if not
}
```

**Step 4: Test building**

```bash
cd src-tauri && cargo check
```

**Step 5: Commit**

---

## Task 5: Frontend - API Functions

**Files:**
- Modify: `src/lib/api.ts` - Add export/import functions

**Step 1: Add TypeScript interfaces**

```typescript
export interface ExportData {
  version: string;
  exported_at: string;
  data: {
    todos: Todo[];
    tasks: any[];
    plans: any[];
    // ... all other entities
    settings: any;
  };
}

export type ImportMode = 'merge' | 'replace' | 'update';
```

**Step 2: Add API functions**

```typescript
export async function exportData(): Promise<ExportData> {
  if (!isTauri()) { throw new Error('Tauri required'); }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<ExportData>('export_data');
}

export async function importData(data: ExportData, mode: ImportMode): Promise<ImportResult> {
  if (!isTauri()) { throw new Error('Tauri required'); }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<ImportResult>('import_data', { data, mode });
}
```

**Step 3: Commit**

---

## Task 6: Frontend - ImportExportView Component

**Files:**
- Create: `src/app/views/ImportExportView.tsx`

**Step 1: Create component**

```tsx
'use client';
import { useState, useRef } from 'react';
import { Card, Button } from '@/components/ui';
import { exportData, importData, ExportData, ImportMode } from '@/lib/api';

export function ImportExportView() {
  const [mode, setMode] = useState<ImportMode>('update');
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleExport() {
    try {
      const data = await exportData();
      const json = JSON.stringify(data, null, 2);
      // Use Tauri download API
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `plan-todos-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
    } catch (e) { console.error(e); }
  }

  async function handleImport(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text) as ExportData;
      const result = await importData(data, mode);
      alert(`导入完成: ${result.imported} 条`);
    } catch (e) { console.error(e); }
    setImporting(false);
  }

  return (
    <div className="space-y-4">
      {/* Export Section */}
      <Card>
        <h3 className="font-medium mb-2">导出数据</h3>
        <p className="text-sm text-gray-500 mb-3">导出所有数据为 JSON 文件</p>
        <Button onClick={handleExport}>导出</Button>
      </Card>

      {/* Import Section */}
      <Card>
        <h3 className="font-medium mb-2">导入数据</h3>
        <p className="text-sm text-gray-500 mb-3">从 JSON 文件恢复数据</p>
        
        <input
          type="file"
          ref={fileInputRef}
          accept=".json"
          onChange={e => e.target.files?.[0] && handleImport(e.target.files[0])}
          className="hidden"
        />
        
        <div className="space-y-2">
          <label className="block text-sm text-gray-600">导入模式:</label>
          <div className="flex gap-4">
            {(['merge', 'replace', 'update'] as ImportMode[]).map(m => (
              <label key={m} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="mode"
                  checked={mode === m}
                  onChange={() => setMode(m)}
                />
                <span className="text-sm">
                  {m === 'merge' ? '合并' : m === 'replace' ? '替换' : '更新'}
                </span>
              </label>
            ))}
          </div>
        </div>

        <Button 
          variant="secondary" 
          className="mt-3"
          onClick={() => fileInputRef.current?.click()}
          disabled={importing}
        >
          {importing ? '导入中...' : '选择文件'}
        </Button>
      </Card>
    </div>
  );
}
```

**Step 2: Commit**

---

## Task 7: Frontend - Integrate into SettingsGeneralView

**Files:**
- Modify: `src/app/views/SettingsGeneralView.tsx`

**Step 1: Import and add to page**

```tsx
import { ImportExportView } from './ImportExportView';

// In the return JSX, add:
<Card>
  <ImportExportView />
</Card>
```

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Commit**

---

## Task 8: Testing and Verification

**Step 1: Run tests**

```bash
npm run test -- --run
```

**Step 2: Manual testing**
- Export data and verify JSON structure
- Test import with different modes

**Step 3: Commit**

---

## Summary

| Task | Description |
|------|-------------|
| 1 | Backend export data structure |
| 2 | Backend export implementation |
| 3 | Backend import data structure |
| 4 | Backend import modes |
| 5 | Frontend API functions |
| 6 | ImportExportView component |
| 7 | Integrate into SettingsGeneralView |
| 8 | Testing and verification |

---

**Plan complete.** Two execution options:

1. **Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

2. **Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

Which approach?
