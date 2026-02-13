#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;
use rusqlite::Connection;
use std::sync::Mutex;

// Database state
pub struct AppState {
    pub db: Mutex<Connection>,
}

// ============================================================================
// Data Models
// ============================================================================

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Plan {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: String, // active | completed | archived
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub plan_id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: String, // pending | in-progress | done
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Target {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub status: String, // active | completed | archived
    pub progress: i32,  // Calculated from Steps (0-100)
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Step {
    pub id: String,
    pub target_id: String,
    pub title: String,
    pub weight: i32,    // 0-100, sum should not exceed 100
    pub status: String, // pending | completed
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub due_date: Option<String>,
    pub status: String, // pending | in-progress | done
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Milestone {
    pub id: String,
    pub title: String,
    pub target_date: Option<String>,
    // One of these three will be set
    pub plan_id: Option<String>,
    pub task_id: Option<String>,
    pub target_id: Option<String>,
    pub status: String, // pending | completed
    pub progress: i32,  // Calculated from linked entity (0-100)
    pub created_at: String,
    pub updated_at: String,
}

// ============================================================================
// Database Initialization
// ============================================================================

fn init_db(conn: &Connection) -> Result<(), rusqlite::Error> {
    // Plans table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS plans (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Tasks table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            plan_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Targets table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS targets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            due_date TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Steps table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS steps (
            id TEXT PRIMARY KEY,
            target_id TEXT NOT NULL,
            title TEXT NOT NULL,
            weight INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Todos table (independent)
    conn.execute(
        "CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            due_date TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Milestones table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            target_date TEXT,
            plan_id TEXT,
            task_id TEXT,
            target_id TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
            FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE SET NULL
        )",
        [],
    )?;

    info!("Database initialized successfully");
    Ok(())
}

// ============================================================================
// Plan CRUD
// ============================================================================

#[tauri::command]
fn get_plans(state: tauri::State<AppState>) -> Result<Vec<Plan>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, description, start_date, end_date, status, created_at, updated_at FROM plans")
        .map_err(|e| e.to_string())?;

    let plan_iter = stmt
        .query_map([], |row| {
            Ok(Plan {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_date: row.get(3)?,
                end_date: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(plan_iter.filter_map(|p| p.ok()).collect())
}

#[tauri::command]
fn create_plan(
    state: tauri::State<AppState>,
    title: String,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Plan, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)",
        rusqlite::params![id, title, description, start_date, end_date, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Plan {
        id,
        title,
        description,
        start_date,
        end_date,
        status: "active".to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn update_plan(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
    status: Option<String>,
) -> Result<Plan, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, title, description, start_date, end_date, status, created_at, updated_at FROM plans WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let plan: Plan = stmt
        .query_row([&id], |row| {
            Ok(Plan {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_date: row.get(3)?,
                end_date: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(plan.title);
    let new_description = description.or(plan.description);
    let new_start_date = start_date.or(plan.start_date);
    let new_end_date = end_date.or(plan.end_date);
    let new_status = status.unwrap_or(plan.status);

    conn.execute(
        "UPDATE plans SET title = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_description, new_start_date, new_end_date, new_status, now, id],
    ).map_err(|e| e.to_string())?;

    Ok(Plan {
        id: plan.id,
        title: new_title,
        description: new_description,
        start_date: new_start_date,
        end_date: new_end_date,
        status: new_status,
        created_at: plan.created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_plan(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Delete associated tasks (cascade)
    conn.execute("DELETE FROM tasks WHERE plan_id = ?", [&id])
        .map_err(|e| e.to_string())?;
    // Delete plan
    conn.execute("DELETE FROM plans WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

// ============================================================================
// Task CRUD
// ============================================================================

#[tauri::command]
fn get_tasks(state: tauri::State<AppState>) -> Result<Vec<Task>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, plan_id, title, description, start_date, end_date, status, created_at, updated_at FROM tasks")
        .map_err(|e| e.to_string())?;

    let task_iter = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                plan_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                start_date: row.get(4)?,
                end_date: row.get(5)?,
                status: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(task_iter.filter_map(|t| t.ok()).collect())
}

#[tauri::command]
fn get_tasks_by_plan(state: tauri::State<AppState>, plan_id: String) -> Result<Vec<Task>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, plan_id, title, description, start_date, end_date, status, created_at, updated_at FROM tasks WHERE plan_id = ?")
        .map_err(|e| e.to_string())?;

    let task_iter = stmt
        .query_map([&plan_id], |row| {
            Ok(Task {
                id: row.get(0)?,
                plan_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                start_date: row.get(4)?,
                end_date: row.get(5)?,
                status: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(task_iter.filter_map(|t| t.ok()).collect())
}

#[tauri::command]
fn create_task(
    state: tauri::State<AppState>,
    plan_id: String,
    title: String,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Task, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
        rusqlite::params![id, plan_id, title, description, start_date, end_date, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Task {
        id,
        plan_id,
        title,
        description,
        start_date,
        end_date,
        status: "pending".to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn update_task(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
    status: Option<String>,
) -> Result<Task, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, plan_id, title, description, start_date, end_date, status, created_at, updated_at FROM tasks WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let task: Task = stmt
        .query_row([&id], |row| {
            Ok(Task {
                id: row.get(0)?,
                plan_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                start_date: row.get(4)?,
                end_date: row.get(5)?,
                status: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(task.title);
    let new_description = description.or(task.description);
    let new_start_date = start_date.or(task.start_date);
    let new_end_date = end_date.or(task.end_date);
    let new_status = status.unwrap_or(task.status);

    conn.execute(
        "UPDATE tasks SET title = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_description, new_start_date, new_end_date, new_status, now, id],
    ).map_err(|e| e.to_string())?;

    Ok(Task {
        id: task.id,
        plan_id: task.plan_id,
        title: new_title,
        description: new_description,
        start_date: new_start_date,
        end_date: new_end_date,
        status: new_status,
        created_at: task.created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_task(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM tasks WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================================
// Target CRUD
// ============================================================================

#[tauri::command]
fn get_targets(state: tauri::State<AppState>) -> Result<Vec<Target>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, due_date, status, created_at, updated_at FROM targets",
        )
        .map_err(|e| e.to_string())?;

    let target_iter = stmt
        .query_map([], |row| {
            Ok(Target {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                progress: 0, // Will be calculated
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut targets: Vec<Target> = target_iter.filter_map(|t| t.ok()).collect();

    // Calculate progress for each target
    for target in &mut targets {
        target.progress = calculate_target_progress(&conn, &target.id)?;
    }

    Ok(targets)
}

fn calculate_target_progress(conn: &Connection, target_id: &str) -> Result<i32, String> {
    let mut stmt = conn
        .prepare("SELECT weight, status FROM steps WHERE target_id = ?")
        .map_err(|e| e.to_string())?;

    let step_iter = stmt
        .query_map([target_id], |row| {
            Ok((row.get::<_, i32>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;

    let mut total_weight = 0;
    let mut completed_weight = 0;

    for step in step_iter.filter_map(|s| s.ok()) {
        total_weight += step.0;
        if step.1 == "completed" {
            completed_weight += step.0;
        }
    }

    if total_weight == 0 {
        return Ok(0);
    }

    Ok((completed_weight * 100) / total_weight)
}

#[tauri::command]
fn create_target(
    state: tauri::State<AppState>,
    title: String,
    description: Option<String>,
    due_date: Option<String>,
) -> Result<Target, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO targets (id, title, description, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', ?, ?)",
        rusqlite::params![id, title, description, due_date, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Target {
        id,
        title,
        description,
        due_date,
        status: "active".to_string(),
        progress: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn update_target(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    due_date: Option<String>,
    status: Option<String>,
) -> Result<Target, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, title, description, due_date, status, created_at, updated_at FROM targets WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let target: Target = stmt
        .query_row([&id], |row| {
            Ok(Target {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                progress: 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(target.title);
    let new_description = description.or(target.description);
    let new_due_date = due_date.or(target.due_date);
    let new_status = status.unwrap_or(target.status);

    conn.execute(
        "UPDATE targets SET title = ?, description = ?, due_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_description, new_due_date, new_status, now, id],
    ).map_err(|e| e.to_string())?;

    let progress = calculate_target_progress(&conn, &id)?;

    Ok(Target {
        id: target.id,
        title: new_title,
        description: new_description,
        due_date: new_due_date,
        status: new_status,
        progress,
        created_at: target.created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_target(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    // Steps will be cascade deleted
    conn.execute("DELETE FROM targets WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================================
// Step CRUD
// ============================================================================

#[tauri::command]
fn get_steps(state: tauri::State<AppState>, target_id: String) -> Result<Vec<Step>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, target_id, title, weight, status, created_at, updated_at FROM steps WHERE target_id = ?")
        .map_err(|e| e.to_string())?;

    let step_iter = stmt
        .query_map([&target_id], |row| {
            Ok(Step {
                id: row.get(0)?,
                target_id: row.get(1)?,
                title: row.get(2)?,
                weight: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(step_iter.filter_map(|s| s.ok()).collect())
}

#[tauri::command]
fn create_step(
    state: tauri::State<AppState>,
    target_id: String,
    title: String,
    weight: i32,
) -> Result<Step, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Validate weight sum (existing + new <= 100)
    let mut stmt = conn
        .prepare("SELECT COALESCE(SUM(weight), 0) FROM steps WHERE target_id = ?")
        .map_err(|e| e.to_string())?;

    let current_weight: i32 = stmt
        .query_row([&target_id], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    if current_weight + weight > 100 {
        return Err(format!(
            "Step weights would exceed 100%. Current: {}%, New: {}%",
            current_weight, weight
        ));
    }

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?)",
        rusqlite::params![id, target_id, title, weight, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Step {
        id,
        target_id,
        title,
        weight,
        status: "pending".to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn update_step(
    state: tauri::State<AppState>,
    id: String,
    _target_id: String,
    title: Option<String>,
    weight: Option<i32>,
    status: Option<String>,
) -> Result<Step, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, target_id, title, weight, status, created_at, updated_at FROM steps WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let step: Step = stmt
        .query_row([&id], |row| {
            Ok(Step {
                id: row.get(0)?,
                target_id: row.get(1)?,
                title: row.get(2)?,
                weight: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(step.title);
    let new_weight = weight.unwrap_or(step.weight);
    let new_status = status.unwrap_or(step.status);

    // Validate weight sum if weight is being changed
    if let Some(w) = weight {
        let mut check_stmt = conn
            .prepare("SELECT COALESCE(SUM(weight), 0) FROM steps WHERE target_id = ? AND id != ?")
            .map_err(|e| e.to_string())?;

        let other_weight: i32 = check_stmt
            .query_row(rusqlite::params![step.target_id, id], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        if other_weight + w > 100 {
            return Err(format!(
                "Step weights would exceed 100%. Other steps: {}%, New: {}%",
                other_weight, w
            ));
        }
    }

    conn.execute(
        "UPDATE steps SET title = ?, weight = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_weight, new_status, now, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(Step {
        id: step.id,
        target_id: step.target_id,
        title: new_title,
        weight: new_weight,
        status: new_status,
        created_at: step.created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_step(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM steps WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================================
// Todo CRUD
// ============================================================================

#[tauri::command]
fn get_todos(state: tauri::State<AppState>) -> Result<Vec<Todo>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, content, due_date, status, created_at, updated_at FROM todos")
        .map_err(|e| e.to_string())?;

    let todo_iter = stmt
        .query_map([], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(todo_iter.filter_map(|t| t.ok()).collect())
}

#[tauri::command]
fn create_todo(
    state: tauri::State<AppState>,
    title: String,
    content: Option<String>,
    due_date: Option<String>,
) -> Result<Todo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO todos (id, title, content, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?)",
        rusqlite::params![id, title, content, due_date, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Todo {
        id,
        title,
        content,
        due_date,
        status: "pending".to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn update_todo(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    content: Option<String>,
    due_date: Option<String>,
    status: Option<String>,
) -> Result<Todo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, title, content, due_date, status, created_at, updated_at FROM todos WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let todo: Todo = stmt
        .query_row([&id], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(todo.title);
    let new_content = content.or(todo.content);
    let new_due_date = due_date.or(todo.due_date);
    let new_status = status.unwrap_or(todo.status);

    conn.execute(
        "UPDATE todos SET title = ?, content = ?, due_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_content, new_due_date, new_status, now, id],
    ).map_err(|e| e.to_string())?;

    Ok(Todo {
        id: todo.id,
        title: new_title,
        content: new_content,
        due_date: new_due_date,
        status: new_status,
        created_at: todo.created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_todo(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM todos WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================================
// Milestone CRUD
// ============================================================================

#[tauri::command]
fn get_milestones(state: tauri::State<AppState>) -> Result<Vec<Milestone>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at FROM milestones")
        .map_err(|e| e.to_string())?;

    let milestone_iter = stmt
        .query_map([], |row| {
            Ok(Milestone {
                id: row.get(0)?,
                title: row.get(1)?,
                target_date: row.get(2)?,
                plan_id: row.get(3)?,
                task_id: row.get(4)?,
                target_id: row.get(5)?,
                status: row.get(6)?,
                progress: 0, // Will be calculated
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut milestones: Vec<Milestone> = milestone_iter.filter_map(|m| m.ok()).collect();

    // Calculate progress for each milestone
    for milestone in &mut milestones {
        milestone.progress = calculate_milestone_progress(&conn, milestone)?;
    }

    Ok(milestones)
}

fn calculate_milestone_progress(conn: &Connection, milestone: &Milestone) -> Result<i32, String> {
    // If linked to Plan, calculate from Tasks
    if let Some(ref plan_id) = milestone.plan_id {
        let mut stmt = conn
            .prepare("SELECT COUNT(*), SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) FROM tasks WHERE plan_id = ?")
            .map_err(|e| e.to_string())?;

        let (total, done): (i32, i32) = stmt
            .query_row([plan_id], |row| Ok((row.get(0)?, row.get(1)?)))
            .map_err(|e| e.to_string())?;

        if total == 0 {
            return Ok(0);
        }
        return Ok((done * 100) / total);
    }

    // If linked to Task, return status as progress (0 or 100)
    if let Some(ref task_id) = milestone.task_id {
        let mut stmt = conn
            .prepare("SELECT status FROM tasks WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let status: String = stmt
            .query_row([task_id], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        return Ok(if status == "done" { 100 } else { 0 });
    }

    // If linked to Target, use target progress
    if let Some(ref target_id) = milestone.target_id {
        return calculate_target_progress(conn, target_id);
    }

    Ok(0)
}

#[tauri::command]
fn create_milestone(
    state: tauri::State<AppState>,
    title: String,
    target_date: Option<String>,
    plan_id: Option<String>,
    task_id: Option<String>,
    target_id: Option<String>,
) -> Result<Milestone, String> {
    // Validate that exactly one of plan_id, task_id, target_id is set
    let link_count = [plan_id.is_some(), task_id.is_some(), target_id.is_some()]
        .iter()
        .filter(|&&x| x)
        .count();

    if link_count != 1 {
        return Err("Must specify exactly one of plan_id, task_id, or target_id".to_string());
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
        rusqlite::params![id, title, target_date, plan_id, task_id, target_id, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Milestone {
        id,
        title,
        target_date,
        plan_id,
        task_id,
        target_id,
        status: "pending".to_string(),
        progress: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn update_milestone(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    target_date: Option<String>,
    status: Option<String>,
) -> Result<Milestone, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at FROM milestones WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let milestone: Milestone = stmt
        .query_row([&id], |row| {
            Ok(Milestone {
                id: row.get(0)?,
                title: row.get(1)?,
                target_date: row.get(2)?,
                plan_id: row.get(3)?,
                task_id: row.get(4)?,
                target_id: row.get(5)?,
                status: row.get(6)?,
                progress: 0,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(milestone.title.clone());
    let new_target_date = target_date.or(milestone.target_date.clone());
    let new_status = status.unwrap_or(milestone.status.clone());

    conn.execute(
        "UPDATE milestones SET title = ?, target_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_target_date, new_status, now, id],
    )
    .map_err(|e| e.to_string())?;

    // Clone again for calculate function
    let milestone_for_calc = Milestone {
        id: milestone.id.clone(),
        title: milestone.title.clone(),
        target_date: milestone.target_date.clone(),
        plan_id: milestone.plan_id.clone(),
        task_id: milestone.task_id.clone(),
        target_id: milestone.target_id.clone(),
        status: milestone.status.clone(),
        progress: milestone.progress,
        created_at: milestone.created_at.clone(),
        updated_at: milestone.updated_at.clone(),
    };
    let progress = calculate_milestone_progress(&conn, &milestone_for_calc)?;

    Ok(Milestone {
        id: milestone.id,
        title: new_title,
        target_date: new_target_date,
        plan_id: milestone.plan_id,
        task_id: milestone.task_id,
        target_id: milestone.target_id,
        status: new_status,
        progress,
        created_at: milestone.created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_milestone(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM milestones WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// ============================================================================
// Main
// ============================================================================

fn main() {
    env_logger::init();
    info!("Starting Plan Todos application");

    // Initialize database
    let db_path = dirs::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("plan-todos")
        .join("data.db");

    // Create directory if it doesn't exist
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).ok();
    }

    let conn = Connection::open(&db_path).expect("Failed to open database");
    init_db(&conn).expect("Failed to initialize database");

    info!("Database opened at: {:?}", db_path);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            db: Mutex::new(conn),
        })
        .invoke_handler(tauri::generate_handler![
            // Plan
            get_plans,
            create_plan,
            update_plan,
            delete_plan,
            // Task
            get_tasks,
            get_tasks_by_plan,
            create_task,
            update_task,
            delete_task,
            // Target
            get_targets,
            create_target,
            update_target,
            delete_target,
            // Step
            get_steps,
            create_step,
            update_step,
            delete_step,
            // Todo
            get_todos,
            create_todo,
            update_todo,
            delete_todo,
            // Milestone
            get_milestones,
            create_milestone,
            update_milestone,
            delete_milestone,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
