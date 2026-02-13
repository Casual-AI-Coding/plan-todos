#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;
use rusqlite::Connection;
use std::sync::Mutex;

// Database state
pub struct AppState {
    pub db: Mutex<Connection>,
}

// Data models
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub due_date: Option<String>,
    pub status: String,
    pub plan_ids: Vec<String>,
    pub milestone_id: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Plan {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub target_date: Option<String>,
    pub status: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Milestone {
    pub id: String,
    pub plan_id: String,
    pub title: String,
    pub target_date: Option<String>,
    pub status: String,
}

// Initialize database
fn init_db(conn: &Connection) -> Result<(), rusqlite::Error> {
    conn.execute(
        "CREATE TABLE IF NOT EXISTS plans (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            target_date TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            plan_id TEXT NOT NULL,
            title TEXT NOT NULL,
            target_date TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            FOREIGN KEY (plan_id) REFERENCES plans(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            due_date TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            milestone_id TEXT,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (milestone_id) REFERENCES milestones(id)
        )",
        [],
    )?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS todo_plans (
            todo_id TEXT NOT NULL,
            plan_id TEXT NOT NULL,
            PRIMARY KEY (todo_id, plan_id),
            FOREIGN KEY (todo_id) REFERENCES todos(id),
            FOREIGN KEY (plan_id) REFERENCES plans(id)
        )",
        [],
    )?;

    info!("Database initialized successfully");
    Ok(())
}

// Tauri commands
#[tauri::command]
fn get_todos(state: tauri::State<AppState>) -> Result<Vec<Todo>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, content, due_date, status, milestone_id, created_at, updated_at FROM todos")
        .map_err(|e| e.to_string())?;

    let todo_iter = stmt
        .query_map([], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                plan_ids: vec![],
                milestone_id: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut todos: Vec<Todo> = todo_iter.filter_map(|t| t.ok()).collect();

    // Get plan associations
    for todo in &mut todos {
        let mut plan_stmt = conn
            .prepare("SELECT plan_id FROM todo_plans WHERE todo_id = ?")
            .map_err(|e| e.to_string())?;

        let plan_iter = plan_stmt
            .query_map([&todo.id], |row| row.get::<_, String>(0))
            .map_err(|e| e.to_string())?;

        todo.plan_ids = plan_iter.filter_map(|p| p.ok()).collect();
    }

    Ok(todos)
}

#[tauri::command]
fn create_todo(
    state: tauri::State<AppState>,
    title: String,
    content: Option<String>,
    due_date: Option<String>,
    plan_ids: Vec<String>,
) -> Result<Todo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO todos (id, title, content, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?)",
        rusqlite::params![id, title, content, due_date, now, now],
    ).map_err(|e| e.to_string())?;

    // Link to plans
    for plan_id in &plan_ids {
        conn.execute(
            "INSERT OR IGNORE INTO todo_plans (todo_id, plan_id) VALUES (?, ?)",
            rusqlite::params![id, plan_id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(Todo {
        id,
        title,
        content,
        due_date,
        status: "pending".to_string(),
        plan_ids,
        milestone_id: None,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn get_plans(state: tauri::State<AppState>) -> Result<Vec<Plan>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, target_date, status, created_at, updated_at FROM plans",
        )
        .map_err(|e| e.to_string())?;

    let plan_iter = stmt
        .query_map([], |row| {
            Ok(Plan {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                target_date: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
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
    target_date: Option<String>,
) -> Result<Plan, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO plans (id, title, description, target_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', ?, ?)",
        rusqlite::params![id, title, description, target_date, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Plan {
        id,
        title,
        description,
        target_date,
        status: "active".to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
fn get_milestones(
    state: tauri::State<AppState>,
    plan_id: String,
) -> Result<Vec<Milestone>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, plan_id, title, target_date, status FROM milestones WHERE plan_id = ?")
        .map_err(|e| e.to_string())?;

    let milestone_iter = stmt
        .query_map([plan_id], |row| {
            Ok(Milestone {
                id: row.get(0)?,
                plan_id: row.get(1)?,
                title: row.get(2)?,
                target_date: row.get(3)?,
                status: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(milestone_iter.filter_map(|m| m.ok()).collect())
}

#[tauri::command]
fn update_todo(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    content: Option<String>,
    due_date: Option<String>,
    status: Option<String>,
    plan_ids: Option<Vec<String>>,
) -> Result<Todo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    // Get current todo
    let mut stmt = conn
        .prepare("SELECT id, title, content, due_date, status, milestone_id, created_at, updated_at FROM todos WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let todo: Todo = stmt
        .query_row([&id], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                plan_ids: vec![],
                milestone_id: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
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

    // Update plan associations if provided
    if let Some(ids) = plan_ids {
        conn.execute("DELETE FROM todo_plans WHERE todo_id = ?", [&id])
            .map_err(|e| e.to_string())?;
        for plan_id in ids {
            conn.execute(
                "INSERT OR IGNORE INTO todo_plans (todo_id, plan_id) VALUES (?, ?)",
                rusqlite::params![id, plan_id],
            )
            .map_err(|e| e.to_string())?;
        }
    }

    // Get updated plan_ids
    let mut plan_stmt = conn
        .prepare("SELECT plan_id FROM todo_plans WHERE todo_id = ?")
        .map_err(|e| e.to_string())?;
    let plan_iter = plan_stmt
        .query_map([&id], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?;
    let new_plan_ids: Vec<String> = plan_iter.filter_map(|p| p.ok()).collect();

    Ok(Todo {
        id,
        title: new_title,
        content: new_content,
        due_date: new_due_date,
        status: new_status,
        plan_ids: new_plan_ids,
        milestone_id: todo.milestone_id,
        created_at: todo.created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_todo(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM todo_plans WHERE todo_id = ?", [&id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM todos WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
fn update_plan(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    target_date: Option<String>,
    status: Option<String>,
) -> Result<Plan, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    // Get current plan
    let mut stmt = conn
        .prepare("SELECT id, title, description, target_date, status, created_at, updated_at FROM plans WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let plan: Plan = stmt
        .query_row([&id], |row| {
            Ok(Plan {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                target_date: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(plan.title);
    let new_description = description.or(plan.description);
    let new_target_date = target_date.or(plan.target_date);
    let new_status = status.unwrap_or(plan.status);

    conn.execute(
        "UPDATE plans SET title = ?, description = ?, target_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_description, new_target_date, new_status, now, id],
    ).map_err(|e| e.to_string())?;

    Ok(Plan {
        id,
        title: new_title,
        description: new_description,
        target_date: new_target_date,
        status: new_status,
        created_at: plan.created_at,
        updated_at: now,
    })
}

#[tauri::command]
fn delete_plan(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Delete milestone associations first
    conn.execute("DELETE FROM milestones WHERE plan_id = ?", [&id])
        .map_err(|e| e.to_string())?;
    // Delete todo associations
    conn.execute("DELETE FROM todo_plans WHERE plan_id = ?", [&id])
        .map_err(|e| e.to_string())?;
    // Delete plan
    conn.execute("DELETE FROM plans WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}

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
            get_todos,
            create_todo,
            update_todo,
            delete_todo,
            get_plans,
            create_plan,
            update_plan,
            delete_plan,
            get_milestones,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
