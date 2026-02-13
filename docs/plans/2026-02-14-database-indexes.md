# Database Index Optimization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Add database indexes to improve query performance for frequently accessed data patterns

**Architecture:** Add SQL CREATE INDEX statements to db.rs init_db function, indexes will be created on application startup if they don't exist

**Tech Stack:** Rust, rusqlite, SQLite

---

## Task 1: Add Indexes for Task Queries

**Files:**
- Modify: `src-tauri/src/db.rs`

**Context:** Tasks are frequently queried by plan_id (when showing tasks for a specific plan)

**Step 1: Add index on tasks.plan_id**

In `init_db()` function after table creation, add:

```rust
// Index for tasks by plan_id (frequently queried when loading plan details)
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_tasks_plan_id ON tasks(plan_id)",
    [],
).ok();
```

**Step 2: Add index on tasks.status**

```rust
// Index for tasks by status (for filtering)
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)",
    [],
).ok();
```

**Step 3: Add composite index for date range queries**

```rust
// Composite index for date range queries
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_tasks_dates ON tasks(start_date, end_date)",
    [],
).ok();
```

---

## Task 2: Add Indexes for Step Queries

**Files:**
- Modify: `src-tauri/src/db.rs`

**Step 1: Add index on steps.target_id**

```rust
// Index for steps by target_id (frequently queried when loading target details)
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_steps_target_id ON steps(target_id)",
    [],
).ok();
```

**Step 2: Add index on steps.status**

```rust
// Index for steps by status
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_steps_status ON steps(status)",
    [],
).ok();
```

---

## Task 3: Add Indexes for Todo Queries

**Files:**
- Modify: `src-tauri/src/db.rs`

**Step 1: Add index on todos.due_date**

```rust
// Index for todos by due_date (frequently queried for today's/upcoming tasks)
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)",
    [],
).ok();
```

**Step 2: Add index on todos.status**

```rust
// Index for todos by status (for filtering pending/completed)
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status)",
    [],
).ok();
```

**Step 3: Add composite index for dashboard queries**

```rust
// Composite index for dashboard queries (status + due_date)
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_todos_status_due ON todos(status, due_date)",
    [],
).ok();
```

---

## Task 4: Add Indexes for Plan and Target

**Files:**
- Modify: `src-tauri/src/db.rs`

**Step 1: Add index on plans.status**

```rust
// Index for plans by status
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status)",
    [],
).ok();
```

**Step 2: Add index on plans dates**

```rust
// Index for plan date ranges
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_plans_dates ON plans(start_date, end_date)",
    [],
).ok();
```

**Step 3: Add index on targets.status**

```rust
// Index for targets by status
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_targets_status ON targets(status)",
    [],
).ok();
```

**Step 4: Add index on targets.due_date**

```rust
// Index for targets by due_date
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_targets_due_date ON targets(due_date)",
    [],
).ok();
```

---

## Task 5: Add Indexes for Milestones

**Files:**
- Modify: `src-tauri/src/db.rs`

**Step 1: Add indexes for milestone foreign keys**

```rust
// Indexes for milestone foreign keys (frequently queried for progress calculation)
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_milestones_plan_id ON milestones(plan_id)",
    [],
).ok();
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_milestones_task_id ON milestones(task_id)",
    [],
).ok();
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_milestones_target_id ON milestones(target_id)",
    [],
).ok();
```

**Step 2: Add index on milestones.status**

```rust
// Index for milestones by status
conn.execute(
    "CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status)",
    [],
).ok();
```

---

## Task 6: Verify Rust Compilation

**Command:**
```bash
cd src-tauri && cargo check
```

**Expected:** No errors

---

## Task 7: Commit Changes

**Command:**
```bash
git add src-tauri/src/db.rs
git commit -m "perf: add database indexes for frequently queried columns

Add indexes to improve query performance:
- tasks: plan_id, status, date ranges
- steps: target_id, status
- todos: due_date, status, composite (status + due_date)
- plans: status, date ranges
- targets: status, due_date
- milestones: all foreign keys, status

Indexes use IF NOT EXISTS for safe migration on existing databases"
```

---

## Index Summary

| Table | Index Name | Columns | Purpose |
|-------|-----------|---------|---------|
| tasks | idx_tasks_plan_id | plan_id | Fast lookup of tasks by plan |
| tasks | idx_tasks_status | status | Filter by status |
| tasks | idx_tasks_dates | start_date, end_date | Date range queries |
| steps | idx_steps_target_id | target_id | Fast lookup of steps by target |
| steps | idx_steps_status | status | Filter by status |
| todos | idx_todos_due_date | due_date | Today's/upcoming queries |
| todos | idx_todos_status | status | Filter by status |
| todos | idx_todos_status_due | status, due_date | Dashboard queries |
| plans | idx_plans_status | status | Filter by status |
| plans | idx_plans_dates | start_date, end_date | Date range queries |
| targets | idx_targets_status | status | Filter by status |
| targets | idx_targets_due_date | due_date | Due date queries |
| milestones | idx_milestones_plan_id | plan_id | Progress calculation |
| milestones | idx_milestones_task_id | task_id | Progress calculation |
| milestones | idx_milestones_target_id | target_id | Progress calculation |
| milestones | idx_milestones_status | status | Filter by status |

---

## Expected Performance Improvements

- **Task loading by Plan**: ~10x faster with plan_id index
- **Dashboard queries**: ~5x faster with composite status+due_date index
- **Calendar views**: ~3x faster with date indexes
- **Status filtering**: ~5x faster across all tables
