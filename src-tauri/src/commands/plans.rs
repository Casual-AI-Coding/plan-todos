// Plan CRUD commands

use crate::commands::repositories::PlanRepository;
use crate::log_command;
use crate::models::Plan;
use crate::AppState;

#[tauri::command]
pub fn get_plan(state: tauri::State<AppState>, id: String) -> Result<Plan, String> {
    log_command!("get_plan", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        PlanRepository::get_by_id(&conn, &id)
    })
}

#[tauri::command]
pub fn get_plans(state: tauri::State<AppState>) -> Result<Vec<Plan>, String> {
    log_command!("get_plans", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        PlanRepository::get_all(&conn)
    })
}

#[tauri::command]
pub fn create_plan(
    state: tauri::State<AppState>,
    title: String,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Plan, String> {
    log_command!("create_plan", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let id = uuid::Uuid::new_v4().to_string();
        PlanRepository::create(
            &conn,
            &id,
            &title,
            description.as_deref(),
            start_date.as_deref(),
            end_date.as_deref(),
        )
    })
}

#[tauri::command]
pub fn update_plan(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
    status: Option<String>,
) -> Result<Plan, String> {
    log_command!("update_plan", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        PlanRepository::update(
            &conn,
            &id,
            title.as_deref(),
            description.as_deref(),
            start_date.as_deref(),
            end_date.as_deref(),
            status.as_deref(),
        )
    })
}

#[tauri::command]
pub fn delete_plan(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_plan", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM tasks WHERE plan_id = ?", [&id])
            .map_err(|e| e.to_string())?;
        PlanRepository::delete(&conn, &id)
    })
}

#[tauri::command]
pub fn update_plan_sort_order(
    state: tauri::State<AppState>,
    id: String,
    sort_order: i32,
) -> Result<(), String> {
    log_command!("update_plan_sort_order", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        PlanRepository::update_sort_order(&conn, &id, sort_order)
    })
}

#[tauri::command]
pub fn reorder_plans(
    state: tauri::State<AppState>,
    orders: Vec<(String, i32)>,
) -> Result<usize, String> {
    log_command!("reorder_plans", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        PlanRepository::reorder(&*conn, &orders)
    })
}
