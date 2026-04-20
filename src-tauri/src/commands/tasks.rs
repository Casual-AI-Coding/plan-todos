// Task CRUD commands

use crate::commands::repositories::TaskRepository;
use crate::log_command;
use crate::models::Task;
use crate::AppState;

#[tauri::command]
pub fn get_task(state: tauri::State<AppState>, id: String) -> Result<Task, String> {
    log_command!("get_task", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TaskRepository::get_by_id(&conn, &id)
    })
}

#[tauri::command]
pub fn get_tasks(state: tauri::State<AppState>) -> Result<Vec<Task>, String> {
    log_command!("get_tasks", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TaskRepository::get_all(&conn)
    })
}

#[tauri::command]
pub fn get_tasks_by_plan(
    state: tauri::State<AppState>,
    plan_id: String,
) -> Result<Vec<Task>, String> {
    log_command!("get_tasks_by_plan", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TaskRepository::get_by_plan(&conn, &plan_id)
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
    priority: Option<String>,
) -> Result<Task, String> {
    log_command!("create_task", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let id = uuid::Uuid::new_v4().to_string();
        TaskRepository::create(
            &conn,
            &id,
            &plan_id,
            &title,
            description.as_deref(),
            start_date.as_deref(),
            end_date.as_deref(),
            priority.as_deref(),
        )
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
    priority: Option<String>,
) -> Result<Task, String> {
    log_command!("update_task", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TaskRepository::update(
            &conn,
            &id,
            title.as_deref(),
            description.as_deref(),
            start_date.as_deref(),
            end_date.as_deref(),
            status.as_deref(),
            priority.as_deref(),
        )
    })
}

#[tauri::command]
pub fn delete_task(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_task", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TaskRepository::delete(&conn, &id)
    })
}
