// Dashboard API for today overview

use crate::AppState;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Dashboard {
    pub today_todos: Vec<TodoSummary>,
    pub upcoming_todos: Vec<TodoSummary>,
    pub completed_today: Vec<TodoSummary>,
    pub active_plans: Vec<PlanWithProgress>,
    pub active_targets: Vec<TargetWithProgress>,
    pub today_summary: TodaySummary,
}

#[derive(Debug, Serialize)]
pub struct TodoSummary {
    pub id: String,
    pub title: String,
    pub due_date: Option<String>,
    pub status: String,
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
pub struct TodaySummary {
    pub total_todos: i32,
    pub completed_todos: i32,
    pub upcoming_count: i32,
    pub active_plans_count: i32,
    pub active_targets_count: i32,
}

#[tauri::command]
pub fn get_dashboard(state: tauri::State<AppState>) -> Result<Dashboard, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    // Get today's todos
    let today_todos = get_today_todos(&conn, &today)?;

    // Get upcoming todos (3 days)
    let upcoming_todos = get_upcoming_todos(&conn, &today)?;

    // Get completed today
    let completed_today = get_completed_today(&conn, &today)?;

    // Get active plans with progress
    let active_plans = get_active_plans(&conn)?;

    // Get active targets with progress
    let active_targets = get_active_targets(&conn)?;

    // Calculate summary
    let today_summary = TodaySummary {
        total_todos: today_todos.len() as i32,
        completed_todos: completed_today.len() as i32,
        upcoming_count: upcoming_todos.len() as i32,
        active_plans_count: active_plans.len() as i32,
        active_targets_count: active_targets.len() as i32,
    };

    Ok(Dashboard {
        today_todos,
        upcoming_todos,
        completed_today,
        active_plans,
        active_targets,
        today_summary,
    })
}

fn get_today_todos(conn: &rusqlite::Connection, today: &str) -> Result<Vec<TodoSummary>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, due_date, status 
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
            "SELECT id, title, due_date, status 
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
            "SELECT id, title, due_date, status 
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
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(todos)
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
            ORDER BY p.created_at DESC",
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
            "SELECT t.id, t.title, t.due_date, t.progress
            FROM targets t
            WHERE t.status = 'active'
            ORDER BY t.due_date ASC
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
