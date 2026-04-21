# Batch Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement multi-select mode and bulk operations for Todos/Plans/Targets lists.

**Architecture:** Zustand store for batch selection state, reusable BatchActionBar component, extend existing bulk_update API to support more fields.

**Tech Stack:** React, Zustand, TanStack Query, TypeScript, Tauri v2

---

## Files to Create/Modify

| File                                         | Action | Description                 |
| -------------------------------------------- | ------ | --------------------------- |
| `src/hooks/useBatchSelect.ts`                | Create | Batch selection state store |
| `src/components/features/BatchActionBar.tsx` | Create | Batch operations toolbar    |
| `src/components/features/SelectableItem.tsx` | Create | Checkbox wrapper component  |
| `src/app/views/TodosView.tsx`                | Modify | Integrate batch mode        |
| `src/app/views/PlansView.tsx`                | Modify | Integrate batch mode        |
| `src/app/views/TargetsView.tsx`              | Modify | Integrate batch mode        |
| `src-tauri/src/commands/bulk.rs`             | Modify | Extend bulk update API      |
| `src/lib/api/bulk.ts`                        | Create | Frontend bulk API wrapper   |

---

## Task 1: Backend - Extend Bulk Update API

**Files:**

- Modify: `src-tauri/src/commands/bulk.rs`

- [ ] **Step 1: Read current bulk.rs to understand existing structure**

Read the file first, then extend.

- [ ] **Step 2: Extend BulkTodoUpdates struct**

```rust
// In src-tauri/src/commands/bulk.rs

#[derive(Debug, Deserialize)]
pub struct BulkTodoUpdates {
    pub status: Option<String>,
    pub priority: Option<String>,
    pub due_date: Option<String>,
    pub archived: Option<bool>,
}

// Add similar for plans and targets if needed
#[derive(Debug, Deserialize)]
pub struct BulkPlanUpdates {
    pub status: Option<String>,
    pub archived: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct BulkTargetUpdates {
    pub status: Option<String>,
    pub archived: Option<bool>,
}
```

- [ ] **Step 3: Implement bulk_update_todos with extended fields**

```rust
#[tauri::command]
pub fn bulk_update_todos(
    db: State<'_, Database>,
    ids: Vec<String>,
    updates: BulkTodoUpdates,
) -> Result<usize, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    if ids.is_empty() {
        return Ok(0);
    }

    let mut set_clauses: Vec<String> = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(status) = &updates.status {
        set_clauses.push("status = ?".to_string());
        params.push(Box::new(status.clone()));
    }

    if let Some(priority) = &updates.priority {
        set_clauses.push("priority = ?".to_string());
        params.push(Box::new(priority.clone()));
    }

    if let Some(due_date) = &updates.due_date {
        set_clauses.push("due_date = ?".to_string());
        params.push(Box::new(due_date.clone()));
    }

    if let Some(archived) = updates.archived {
        set_clauses.push("archived = ?".to_string());
        params.push(Box::new(archived as i32));
    }

    if set_clauses.is_empty() {
        return Ok(0);
    }

    // Add updated_at
    set_clauses.push("updated_at = ?".to_string());
    params.push(Box::new(chrono::Utc::now().to_rfc3339()));

    // Add ids as params
    for id in &ids {
        params.push(Box::new(id.clone()));
    }

    let sql = format!(
        "UPDATE todos SET {} WHERE id IN ({})",
        set_clauses.join(", "),
        ids.iter().map(|_| "?").collect::<Vec<_>>().join(",")
    );

    let params_refs: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

    let count = conn.execute(&sql, params_refs.as_slice())
        .map_err(|e| e.to_string())?;

    Ok(count)
}
```

- [ ] **Step 4: Add bulk_delete_todos command**

```rust
#[tauri::command]
pub fn bulk_delete_todos(
    db: State<'_, Database>,
    ids: Vec<String>,
) -> Result<usize, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    if ids.is_empty() {
        return Ok(0);
    }

    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let sql = format!("DELETE FROM todos WHERE id IN ({})", placeholders);

    let params: Vec<&dyn rusqlite::ToSql> = ids.iter().map(|id| id as &dyn rusqlite::ToSql).collect();

    let count = conn.execute(&sql, params.as_slice())
        .map_err(|e| e.to_string())?;

    Ok(count)
}
```

