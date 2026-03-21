# Recurring Todos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement advanced recurrence patterns for Todos with auto-creation of next occurrence on completion.

**Architecture:** Extend Todo model with Recurrence fields, implement recurrence calculation engine, auto-create next Todo on completion.

**Tech Stack:** TypeScript, Rust, SQLite, date-fns

---

## Files to Create/Modify

| File                                           | Action | Description                  |
| ---------------------------------------------- | ------ | ---------------------------- |
| `src-tauri/migrations/20260321_recurrence.sql` | Create | Database migration           |
| `src/lib/types.ts`                             | Modify | Add Recurrence interface     |
| `src/lib/services/recurrenceService.ts`        | Create | Recurrence calculation logic |
| `src/components/features/RecurrenceForm.tsx`   | Create | Recurrence settings form     |
| `src/components/features/TodoForm.tsx`         | Modify | Add recurrence fields        |
| `src/hooks/useTodos.ts`                        | Modify | Handle recurring completion  |
| `src-tauri/src/commands/todos.rs`              | Modify | Handle recurrence in backend |

---

## Task 1: Database Migration

**Files:**

- Create: `src-tauri/migrations/20260321_recurrence.sql`

- [ ] **Step 1: Create migration file**

```sql
-- src-tauri/migrations/20260321_recurrence.sql
-- Add recurrence fields to todos table

ALTER TABLE todos ADD COLUMN recurrence TEXT;
ALTER TABLE todos ADD COLUMN recurrence_from TEXT;
ALTER TABLE todos ADD COLUMN recurrence_index INTEGER DEFAULT 0;

-- Create index for querying recurring todos
CREATE INDEX IF NOT EXISTS idx_todos_recurrence_from ON todos(recurrence_from);
```

- [ ] **Step 2: Register migration**

Update the migrations tracking in the Rust code to include this migration.

- [ ] **Step 3: Commit migration**

```bash
git add src-tauri/migrations/
git commit -m "feat(recurrence): add database migration for recurring todos"
```

---

## Task 2: Type Definitions

**Files:**

- Modify: `src/lib/types.ts`

- [ ] **Step 1: Add Recurrence interface**

```typescript
// In src/lib/types.ts

export interface Recurrence {
  type: "daily" | "weekly" | "monthly" | "yearly" | "custom";
  interval: number; // Every N days/weeks/months
  daysOfWeek?: number[]; // [0-6] for weekly, 0=Sunday
  dayOfMonth?: number; // 1-31 for monthly
  weekOfMonth?: number; // 1-5 for "nth week of month"
  dayOfWeekInMonth?: number; // 0-6 for "nth weekday of month" pattern
  endDate?: string; // ISO date string for end condition
  maxOccurrences?: number; // Max number of repetitions
}

// Extend Todo interface
export interface Todo {
  // ... existing fields
  recurrence?: Recurrence;
  recurrence_from?: string; // Original todo ID for tracking chain
  recurrence_index?: number; // Current occurrence number (0-based)
}
```

- [ ] **Step 2: Commit types**

```bash
git add src/lib/types.ts
git commit -m "feat(recurrence): add Recurrence type definitions"
```

---

## Task 3: Recurrence Service

**Files:**

- Create: `src/lib/services/recurrenceService.ts`

- [ ] **Step 1: Create recurrence service**

