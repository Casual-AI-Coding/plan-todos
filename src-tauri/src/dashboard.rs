// Dashboard API for today overview

use crate::log_command;
use crate::AppState;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Dashboard {
    // 今日概览
    pub overview: Overview,
    // 本周统计
    pub week: WeekStats,
    // 实体数量
    pub counts: EntityCounts,
    // 今日待办
    pub today_todos: Vec<TodoSummary>,
    // 过期待办
    pub overdue_todos: Vec<TodoSummary>,
    // 今日完成
    pub completed_today: Vec<TodoSummary>,
    // 进行中的计划
    pub active_plans: Vec<PlanWithProgress>,
    // 进行中的目标
    pub active_targets: Vec<TargetWithProgress>,
    // 进行中的里程碑
    pub active_milestones: Vec<MilestoneWithProgress>,
}

#[derive(Debug, Serialize)]
pub struct Overview {
    pub today_todos_count: i32,
    pub upcoming_3days_count: i32,
    pub completed_today_count: i32,
    pub overdue_count: i32,
    pub streak_days: i32,
    pub productivity_score: i32,
}

#[derive(Debug, Serialize)]
pub struct WeekStats {
    pub completed_count: i32,
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
pub struct TodoSummary {
    pub id: String,
    pub title: String,
    pub due_date: Option<String>,
    pub status: String,
    pub priority: String,
}

#[derive(Debug, Serialize)]
pub struct PlanWithProgress {
    pub id: String,
    pub title: String,
    pub progress: i32,
    pub task_count: i32,
    pub completed_count: i32,
}

#[derive(Debug, Serialize)]
pub struct TargetWithProgress {
    pub id: String,
    pub title: String,
    pub progress: i32,
    pub due_date: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct MilestoneWithProgress {
    pub id: String,
    pub title: String,
    pub progress: i32,
    pub target_date: Option<String>,
}

#[tauri::command]
pub fn get_dashboard(state: tauri::State<AppState>) -> Result<Dashboard, String> {
    log_command!("get_dashboard", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();

        // 今日待办
        let today_todos = get_today_todos(&conn, &today)?;

        // 即将到期 (3天内)
        let upcoming_todos = get_upcoming_todos(&conn, &today)?;

        // 今日完成
        let completed_today = get_completed_today(&conn, &today)?;

        // 过期待办
        let overdue_todos = get_overdue_todos(&conn, &today)?;

        // 本周完成
        let week_completed = get_week_completed(&conn)?;

        // 实体数量
        let counts = get_entity_counts(&conn)?;

        // 进行中的计划
        let active_plans = get_active_plans(&conn)?;

        // 进行中的目标
        let active_targets = get_active_targets(&conn)?;

        // 进行中的里程碑
        let active_milestones = get_active_milestones(&conn)?;

        // 计算 streak 和 productivity
        let (streak_days, productivity_score) = calculate_efficiency(&conn)?;

        let overview = Overview {
            today_todos_count: today_todos.len() as i32,
            upcoming_3days_count: upcoming_todos.len() as i32,
            completed_today_count: completed_today.len() as i32,
            overdue_count: overdue_todos.len() as i32,
            streak_days,
            productivity_score,
        };

        let week = WeekStats {
            completed_count: week_completed,
        };

        Ok(Dashboard {
            overview,
            week,
            counts,
            today_todos,
            overdue_todos,
            completed_today,
            active_plans,
            active_targets,
            active_milestones,
        })
    })
}

fn get_today_todos(conn: &rusqlite::Connection, today: &str) -> Result<Vec<TodoSummary>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, due_date, status, COALESCE(priority, 'P2') as priority
            FROM todos 
            WHERE (status = 'pending' OR status = 'in-progress')
            AND date(due_date) <= date(?)
            ORDER BY due_date",
        )
        .map_err(|e| e.to_string())?;

    let todos: Vec<TodoSummary> = stmt
        .query_map([today], |row| {
            Ok(TodoSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                due_date: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(todos)
}

fn get_overdue_todos(conn: &rusqlite::Connection, today: &str) -> Result<Vec<TodoSummary>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, due_date, status, COALESCE(priority, 'P2') as priority
            FROM todos 
            WHERE status != 'done'
            AND date(due_date) < date(?)
            ORDER BY due_date DESC",
        )
        .map_err(|e| e.to_string())?;

    let todos: Vec<TodoSummary> = stmt
        .query_map([today], |row| {
            Ok(TodoSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                due_date: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(todos)
}

fn get_upcoming_todos(
    conn: &rusqlite::Connection,
    today: &str,
) -> Result<Vec<TodoSummary>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, due_date, status, COALESCE(priority, 'P2') as priority
            FROM todos 
            WHERE status = 'pending'
            AND date(due_date) > date(?)
            AND date(due_date) <= date(?, '+3 days')
            ORDER BY due_date",
        )
        .map_err(|e| e.to_string())?;

    let todos: Vec<TodoSummary> = stmt
        .query_map(rusqlite::params![today, today], |row| {
            Ok(TodoSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                due_date: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(todos)
}

fn get_completed_today(
    conn: &rusqlite::Connection,
    today: &str,
) -> Result<Vec<TodoSummary>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, due_date, status, COALESCE(priority, 'P2') as priority
            FROM todos 
            WHERE status = 'done'
            AND date(updated_at) = date(?)
            ORDER BY updated_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let todos: Vec<TodoSummary> = stmt
        .query_map([today], |row| {
            Ok(TodoSummary {
                id: row.get(0)?,
                title: row.get(1)?,
                due_date: row.get(2)?,
                status: row.get(3)?,
                priority: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(todos)
}

fn get_week_completed(conn: &rusqlite::Connection) -> Result<i32, String> {
    let count: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos 
            WHERE status = 'done' 
            AND date(updated_at) >= date('now', '-7 days', 'localtime')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(count)
}

fn get_entity_counts(conn: &rusqlite::Connection) -> Result<EntityCounts, String> {
    let todo: i32 = conn
        .query_row("SELECT COUNT(*) FROM todos", [], |row| row.get(0))
        .unwrap_or(0);
    let plan: i32 = conn
        .query_row("SELECT COUNT(*) FROM plans", [], |row| row.get(0))
        .unwrap_or(0);
    let task: i32 = conn
        .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
        .unwrap_or(0);
    let target: i32 = conn
        .query_row("SELECT COUNT(*) FROM targets", [], |row| row.get(0))
        .unwrap_or(0);
    let step: i32 = conn
        .query_row("SELECT COUNT(*) FROM steps", [], |row| row.get(0))
        .unwrap_or(0);
    let milestone: i32 = conn
        .query_row("SELECT COUNT(*) FROM milestones", [], |row| row.get(0))
        .unwrap_or(0);

    Ok(EntityCounts {
        todo,
        plan,
        task,
        target,
        step,
        milestone,
    })
}

fn get_active_plans(conn: &rusqlite::Connection) -> Result<Vec<PlanWithProgress>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT p.id, p.title, 
                COUNT(t.id) as total_tasks,
                SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
            FROM plans p
            LEFT JOIN tasks t ON p.id = t.plan_id
            WHERE p.status = 'active'
            GROUP BY p.id, p.title
            ORDER BY p.created_at DESC
            LIMIT 5",
        )
        .map_err(|e| e.to_string())?;

    let plans: Vec<PlanWithProgress> = stmt
        .query_map([], |row| {
            let total: i32 = row.get(2)?;
            let completed: i32 = row.get(3).unwrap_or(0);
            let progress = if total > 0 {
                (completed * 100) / total
            } else {
                0
            };

            Ok(PlanWithProgress {
                id: row.get(0)?,
                title: row.get(1)?,
                progress,
                task_count: total,
                completed_count: completed,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(plans)
}

fn get_active_targets(conn: &rusqlite::Connection) -> Result<Vec<TargetWithProgress>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, due_date, progress
            FROM targets
            WHERE status = 'active'
            ORDER BY due_date ASC
            LIMIT 5",
        )
        .map_err(|e| e.to_string())?;

    let targets: Vec<TargetWithProgress> = stmt
        .query_map([], |row| {
            Ok(TargetWithProgress {
                id: row.get(0)?,
                title: row.get(1)?,
                progress: row.get(3).unwrap_or(0),
                due_date: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(targets)
}

fn get_active_milestones(
    conn: &rusqlite::Connection,
) -> Result<Vec<MilestoneWithProgress>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, target_date, progress
            FROM milestones
            WHERE status = 'pending'
            ORDER BY target_date ASC
            LIMIT 3",
        )
        .map_err(|e| e.to_string())?;

    let milestones: Vec<MilestoneWithProgress> = stmt
        .query_map([], |row| {
            Ok(MilestoneWithProgress {
                id: row.get(0)?,
                title: row.get(1)?,
                progress: row.get(3).unwrap_or(0),
                target_date: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(milestones)
}

fn calculate_efficiency(conn: &rusqlite::Connection) -> Result<(i32, i32), String> {
    // 计算 streak
    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT date(updated_at) as completion_date
            FROM todos
            WHERE status = 'done'
                AND date(updated_at) >= date('now', '-30 days', 'localtime')
            ORDER BY completion_date DESC",
        )
        .map_err(|e| e.to_string())?;

    let dates: Vec<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|d| d.ok())
        .collect();

    let streak = if dates.is_empty() {
        0
    } else {
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();
        let yesterday = (chrono::Local::now() - chrono::Duration::days(1))
            .format("%Y-%m-%d")
            .to_string();

        if !dates.contains(&today) && !dates.contains(&yesterday) {
            0
        } else {
            let mut streak_count = 0;
            let mut current = if dates.contains(&today) {
                chrono::Local::now().naive_local().date()
            } else {
                (chrono::Local::now() - chrono::Duration::days(1))
                    .naive_local()
                    .date()
            };

            for date_str in &dates {
                let expected = current.format("%Y-%m-%d").to_string();
                if &expected == date_str {
                    streak_count += 1;
                    current = current - chrono::Duration::days(1);
                } else {
                    break;
                }
            }
            streak_count
        }
    };

    // 计算 productivity score
    let (completed, total): (i32, i32) = conn
        .query_row(
            "SELECT 
                SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END),
                COUNT(*)
            FROM todos
            WHERE date(updated_at) >= date('now', '-7 days', 'localtime')
                OR status != 'done'",
            [],
            |row| {
                Ok((
                    row.get::<_, i32>(0).unwrap_or(0),
                    row.get::<_, i32>(1).unwrap_or(0),
                ))
            },
        )
        .unwrap_or((0, 0));

    let completion_rate = if total > 0 {
        (completed as f32 / total as f32) * 100.0
    } else {
        0.0
    };

    let productivity_score =
        (completion_rate * 0.7 + streak.min(10) as f32 * 3.0).min(100.0) as i32;

    Ok((streak, productivity_score))
}