- [ ] **Step 5: Add bulk_archive_todos command**

```rust
#[tauri::command]
pub fn bulk_archive_todos(
    db: State<'_, Database>,
    ids: Vec<String>,
) -> Result<usize, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    if ids.is_empty() {
        return Ok(0);
    }

    let placeholders = ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
    let now = chrono::Utc::now().to_rfc3339();

    let sql = format!(
        "UPDATE todos SET status = 'archived', updated_at = ? WHERE id IN ({})",
        placeholders
    );

    let mut params: Vec<&dyn rusqlite::ToSql> = vec![&now];
    for id in &ids {
        params.push(id);
    }

    let count = conn.execute(&sql, params.as_slice())
        .map_err(|e| e.to_string())?;

    Ok(count)
}
```

- [ ] **Step 6: Register new commands in lib.rs**

```rust
// Add to invoke_handler in src-tauri/src/lib.rs
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    commands::bulk::bulk_update_todos,
    commands::bulk::bulk_delete_todos,
    commands::bulk::bulk_archive_todos,
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
git commit -m "feat(bulk): extend bulk update API with more fields"
```

---

## Task 2: Frontend API Wrapper

**Files:**

- Create: `src/lib/api/bulk.ts`

- [ ] **Step 1: Create bulk API wrapper**

```typescript
// src/lib/api/bulk.ts
import { invoke } from "@tauri-apps/api/core";

export interface BulkTodoUpdates {
  status?: string;
  priority?: string;
  due_date?: string;
  archived?: boolean;
}

export interface BulkPlanUpdates {
  status?: string;
  archived?: boolean;
}

export interface BulkTargetUpdates {
  status?: string;
  archived?: boolean;
}

export async function bulkUpdateTodos(
  ids: string[],
  updates: BulkTodoUpdates,
): Promise<number> {
  return await invoke<number>("bulk_update_todos", { ids, updates });
}

export async function bulkDeleteTodos(ids: string[]): Promise<number> {
  return await invoke<number>("bulk_delete_todos", { ids });
}

export async function bulkArchiveTodos(ids: string[]): Promise<number> {
  return await invoke<number>("bulk_archive_todos", { ids });
}

export async function bulkUpdatePlans(
  ids: string[],
  updates: BulkPlanUpdates,
): Promise<number> {
  return await invoke<number>("bulk_update_plans", { ids, updates });
}

export async function bulkDeletePlans(ids: string[]): Promise<number> {
  return await invoke<number>("bulk_delete_plans", { ids });
}

export async function bulkUpdateTargets(
  ids: string[],
  updates: BulkTargetUpdates,
): Promise<number> {
  return await invoke<number>("bulk_update_targets", { ids, updates });
}

export async function bulkDeleteTargets(ids: string[]): Promise<number> {
  return await invoke<number>("bulk_delete_targets", { ids });
}
```

- [ ] **Step 2: Commit API wrapper**

```bash
git add src/lib/api/bulk.ts
git commit -m "feat(bulk): add frontend bulk API wrapper"
```

---

## Task 3: Batch Selection State

**Files:**

- Create: `src/hooks/useBatchSelect.ts`

- [ ] **Step 1: Create useBatchSelect hook**