```typescript
// src/lib/services/recurrenceService.ts
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  setDate,
  getDay,
  setDay,
  startOfMonth,
  endOfMonth,
  isAfter,
  isValid,
} from "date-fns";
import type { Recurrence } from "@/lib/types";

/**
 * Calculate the next due date based on recurrence pattern
 * Returns null if recurrence has ended
 */
export function calculateNextDueDate(
  recurrence: Recurrence,
  currentDate: Date,
  currentIndex: number,
): Date | null {
  // Check end conditions
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    if (!isValid(endDate)) {
      console.warn("Invalid endDate:", recurrence.endDate);
    } else if (isAfter(currentDate, endDate)) {
      return null;
    }
  }

  if (recurrence.maxOccurrences) {
    if (currentIndex >= recurrence.maxOccurrences) {
      return null;
    }
  }

  // Calculate based on type
  let nextDate: Date;

  switch (recurrence.type) {
    case "daily":
      nextDate = addDays(currentDate, recurrence.interval || 1);
      break;

    case "weekly":
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        nextDate = nextDayOfWeek(
          currentDate,
          recurrence.daysOfWeek,
          recurrence.interval || 1,
        );
      } else {
        nextDate = addWeeks(currentDate, recurrence.interval || 1);
      }
      break;

    case "monthly":
      if (recurrence.weekOfMonth && recurrence.dayOfWeekInMonth !== undefined) {
        // "Nth weekday of month" pattern (e.g., 2nd Tuesday)
        nextDate = nthWeekdayOfMonth(
          addMonths(currentDate, recurrence.interval || 1),
          recurrence.weekOfMonth,
          recurrence.dayOfWeekInMonth,
        );
      } else if (recurrence.dayOfMonth) {
        // Same day each month
        nextDate = setDayOfMonth(
          addMonths(currentDate, recurrence.interval || 1),
          recurrence.dayOfMonth,
        );
      } else {
        nextDate = addMonths(currentDate, recurrence.interval || 1);
      }
      break;

    case "yearly":
      nextDate = addYears(currentDate, recurrence.interval || 1);
      break;

    case "custom":
      // Custom patterns - default to daily for now
      nextDate = addDays(currentDate, recurrence.interval || 1);
      break;

    default:
      return null;
  }

  // Verify end date again
  if (recurrence.endDate) {
    const endDate = new Date(recurrence.endDate);
    if (isAfter(nextDate, endDate)) {
      return null;
    }
  }

  return nextDate;
}

/**
 * Find next occurrence of any day in daysOfWeek
 */
function nextDayOfWeek(
  currentDate: Date,
  daysOfWeek: number[],
  interval: number,
): Date {
  const currentDay = getDay(currentDate);
  const sortedDays = [...daysOfWeek].sort((a, b) => a - b);

  // Find next day in this week
  const nextDayInWeek = sortedDays.find((d) => d > currentDay);

  if (nextDayInWeek !== undefined) {
    return setDay(currentDate, nextDayInWeek);
  }

  // No more days this week, go to next interval week and pick first day
  const nextWeek = addWeeks(currentDate, interval);
  return setDay(nextWeek, sortedDays[0]);
}

/**
 * Set day of month, handling months with fewer days
 */
function setDayOfMonth(date: Date, day: number): Date {
  const endOfMonthDay = endOfMonth(date).getDate();
  const actualDay = Math.min(day, endOfMonthDay);
  return setDate(date, actualDay);
}

/**
 * Get the Nth occurrence of a weekday in a month
 * e.g., 2nd Tuesday: nthWeekdayOfMonth(date, 2, 2)
 */
function nthWeekdayOfMonth(
  date: Date,
  weekOfMonth: number,
  dayOfWeek: number,
): Date {
  const start = startOfMonth(date);
  const firstDayOfMonth = getDay(start);

  // Calculate the date of the first occurrence of dayOfWeek
  let firstOccurrence: number;
  if (dayOfWeek >= firstDayOfMonth) {
    firstOccurrence = dayOfWeek - firstDayOfMonth + 1;
  } else {
    firstOccurrence = 7 - firstDayOfMonth + dayOfWeek + 1;
  }

  // Add (weekOfMonth - 1) weeks
  const targetDate = firstOccurrence + (weekOfMonth - 1) * 7;

  // Check if this exceeds month length
  const lastDay = endOfMonth(date).getDate();
  if (targetDate > lastDay) {
    // Use last day of month instead
    return setDate(date, lastDay);
  }

  return setDate(date, targetDate);
}

/**
 * Format recurrence for display
 */
export function formatRecurrence(recurrence: Recurrence): string {
  const parts: string[] = [];

  switch (recurrence.type) {
    case "daily":
      parts.push(
        recurrence.interval === 1 ? "每天" : `每${recurrence.interval}天`,
      );
      break;
    case "weekly":
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        const dayNames = [
          "周日",
          "周一",
          "周二",
          "周三",
          "周四",
          "周五",
          "周六",
        ];
        const days = recurrence.daysOfWeek.map((d) => dayNames[d]).join("、");
        parts.push(`每${days}`);
      } else {
        parts.push(
          recurrence.interval === 1 ? "每周" : `每${recurrence.interval}周`,
        );
      }
      break;
    case "monthly":
      if (recurrence.weekOfMonth && recurrence.dayOfWeekInMonth !== undefined) {
        const dayNames = [
          "周日",
          "周一",
          "周二",
          "周三",
          "周四",
          "周五",
          "周六",
        ];
        const ordinal = ["", "第1个", "第2个", "第3个", "第4个", "第5个"];
        parts.push(
          `每月${ordinal[recurrence.weekOfMonth]}${dayNames[recurrence.dayOfWeekInMonth]}`,
        );
      } else if (recurrence.dayOfMonth) {
        parts.push(`每月${recurrence.dayOfMonth}号`);
      } else {
        parts.push(
          recurrence.interval === 1 ? "每月" : `每${recurrence.interval}个月`,
        );
      }
      break;
    case "yearly":
      parts.push(
        recurrence.interval === 1 ? "每年" : `每${recurrence.interval}年`,
      );
      break;
  }

  if (recurrence.endDate) {
    parts.push(`至 ${recurrence.endDate}`);
  }

  if (recurrence.maxOccurrences) {
    parts.push(`共${recurrence.maxOccurrences}次`);
  }

  return parts.join(" ");
}

/**
 * Create next occurrence of a recurring todo
 */
export function createNextOccurrence(
  todo: Todo,
  nextDueDate: Date,
): Omit<Todo, "id" | "created_at" | "updated_at"> {
  return {
    title: todo.title,
    content: todo.content,
    due_date: nextDueDate.toISOString(),
    status: "pending",
    priority: todo.priority,
    recurrence: todo.recurrence,
    recurrence_from: todo.recurrence_from || todo.id,
    recurrence_index: (todo.recurrence_index || 0) + 1,
    tags: todo.tags,
  };
}
```

