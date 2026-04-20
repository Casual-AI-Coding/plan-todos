// Milestone CRUD commands

use crate::commands::repositories::MilestoneRepository;
use crate::log_command;
use crate::models::Milestone;
use crate::AppState;

#[tauri::command]
pub fn get_milestone(state: tauri::State<AppState>, id: String) -> Result<Milestone, String> {
    log_command!("get_milestone", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        MilestoneRepository::get_by_id_with_progress(&conn, &id)
    })
}

#[tauri::command]
pub fn get_milestones(state: tauri::State<AppState>) -> Result<Vec<Milestone>, String> {
    log_command!("get_milestones", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        MilestoneRepository::get_all_with_progress(&conn)
    })
}

#[tauri::command]
pub fn create_milestone(
    state: tauri::State<AppState>,
    title: String,
    target_date: Option<String>,
    biz_type: Option<String>,
    biz_id: Option<String>,
) -> Result<Milestone, String> {
    log_command!("create_milestone", {
        // Validate: if biz_type is set, biz_id must also be set (and vice versa)
        let has_biz = biz_type.is_some() || biz_id.is_some();
        if has_biz && (biz_type.is_none() || biz_id.is_none()) {
            return Err("Both biz_type and biz_id must be set together, or neither".to_string());
        }

        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let id = uuid::Uuid::new_v4().to_string();
        MilestoneRepository::create(
            &conn,
            &id,
            &title,
            target_date.as_deref(),
            biz_type.as_deref(),
            biz_id.as_deref(),
        )
    })
}

#[tauri::command]
pub fn update_milestone(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    target_date: Option<String>,
    biz_type: Option<String>,
    biz_id: Option<String>,
    status: Option<String>,
) -> Result<Milestone, String> {
    log_command!("update_milestone", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        MilestoneRepository::update(
            &conn,
            &id,
            title.as_deref(),
            target_date.as_deref(),
            biz_type.as_deref(),
            biz_id.as_deref(),
            status.as_deref(),
        )
    })
}

#[tauri::command]
pub fn delete_milestone(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_milestone", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        MilestoneRepository::delete(&conn, &id)
    })
}