```typescript
// src/hooks/useBatchSelect.ts
import { create } from "zustand";

interface BatchSelectState {
  // Mode
  mode: boolean;
  toggleMode: () => void;
  enterMode: () => void;
  exitMode: () => void;

  // Selection
  selectedIds: Set<string>;
  toggle: (id: string) => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  clear: () => void;

  // Helpers
  isSelected: (id: string) => boolean;
  selectedCount: () => number;
  hasSelection: () => boolean;
}

export const useBatchSelect = create<BatchSelectState>((set, get) => ({
  mode: false,
  selectedIds: new Set<string>(),

  toggleMode: () => {
    const newMode = !get().mode;
    set({
      mode: newMode,
      selectedIds: newMode ? get().selectedIds : new Set(),
    });
  },

  enterMode: () => set({ mode: true }),
  exitMode: () => set({ mode: false, selectedIds: new Set() }),

  toggle: (id) => {
    const newIds = new Set(get().selectedIds);
    if (newIds.has(id)) {
      newIds.delete(id);
    } else {
      newIds.add(id);
    }
    set({ selectedIds: newIds });
  },

  select: (id) => {
    const newIds = new Set(get().selectedIds);
    newIds.add(id);
    set({ selectedIds: newIds });
  },

  deselect: (id) => {
    const newIds = new Set(get().selectedIds);
    newIds.delete(id);
    set({ selectedIds: newIds });
  },

  selectAll: (ids) => {
    set({ selectedIds: new Set(ids) });
  },

  deselectAll: () => {
    set({ selectedIds: new Set() });
  },

  clear: () => {
    set({ mode: false, selectedIds: new Set() });
  },

  isSelected: (id) => get().selectedIds.has(id),

  selectedCount: () => get().selectedIds.size,

  hasSelection: () => get().selectedIds.size > 0,
}));
```

- [ ] **Step 2: Commit selection state**

```bash
git add src/hooks/useBatchSelect.ts
git commit -m "feat(batch): add batch selection state hook"
```

---

## Task 4: Selectable Item Component

**Files:**

- Create: `src/components/features/SelectableItem.tsx`

- [ ] **Step 1: Create SelectableItem component**

```typescript
// src/components/features/SelectableItem.tsx
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { cn } from "@/lib/utils";

interface SelectableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectableItem({ id, children, className }: SelectableItemProps) {
  const mode = useBatchSelect((s) => s.mode);
  const isSelected = useBatchSelect((s) => s.isSelected(id));
  const toggle = useBatchSelect((s) => s.toggle);

  if (!mode) {
    return <>{children}</>;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggle(id);
        }}
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
          isSelected
            ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
            : "border-[var(--color-border)] hover:border-[var(--color-primary)]"
        )}
      >
        {isSelected && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
```

- [ ] **Step 2: Commit SelectableItem**

```bash
git add src/components/features/SelectableItem.tsx
git commit -m "feat(batch): add SelectableItem component"
```

---

## Task 5: Batch Action Bar Component

**Files:**

- Create: `src/components/features/BatchActionBar.tsx`

- [ ] **Step 1: Create BatchActionBar component**

