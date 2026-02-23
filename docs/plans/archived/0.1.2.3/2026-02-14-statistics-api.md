# Statistics API Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** Implement get_statistics API to provide comprehensive statistics for the statistics page

**Architecture:** Create new statistics.rs module with aggregation queries, return structured stats including counts, completion rates, and trends

**Tech Stack:** Rust, Tauri, rusqlite, SQLite

---

## Task 1: Create Statistics Module Structure

**Files:**
- Create: `src-tauri/src/statistics.rs`
- Modify: `src-tauri/src/main.rs` (add module declaration)
- Modify: `src-tauri/src/main.rs` (register command)

**Step 1: Create statistics.rs module**

Create `src-tauri/src/statistics.rs`:

```rust
// Statistics and analytics commands

use crate::AppState;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Statistics {
    pub counts: EntityCounts,
    pub completion: CompletionStats,
    pub trends: TrendStats,
    pub efficiency: EfficiencyStats,
}

#[derive(Debug, Serialize)]
pub struct EntityCounts {
    pub todo: i32,
    pub plan: i32,
    pub task: i32,
    pub target: i32,
    pub step: i32,
    pub milestone: i32,
}

#[derive(Debug, Serialize)]
pub struct CompletionStats {
    pub todo_done: i32,
    pub todo_total: i32,
    pub task_done: i32,
    pub task_total: i32,
    pub step_completed: i32,
    pub step_total: i32,
    pub milestone_done: i32,
    pub milestone_total: i32,
    pub todo_completion_rate: f32,
    pub task_completion_rate: f32,
    pub step_completion_rate: f32,
    pub milestone_completion_rate: f32,
}

#[derive(Debug, Serialize)]
pub struct TrendStats {
    pub daily: Vec<DailyStat>,
}

#[derive(Debug, Serialize)]
pub struct DailyStat {
    pub date: String,
    pub completed: i32,
}

#[derive(Debug, Serialize)]
pub struct EfficiencyStats {
    pub streak_days: i32,
    pub today_completed: i32,
    pub week_completed: i32,
    pub month_completed: i32,
    pub productivity_score: i32,
}
```

**Step 2: Add module declaration in main.rs**

Add to `src-tauri/src/main.rs`:

```rust
// Module declarations
mod db;
mod milestones;
mod models;
mod plans;
mod statistics; // Add this line
mod steps;
mod targets;
mod tasks;
mod todos;
```

**Step 3: Register command in main.rs**

Add to the `invoke_handler`:

```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands ...
    // Statistics
    statistics::get_statistics,
])
```

---

## Task 2: Implement Entity Counts Query

**Files:**
- Modify: `src-tauri/src/statistics.rs`

**Step 1: Add get_counts function**

```rust
fn get_counts(conn: &rusqlite::Connection) -> Result<EntityCounts, String> {
    let todo_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM todos", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let plan_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM plans", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let task_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let target_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM targets", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let step_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM steps", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let milestone_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM milestones", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    Ok(EntityCounts {
        todo: todo_count,
        plan: plan_count,
        task: task_count,
        target: target_count,
        step: step_count,
        milestone: milestone_count,
    })
}
```

---

## Task 3: Implement Completion Stats Query

**Files:**
- Modify: `src-tauri/src/statistics.rs`

**Step 1: Add get_completion_stats function**

```rust
fn get_completion_stats(conn: &rusqlite::Connection) -> Result<CompletionStats, String> {
    // Todo stats
    let (todo_done, todo_total): (i32, i32) = conn
        .query_row(
            "SELECT 
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END),
                COUNT(*)
            FROM todos",
            [],
            |row| Ok((row.get::<_, i32>(0).unwrap_or(0), row.get::<_, i32>(1).unwrap_or(0))),
        )
        .map_err(|e| e.to_string())?;

    // Task stats
    let (task_done, task_total): (i32, i32) = conn
        .query_row(
            "SELECT 
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END),
                COUNT(*)
            FROM tasks",
            [],
            |row| Ok((row.get::<_, i32>(0).unwrap_or(0), row.get::<_, i32>(1).unwrap_or(0))),
        )
        .map_err(|e| e.to_string())?;

    // Step stats
    let (step_completed, step_total): (i32, i32) = conn
        .query_row(
            "SELECT 
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),
                COUNT(*)
            FROM steps",
            [],
            |row| Ok((row.get::<_, i32>(0).unwrap_or(0), row.get::<_, i32>(1).unwrap_or(0))),
        )
        .map_err(|e| e.to_string())?;

    // Milestone stats
    let (milestone_done, milestone_total): (i32, i32) = conn
        .query_row(
            "SELECT 
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END),
                COUNT(*)
            FROM milestones",
            [],
            |row| Ok((row.get::<_, i32>(0).unwrap_or(0), row.get::<_, i32>(1).unwrap_or(0))),
        )
        .map_err(|e| e.to_string())?;

    let todo_completion_rate = if todo_total > 0 {
        (todo_done as f32 / todo_total as f32) * 100.0
    } else {
        0.0
    };

    let task_completion_rate = if task_total > 0 {
        (task_done as f32 / task_total as f32) * 100.0
    } else {
        0.0
    };

    let step_completion_rate = if step_total > 0 {
        (step_completed as f32 / step_total as f32) * 100.0
    } else {
        0.0
    };

    let milestone_completion_rate = if milestone_total > 0 {
        (milestone_done as f32 / milestone_total as f32) * 100.0
    } else {
        0.0
    };

    Ok(CompletionStats {
        todo_done,
        todo_total,
        task_done,
        task_total,
        step_completed,
        step_total,
        milestone_done,
        milestone_total,
        todo_completion_rate,
        task_completion_rate,
        step_completion_rate,
        milestone_completion_rate,
    })
}
```

