// Task CRUD commands

use crate::log_command;
use crate::models::Task;
use crate::AppState;

#[tauri::command]
pub fn get_task(state: tauri::State<AppState>, id: String) -> Result<Task, String> {
    log_command!("get_task", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id, plan_id, title, description, start_date, end_date, status, created_at, updated_at FROM tasks WHERE id = ?")
            .map_err(|e| e.to_string())?;

        stmt.query_row([&id], |row| {
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
        .map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn get_tasks(state: tauri::State<AppState>) -> Result<Vec<Task>, String> {
    log_command!("get_tasks", {
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
    })
}

#[tauri::command]
pub fn get_tasks_by_plan(
    state: tauri::State<AppState>,
    plan_id: String,
) -> Result<Vec<Task>, String> {
    log_command!("get_tasks_by_plan", {
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
    })
}

#[tauri::command]
pub fn create_task(
    state: tauri::State<AppState>,
    plan_id: String,
    title: String,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Task, String> {
    log_command!("create_task", {
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
    })
}

#[tauri::command]
pub fn update_task(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
    status: Option<String>,
) -> Result<Task, String> {
    log_command!("update_task", {
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
    })
}

#[tauri::command]
pub fn delete_task(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_task", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM tasks WHERE id = ?", [&id])
            .map_err(|e| e.to_string())?;
        Ok(())
    })
}