```typescript
// src/components/features/BatchActionBar.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  bulkUpdateTodos,
  bulkDeleteTodos,
  bulkArchiveTodos,
  bulkUpdatePlans,
  bulkDeletePlans,
  bulkUpdateTargets,
  bulkDeleteTargets,
} from "@/lib/api/bulk";
import { Button } from "@/components/ui/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { useBatchSelect } from "@/hooks/useBatchSelect";

interface BatchActionBarProps {
  entityType: "todo" | "plan" | "target";
  allIds: string[];
}

export function BatchActionBar({ entityType, allIds }: BatchActionBarProps) {
  const queryClient = useQueryClient();
  const selectedIds = useBatchSelect((s) => Array.from(s.selectedIds));
  const selectAll = useBatchSelect((s) => s.selectAll);
  const deselectAll = useBatchSelect((s) => s.deselectAll);
  const exitMode = useBatchSelect((s) => s.exitMode);

  const [status, setStatus] = useState<string>("");
  const [priority, setPriority] = useState<string>("");

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) => {
      switch (entityType) {
        case "todo":
          return bulkUpdateTodos(selectedIds, updates as any);
        case "plan":
          return bulkUpdatePlans(selectedIds, updates as any);
        case "target":
          return bulkUpdateTargets(selectedIds, updates as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityType + "s"] });
      toast.success(`已更新 ${selectedIds.length} 项`);
      deselectAll();
    },
    onError: (error) => {
      toast.error(`更新失败: ${error}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => {
      switch (entityType) {
        case "todo":
          return bulkDeleteTodos(selectedIds);
        case "plan":
          return bulkDeletePlans(selectedIds);
        case "target":
          return bulkDeleteTargets(selectedIds);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entityType + "s"] });
      toast.success(`已删除 ${selectedIds.length} 项`);
      exitMode();
    },
    onError: (error) => {
      toast.error(`删除失败: ${error}`);
    },
  });

  const handleStatusChange = (value: string) => {
    setStatus(value);
    updateMutation.mutate({ status: value });
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value);
    updateMutation.mutate({ priority: value });
  };

  const handleSelectAll = () => {
    selectAll(allIds);
  };

  const handleDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.length} 项吗？`)) {
      deleteMutation.mutate();
    }
  };

  const isAllSelected = selectedIds.length === allIds.length;

  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg mb-4">
      <span className="text-sm text-[var(--color-text-secondary)]">
        已选中 {selectedIds.length} 项
      </span>

      <button
        onClick={isAllSelected ? deselectAll : handleSelectAll}
        className="text-sm text-[var(--color-primary)] hover:underline"
      >
        {isAllSelected ? "取消全选" : "全选"}
      </button>

      <div className="h-4 w-px bg-[var(--color-border)]" />

      {entityType === "todo" && (
        <>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">待处理</SelectItem>
              <SelectItem value="in-progress">进行中</SelectItem>
              <SelectItem value="done">已完成</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="w-24 h-8 text-sm">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="P0">P0 紧急</SelectItem>
              <SelectItem value="P1">P1 重要</SelectItem>
              <SelectItem value="P2">P2 普通</SelectItem>
              <SelectItem value="P3">P3 低优</SelectItem>
            </SelectContent>
          </Select>
        </>
      )}

      <div className="flex-1" />

      <Button
        variant="outline"
        size="sm"
        onClick={() => updateMutation.mutate({ archived: true })}
        disabled={updateMutation.isPending}
      >
        归档
      </Button>

      <Button
        variant="destructive"
        size="sm"
        onClick={handleDelete}
        disabled={deleteMutation.isPending}
      >
        删除
      </Button>

      <Button variant="ghost" size="sm" onClick={exitMode}>
        取消
      </Button>
    </div>
  );
}
```

- [ ] **Step 2: Commit BatchActionBar**

```bash
git add src/components/features/BatchActionBar.tsx
git commit -m "feat(batch): add BatchActionBar component"
```

---

## Task 6: Integrate into TodosView

**Files:**

- Modify: `src/app/views/TodosView.tsx`

- [ ] **Step 1: Read current TodosView.tsx**

Understand the current structure first.

- [ ] **Step 2: Add batch mode toggle to header**

```typescript
// Add to TodosView.tsx imports
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { BatchActionBar } from "@/components/features/BatchActionBar";
import { SelectableItem } from "@/components/features/SelectableItem";

// Inside component
const batchMode = useBatchSelect((s) => s.mode);
const toggleBatchMode = useBatchSelect((s) => s.toggleMode);
const selectedIds = useBatchSelect((s) => s.selectedIds);

// Add to filter bar or header
<Button
  variant={batchMode ? "default" : "outline"}
  size="sm"
  onClick={toggleBatchMode}
>
  {batchMode ? "退出多选" : "多选"}
</Button>
```

- [ ] **Step 3: Wrap list items with SelectableItem**

```typescript
// Replace TodoItem rendering with:
<SelectableItem id={todo.id}>
  <TodoItem todo={todo} {...otherProps} />
</SelectableItem>
```

- [ ] **Step 4: Add BatchActionBar above list**

```typescript
// Add above the list
{batchMode && (
  <BatchActionBar
    entityType="todo"
    allIds={todos.map((t) => t.id)}
  />
)}
```

- [ ] **Step 5: Run TypeScript check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 6: Test manually**

1. Open Todos view
2. Click "多选" button
3. Verify checkboxes appear
4. Select multiple items
5. Verify action bar shows correct count
6. Test status/priority change
7. Test delete
8. Test select all/deselect all