---

## Task 4: Implement Daily Trends Query

**Files:**
- Modify: `src-tauri/src/statistics.rs`

**Step 1: Add get_trend_stats function**

```rust
fn get_trend_stats(conn: &rusqlite::Connection) -> Result<TrendStats, String> {
    let mut daily_stats: Vec<DailyStat> = Vec::new();

    // Get last 7 days of completion data
    let mut stmt = conn
        .prepare(
            "SELECT 
                date(updated_at) as date,
                COUNT(*) as completed
            FROM todos
            WHERE status = 'done'
                AND date(updated_at) >= date('now', '-7 days')
            GROUP BY date(updated_at)
            ORDER BY date(updated_at)"
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DailyStat {
                date: row.get(0)?,
                completed: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;

    for row in rows {
        daily_stats.push(row.map_err(|e| e.to_string())?);
    }

    Ok(TrendStats {
        daily: daily_stats,
    })
}
```

---

## Task 5: Implement Efficiency Stats Query

**Files:**
- Modify: `src-tauri/src/statistics.rs`

**Step 1: Add get_efficiency_stats function**

```rust
fn get_efficiency_stats(conn: &rusqlite::Connection) -> Result<EfficiencyStats, String> {
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    // Today's completed count
    let today_completed: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos 
            WHERE status = 'done' 
            AND date(updated_at) = date('now', 'localtime')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Week completed count (last 7 days)
    let week_completed: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos 
            WHERE status = 'done' 
            AND date(updated_at) >= date('now', '-7 days', 'localtime')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Month completed count (last 30 days)
    let month_completed: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos 
            WHERE status = 'done' 
            AND date(updated_at) >= date('now', '-30 days', 'localtime')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Calculate streak (consecutive days with at least one completion)
    let streak_days = calculate_streak(conn)?;

    // Productivity score (0-100) based on completion rate and streak
    let productivity_score = calculate_productivity_score(conn, streak_days)?;

    Ok(EfficiencyStats {
        streak_days,
        today_completed,
        week_completed,
        month_completed,
        productivity_score,
    })
}

fn calculate_streak(conn: &rusqlite::Connection) -> Result<i32, String> {
    // Get distinct dates with completions in last 30 days, ordered by date desc
    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT date(updated_at) as completion_date
            FROM todos
            WHERE status = 'done'
                AND date(updated_at) >= date('now', '-30 days', 'localtime')
            ORDER BY completion_date DESC"
        )
        .map_err(|e| e.to_string())?;

    let dates: Vec<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|d| d.ok())
        .collect();

    if dates.is_empty() {
        return Ok(0);
    }

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let yesterday = (chrono::Local::now() - chrono::Duration::days(1)).format("%Y-%m-%d").to_string();

    // Check if streak is active (completed today or yesterday)
    if !dates.contains(&today) && !dates.contains(&yesterday) {
        return Ok(0);
    }

    // Count consecutive days
    let mut streak = 1;
    let mut current_date = if dates.contains(&today) {
        chrono::Local::now().naive_local().date()
    } else {
        (chrono::Local::now() - chrono::Duration::days(1)).naive_local().date()
    };

    for date_str in dates.iter().skip(1) {
        let check_date = current_date - chrono::Duration::days(1);
        if date_str == &check_date.format("%Y-%m-%d").to_string() {
            streak += 1;
            current_date = check_date;
        } else {
            break;
        }
    }

    Ok(streak)
}

fn calculate_productivity_score(conn: &rusqlite::Connection, streak: i32) -> Result<i32, String> {
    // Get completion rate for last 7 days
    let (completed, total): (i32, i32) = conn
        .query_row(
            "SELECT 
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END),
                COUNT(*)
            FROM todos
            WHERE date(updated_at) >= date('now', '-7 days', 'localtime')
                OR status != 'done'",
            [],
            |row| Ok((
                row.get::<_, i32>(0).unwrap_or(0),
                row.get::<_, i32>(1).unwrap_or(0)
            )),
        )
        .map_err(|e| e.to_string())?;

    let completion_rate = if total > 0 {
        (completed as f32 / total as f32) * 100.0
    } else {
        0.0
    };

    // Score based on completion rate (70%) and streak (30%)
    let score = (completion_rate * 0.7) + (streak.min(10) as f32 * 3.0);
    Ok(score.min(100.0) as i32)
}
```