- [ ] **Step 2: Commit recurrence service**

```bash
git add src/lib/services/recurrenceService.ts
git commit -m "feat(recurrence): add recurrence calculation service"
```

---

## Task 4: Recurrence Form Component

**Files:**

- Create: `src/components/features/RecurrenceForm.tsx`

- [ ] **Step 1: Create RecurrenceForm component**

```typescript
// src/components/features/RecurrenceForm.tsx
import { useState } from "react";
import type { Recurrence } from "@/lib/types";
import { formatRecurrence } from "@/lib/services/recurrenceService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

interface RecurrenceFormProps {
  value?: Recurrence;
  onChange: (recurrence: Recurrence | undefined) => void;
}

export function RecurrenceForm({ value, onChange }: RecurrenceFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const defaultRecurrence: Recurrence = {
    type: "daily",
    interval: 1,
  };

  const handleChange = (updates: Partial<Recurrence>) => {
    onChange({ ...defaultRecurrence, ...value, ...updates });
  };

  const handleClear = () => {
    onChange(undefined);
  };

  const dayNames = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => {
            if (e.target.checked) {
              onChange(defaultRecurrence);
            } else {
              handleClear();
            }
          }}
          className="w-4 h-4 rounded border-[var(--color-border)]"
        />
        <label className="text-sm font-medium">重复</label>
      </div>

      {value && (
        <div className="pl-6 space-y-3">
          {/* Frequency Type */}
          <div className="flex items-center gap-2">
            <Select
              value={value.type}
              onValueChange={(v) => handleChange({ type: v as Recurrence["type"] })}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">每天</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
                <SelectItem value="monthly">每月</SelectItem>
                <SelectItem value="yearly">每年</SelectItem>
              </SelectContent>
            </Select>

            {value.type !== "daily" && value.type !== "yearly" && (
              <span className="text-sm text-[var(--color-text-secondary)]">
                每
                <Input
                  type="number"
                  min={1}
                  max={52}
                  value={value.interval || 1}
                  onChange={(e) => handleChange({ interval: parseInt(e.target.value) || 1 })}
                  className="w-16 h-8 mx-1 text-center"
                />
                {value.type === "weekly" ? "周" : "个月"}
              </span>
            )}
          </div>

          {/* Weekly: Days of Week */}
          {value.type === "weekly" && (
            <div className="space-y-1">
              <label className="text-xs text-[var(--color-text-secondary)]">
                重复时间
              </label>
              <div className="flex gap-1">
                {dayNames.map((name, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const days = value.daysOfWeek || [];
                      const newDays = days.includes(idx)
                        ? days.filter((d) => d !== idx)
                        : [...days, idx];
                      handleChange({ daysOfWeek: newDays.sort() });
                    }}
                    className={`px-2 py-1 text-xs rounded ${
                      (value.daysOfWeek || []).includes(idx)
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-[var(--color-surface)] border border-[var(--color-border)]"
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Monthly: Pattern Selection */}
          {value.type === "monthly" && (
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="monthly-pattern"
                    checked={!value.weekOfMonth}
                    onChange={() => {
                      handleChange({
                        dayOfMonth: value.dayOfMonth || 1,
                        weekOfMonth: undefined,
                        dayOfWeekInMonth: undefined,
                      });
                    }}
                  />
                  <span className="text-sm">每月同一天</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="monthly-pattern"
                    checked={!!value.weekOfMonth}
                    onChange={() => {
                      handleChange({
                        dayOfMonth: undefined,
                        weekOfMonth: 1,
                        dayOfWeekInMonth: 1,
                      });
                    }}
                  />
                  <span className="text-sm">每月第 N 个周 X</span>
                </label>
              </div>

              {!value.weekOfMonth && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">每月</span>
                  <Input
                    type="number"
                    min={1}
                    max={31}
                    value={value.dayOfMonth || 1}
                    onChange={(e) => handleChange({ dayOfMonth: parseInt(e.target.value) || 1 })}
                    className="w-16 h-8"
                  />
                  <span className="text-sm">号</span>
                </div>
              )}

              {value.weekOfMonth && (
                <div className="flex items-center gap-2">
                  <span className="text-sm">每月第</span>
                  <Select
                    value={String(value.weekOfMonth)}
                    onValueChange={(v) => handleChange({ weekOfMonth: parseInt(v) })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">第1个</SelectItem>
                      <SelectItem value="2">第2个</SelectItem>
                      <SelectItem value="3">第3个</SelectItem>
                      <SelectItem value="4">第4个</SelectItem>
                      <SelectItem value="5">第5个</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={String(value.dayOfWeekInMonth)}
                    onValueChange={(v) => handleChange({ dayOfWeekInMonth: parseInt(v) })}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayNames.map((name, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* End Condition */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-[var(--color-primary)] hover:underline"
            >
              {showAdvanced ? "隐藏高级选项" : "高级选项 ▼"}
            </button>

            {showAdvanced && (
              <div className="mt-2 space-y-2">
                <label className="text-sm font-medium">结束条件</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="end-condition"
                      checked={!value.endDate && !value.maxOccurrences}
                      onChange={() => {
                        handleChange({ endDate: undefined, maxOccurrences: undefined });
                      }}
                    />
                    <span className="text-sm">永不</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="end-condition"
                      checked={!!value.endDate}
                      onChange={() => {
                        handleChange({
                          endDate: new Date().toISOString().split("T")[0],
                          maxOccurrences: undefined,
                        });
                      }}
                    />
                    <span className="text-sm">日期</span>
                    <Input
                      type="date"
                      value={value.endDate || ""}
                      onChange={(e) => handleChange({ endDate: e.target.value })}
                      className="w-36 h-8"
                      disabled={!value.endDate}
                    />
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="end-condition"
                      checked={!!value.maxOccurrences}
                      onChange={() => {
                        handleChange({ maxOccurrences: 10, endDate: undefined });
                      }}
                    />
                    <span className="text-sm">重复</span>
                    <Input
                      type="number"
                      min={1}
                      max={999}
                      value={value.maxOccurrences || 10}
                      onChange={(e) => handleChange({ maxOccurrences: parseInt(e.target.value) || 10 })}
                      className="w-16 h-8"
                      disabled={!value.maxOccurrences}
                    />
                    <span className="text-sm">次后</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="text-sm text-[var(--color-text-secondary)]">
            预览: {formatRecurrence(value)}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit RecurrenceForm**

```bash
git add src/components/features/RecurrenceForm.tsx
git commit -m "feat(recurrence): add RecurrenceForm component"
```

---

## Task 5: Integrate into TodoForm

**Files:**

- Modify: `src/components/features/TodoForm.tsx`

- [ ] **Step 1: Read current TodoForm**

Understand current structure.

- [ ] **Step 2: Add RecurrenceForm to TodoForm**

```typescript
// In TodoForm.tsx, add imports
import { RecurrenceForm } from "./RecurrenceForm";

// Add state for recurrence
const [recurrence, setRecurrence] = useState<Recurrence | undefined>(
  initialData?.recurrence
);

// Add to form JSX (after due_date field)
<RecurrenceForm value={recurrence} onChange={setRecurrence} />

// Update submit handler to include recurrence
const handleSubmit = async (data: TodoFormData) => {
  await onSubmit({
    ...data,
    recurrence,
  });
};
```

- [ ] **Step 3: Update Todo display to show recurrence**

In TodoItem component, add recurrence badge:

```typescript
{todo.recurrence && (
  <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1">
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
      />
    </svg>
    {formatRecurrence(todo.recurrence)}
  </span>
)}
```

- [ ] **Step 4: Run TypeScript check**

```bash
npm run typecheck
```

Expected: No errors

- [ ] **Step 5: Commit TodoForm changes**

```bash
git add src/components/features/TodoForm.tsx src/components/features/TodoItem.tsx
git commit -m "feat(recurrence): integrate recurrence into TodoForm"
```

---

## Task 6: Handle Recurring Todo Completion

**Files:**

- Modify: `src/hooks/useTodos.ts`
- Modify: `src-tauri/src/commands/todos.rs`

- [ ] **Step 1: Add recurrence handling to useTodos**

```typescript
// In useTodos.ts

const updateTodo = async (id: string, updates: Partial<Todo>) => {
  const todo = await getTodoById(id);

  // If marking as done and has recurrence, create next occurrence
  if (updates.status === "done" && todo?.recurrence) {
    const { calculateNextDueDate, createNextOccurrence } =
      await import("@/lib/services/recurrenceService");

    const nextDueDate = calculateNextDueDate(
      todo.recurrence,
      new Date(todo.due_date || Date.now()),
      todo.recurrence_index || 0,
    );

    if (nextDueDate) {
      // Create next occurrence
      const nextTodo = createNextOccurrence(todo, nextDueDate);
      await createTodo(nextTodo);
    }
  }

  // Proceed with update
  return await invoke("update_todo", { id, updates });
};
```

- [ ] **Step 2: Update backend to handle recurrence fields**

```rust
// In src-tauri/src/commands/todos.rs

#[derive(Debug, Deserialize)]
pub struct UpdateTodoInput {
    pub title: Option<String>,
    pub content: Option<String>,
    pub due_date: Option<String>,
    pub status: Option<String>,
    pub priority: Option<String>,
    pub recurrence: Option<String>, // JSON string
    pub recurrence_from: Option<String>,
    pub recurrence_index: Option<i32>,
}

#[tauri::command]
pub fn update_todo(
    db: State<'_, Database>,
    id: String,
    input: UpdateTodoInput,
) -> Result<Todo, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;

    // Build update query dynamically
    let mut set_clauses: Vec<String> = Vec::new();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(title) = &input.title {
        set_clauses.push("title = ?".to_string());
        params.push(Box::new(title.clone()));
    }
    // ... other fields

    if let Some(recurrence) = &input.recurrence {
        set_clauses.push("recurrence = ?".to_string());
        params.push(Box::new(recurrence.clone()));
    }

    // ... update and return
}
```

- [ ] **Step 3: Commit completion handling**

```bash
git add src/hooks/useTodos.ts src-tauri/src/commands/todos.rs
git commit -m "feat(recurrence): handle recurring todo completion"
```

---

## Task 7: Testing

**Files:**

- Create: `src/lib/services/__tests__/recurrenceService.test.ts`

- [ ] **Step 1: Write recurrence service tests**

```typescript
// src/lib/services/__tests__/recurrenceService.test.ts
import { describe, it, expect } from "vitest";
import { calculateNextDueDate, formatRecurrence } from "../recurrenceService";
import type { Recurrence } from "@/lib/types";

describe("calculateNextDueDate", () => {
  it("should calculate next daily occurrence", () => {
    const recurrence: Recurrence = { type: "daily", interval: 1 };
    const date = new Date("2026-03-21");
    const next = calculateNextDueDate(recurrence, date, 0);

    expect(next?.toISOString().split("T")[0]).toBe("2026-03-22");
  });

  it("should calculate next weekly occurrence", () => {
    const recurrence: Recurrence = {
      type: "weekly",
      interval: 1,
      daysOfWeek: [1, 2, 3, 4, 5], // Mon-Fri
    };

    // Saturday
    const saturday = new Date("2026-03-21"); // Saturday
    const next = calculateNextDueDate(recurrence, saturday, 0);

    // Should be Monday
    expect(next?.getDay()).toBe(1);
  });

  it("should calculate monthly by day", () => {
    const recurrence: Recurrence = {
      type: "monthly",
      interval: 1,
      dayOfMonth: 15,
    };

    const date = new Date("2026-03-15");
    const next = calculateNextDueDate(recurrence, date, 0);

    expect(next?.getMonth()).toBe(3); // April
    expect(next?.getDate()).toBe(15);
  });

  it("should calculate monthly by nth weekday", () => {
    const recurrence: Recurrence = {
      type: "monthly",
      interval: 1,
      weekOfMonth: 2,
      dayOfWeekInMonth: 2, // 2nd Tuesday
    };

    const date = new Date("2026-03-10"); // 2nd Tuesday of March
    const next = calculateNextDueDate(recurrence, date, 0);

    expect(next?.getMonth()).toBe(3); // April
    // Should be 2nd Tuesday of April
    expect(next?.getDate()).toBe(14);
  });

  it("should return null when endDate is passed", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      endDate: "2026-03-20",
    };

    const date = new Date("2026-03-21");
    const next = calculateNextDueDate(recurrence, date, 0);

    expect(next).toBeNull();
  });

  it("should return null when maxOccurrences reached", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      maxOccurrences: 3,
    };

    const date = new Date("2026-03-21");
    const next = calculateNextDueDate(recurrence, date, 3); // Already at max

    expect(next).toBeNull();
  });
});

describe("formatRecurrence", () => {
  it("should format daily recurrence", () => {
    const recurrence: Recurrence = { type: "daily", interval: 1 };
    expect(formatRecurrence(recurrence)).toBe("每天");
  });

  it("should format weekly with days", () => {
    const recurrence: Recurrence = {
      type: "weekly",
      interval: 1,
      daysOfWeek: [1, 3, 5],
    };
    expect(formatRecurrence(recurrence)).toContain("周一、周三、周五");
  });

  it("should format monthly nth weekday", () => {
    const recurrence: Recurrence = {
      type: "monthly",
      interval: 1,
      weekOfMonth: 2,
      dayOfWeekInMonth: 2,
    };
    expect(formatRecurrence(recurrence)).toBe("每月第2个周二");
  });
});
```

- [ ] **Step 2: Run tests**

```bash
npm run test src/lib/services/__tests__/recurrenceService.test.ts
```

Expected: All tests pass

- [ ] **Step 3: Commit tests**

```bash
git add src/lib/services/__tests__/
git commit -m "test(recurrence): add recurrence service tests"
```

---

## Verification Checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] Manual test: Create daily recurring todo
- [ ] Manual test: Create weekly recurring todo with specific days
- [ ] Manual test: Create monthly recurring todo (same day)
- [ ] Manual test: Create monthly recurring todo (nth weekday)
- [ ] Manual test: Complete recurring todo, verify next occurrence created
- [ ] Manual test: Set end date, verify no more occurrences after
- [ ] Manual test: Set max occurrences, verify stops after limit

---

## Notes

- When dayOfMonth > days in month, use last day of month
- nth weekday pattern handles months with 4 or 5 weeks
- Recurrence chain tracked via recurrence_from field
- recurrence_index counts occurrences (0-based)