- [ ] **Step 7: Commit TodosView changes**

```bash
git add src/app/views/TodosView.tsx
git commit -m "feat(batch): integrate batch mode into TodosView"
```

---

## Task 7: Integrate into PlansView and TargetsView

**Files:**

- Modify: `src/app/views/PlansView.tsx`
- Modify: `src/app/views/TargetsView.tsx`

- [ ] **Step 1: Apply same pattern to PlansView.tsx**

Follow the same steps as Task 6 but for Plans:

- Add batch mode toggle
- Wrap PlanItem with SelectableItem
- Add BatchActionBar with entityType="plan"

- [ ] **Step 2: Apply same pattern to TargetsView.tsx**

Follow the same steps but for Targets:

- Add batch mode toggle
- Wrap TargetItem with SelectableItem
- Add BatchActionBar with entityType="target"

- [ ] **Step 3: Run TypeScript check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 4: Commit remaining views**

```bash
git add src/app/views/PlansView.tsx src/app/views/TargetsView.tsx
git commit -m "feat(batch): integrate batch mode into PlansView and TargetsView"
```

---

## Task 8: Testing

**Files:**

- Create: `src/hooks/__tests__/useBatchSelect.test.ts`
- Create: `src/components/features/__tests__/BatchActionBar.test.tsx`

- [ ] **Step 1: Write useBatchSelect tests**

```typescript
// src/hooks/__tests__/useBatchSelect.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useBatchSelect } from "../useBatchSelect";

describe("useBatchSelect", () => {
  beforeEach(() => {
    useBatchSelect.getState().clear();
  });

  it("should start with mode disabled", () => {
    expect(useBatchSelect.getState().mode).toBe(false);
  });

  it("should toggle mode", () => {
    useBatchSelect.getState().toggleMode();
    expect(useBatchSelect.getState().mode).toBe(true);

    useBatchSelect.getState().toggleMode();
    expect(useBatchSelect.getState().mode).toBe(false);
  });

  it("should select and deselect items", () => {
    useBatchSelect.getState().select("id-1");
    expect(useBatchSelect.getState().isSelected("id-1")).toBe(true);

    useBatchSelect.getState().deselect("id-1");
    expect(useBatchSelect.getState().isSelected("id-1")).toBe(false);
  });

  it("should toggle selection", () => {
    useBatchSelect.getState().toggle("id-1");
    expect(useBatchSelect.getState().isSelected("id-1")).toBe(true);

    useBatchSelect.getState().toggle("id-1");
    expect(useBatchSelect.getState().isSelected("id-1")).toBe(false);
  });

  it("should select all", () => {
    useBatchSelect.getState().selectAll(["id-1", "id-2", "id-3"]);
    expect(useBatchSelect.getState().selectedCount()).toBe(3);
  });

  it("should clear on exit", () => {
    useBatchSelect.getState().select("id-1");
    useBatchSelect.getState().enterMode();

    useBatchSelect.getState().exitMode();

    expect(useBatchSelect.getState().mode).toBe(false);
    expect(useBatchSelect.getState().selectedCount()).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test src/hooks/__tests__/useBatchSelect.test.ts
```

Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add src/hooks/__tests__/useBatchSelect.test.ts
git commit -m "test(batch): add useBatchSelect tests"
```

---

## Verification Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Manual test: Batch mode toggle works in TodosView
- [ ] Manual test: Batch mode toggle works in PlansView
- [ ] Manual test: Batch mode toggle works in TargetsView
- [ ] Manual test: Select all / deselect all works
- [ ] Manual test: Status change applies to all selected
- [ ] Manual test: Priority change applies to all selected
- [ ] Manual test: Delete removes all selected items
- [ ] Manual test: Exit mode clears selection

---

## Notes

- The batch selection state is global - changing views preserves selection
- Consider adding keyboard shortcuts (Ctrl+A for select all) in hotkey feature
- The action bar could be extended with more operations (tag assignment, date change)