---

## Task 6: Implement Main get_statistics Command

**Files:**
- Modify: `src-tauri/src/statistics.rs`

**Step 1: Add the main Tauri command**

```rust
#[tauri::command]
pub fn get_statistics(state: tauri::State<AppState>) -> Result<Statistics, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let counts = get_counts(&conn)?;
    let completion = get_completion_stats(&conn)?;
    let trends = get_trend_stats(&conn)?;
    let efficiency = get_efficiency_stats(&conn)?;

    Ok(Statistics {
        counts,
        completion,
        trends,
        efficiency,
    })
}
```

---

## Task 7: Verify Rust Compilation

**Command:**
```bash
cd src-tauri && cargo check
```

**Expected:** No errors

---

## Task 8: Add Frontend API Function

**Files:**
- Modify: `src/lib/api.ts`

**Step 1: Add Statistics interface**

```typescript
export interface Statistics {
  counts: {
    todo: number;
    plan: number;
    task: number;
    target: number;
    step: number;
    milestone: number;
  };
  completion: {
    todo_done: number;
    todo_total: number;
    task_done: number;
    task_total: number;
    step_completed: number;
    step_total: number;
    milestone_done: number;
    milestone_total: number;
    todo_completion_rate: number;
    task_completion_rate: number;
    step_completion_rate: number;
    milestone_completion_rate: number;
  };
  trends: {
    daily: Array<{
      date: string;
      completed: number;
    }>;
  };
  efficiency: {
    streak_days: number;
    today_completed: number;
    week_completed: number;
    month_completed: number;
    productivity_score: number;
  };
}
```

**Step 2: Add getStatistics function**

```typescript
export async function getStatistics(): Promise<Statistics> {
  if (!isTauri()) {
    console.warn('Running outside Tauri - returning mock data');
    return {
      counts: { todo: 0, plan: 0, task: 0, target: 0, step: 0, milestone: 0 },
      completion: {
        todo_done: 0, todo_total: 0, task_done: 0, task_total: 0,
        step_completed: 0, step_total: 0, milestone_done: 0, milestone_total: 0,
        todo_completion_rate: 0, task_completion_rate: 0,
        step_completion_rate: 0, milestone_completion_rate: 0
      },
      trends: { daily: [] },
      efficiency: { streak_days: 0, today_completed: 0, week_completed: 0, month_completed: 0, productivity_score: 0 }
    };
  }
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<Statistics>('get_statistics');
}
```

---

## Task 9: Add Tests

**Files:**
- Modify: `src/lib/api.test.ts`

**Step 1: Add getStatistics test**

```typescript
describe('Statistics API', () => {
  it('getStatistics returns statistics object', async () => {
    const stats = await getStatistics();
    expect(stats).toHaveProperty('counts');
    expect(stats).toHaveProperty('completion');
    expect(stats).toHaveProperty('trends');
    expect(stats).toHaveProperty('efficiency');
    expect(stats.counts).toHaveProperty('todo');
    expect(stats.counts).toHaveProperty('plan');
    expect(stats.completion).toHaveProperty('todo_completion_rate');
    expect(stats.efficiency).toHaveProperty('productivity_score');
  });
});
```

---

## Task 10: Run Tests

**Command:**
```bash
npm run test
```

**Expected:** All 90 tests pass (89 existing + 1 new)

---

## Task 11: Commit Changes

**Commands:**
```bash
git add src-tauri/src/statistics.rs src-tauri/src/main.rs src/lib/api.ts src/lib/api.test.ts
git commit -m "feat: add statistics API for comprehensive analytics

Add get_statistics command with:
- Entity counts (todo, plan, task, target, step, milestone)
- Completion stats with rates for each entity type
- Daily completion trends for last 7 days
- Efficiency metrics (streak, daily/weekly/monthly completed)
- Productivity score calculation

Includes frontend API wrapper and tests"
```

---

## API Response Example

```json
{
  "counts": {
    "todo": 45,
    "plan": 12,
    "task": 28,
    "target": 8,
    "step": 35,
    "milestone": 5
  },
  "completion": {
    "todo_done": 30,
    "todo_total": 45,
    "todo_completion_rate": 66.67,
    "task_done": 18,
    "task_total": 28,
    "task_completion_rate": 64.29,
    "step_completed": 22,
    "step_total": 35,
    "step_completion_rate": 62.86,
    "milestone_done": 2,
    "milestone_total": 5,
    "milestone_completion_rate": 40.00
  },
  "trends": {
    "daily": [
      { "date": "2026-02-14", "completed": 5 },
      { "date": "2026-02-13", "completed": 3 },
      ...
    ]
  },
  "efficiency": {
    "streak_days": 5,
    "today_completed": 3,
    "week_completed": 15,
    "month_completed": 42,
    "productivity_score": 78
  }
}
```
