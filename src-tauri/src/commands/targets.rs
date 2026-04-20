// Target CRUD commands

use crate::commands::repositories::TargetRepository;
use crate::log_command;
use crate::models::Target;
use crate::AppState;

#[tauri::command]
pub fn get_target(state: tauri::State<AppState>, id: String) -> Result<Target, String> {
    log_command!("get_target", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TargetRepository::get_by_id(&conn, &id)
    })
}

#[tauri::command]
pub fn get_targets(state: tauri::State<AppState>) -> Result<Vec<Target>, String> {
    log_command!("get_targets", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TargetRepository::get_all(&conn)
    })
}

#[tauri::command]
pub fn create_target(
    state: tauri::State<AppState>,
    title: String,
    description: Option<String>,
    due_date: Option<String>,
) -> Result<Target, String> {
    log_command!("create_target", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let id = uuid::Uuid::new_v4().to_string();
        TargetRepository::create(
            &conn,
            &id,
            &title,
            description.as_deref(),
            due_date.as_deref(),
        )
    })
}

#[tauri::command]
pub fn update_target(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    due_date: Option<String>,
    status: Option<String>,
) -> Result<Target, String> {
    log_command!("update_target", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TargetRepository::update(
            &conn,
            &id,
            title.as_deref(),
            description.as_deref(),
            due_date.as_deref(),
            status.as_deref(),
        )
    })
}

#[tauri::command]
pub fn delete_target(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_target", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TargetRepository::delete(&conn, &id)
    })
}

#[tauri::command]
pub fn update_target_sort_order(
    state: tauri::State<AppState>,
    id: String,
    sort_order: i32,
) -> Result<(), String> {
    log_command!("update_target_sort_order", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TargetRepository::update_sort_order(&conn, &id, sort_order)
    })
}

#[tauri::command]
pub fn reorder_targets(
    state: tauri::State<AppState>,
    orders: Vec<(String, i32)>,
) -> Result<usize, String> {
    log_command!("reorder_targets", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TargetRepository::reorder(&conn, &orders)
    })
}
