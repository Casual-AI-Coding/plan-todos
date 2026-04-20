// Circulation CRUD commands

pub mod checkin;
pub mod statistics;

pub use checkin::{checkin_circulation, undo_checkin_circulation};
pub use statistics::{get_circulation_logs, get_circulation_logs_batch};

use crate::commands::repositories::CirculationRepository;
use crate::commands::validation;
use crate::log_command;
use crate::models::Circulation;
use crate::AppState;

// ============================================================================
// CRUD Commands
// ============================================================================

#[tauri::command]
pub fn get_circulation(state: tauri::State<AppState>, id: String) -> Result<Circulation, String> {
    log_command!("get_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        CirculationRepository::get_by_id(&conn, &id)
    })
}

#[tauri::command]
pub fn get_circulations(state: tauri::State<AppState>) -> Result<Vec<Circulation>, String> {
    log_command!("get_circulations", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        CirculationRepository::get_all(&conn)
    })
}

#[tauri::command]
pub fn get_circulations_by_type(
    state: tauri::State<AppState>,
    circulation_type: String,
    frequency: Option<String>,
) -> Result<Vec<Circulation>, String> {
    log_command!("get_circulations_by_type", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        CirculationRepository::get_by_type(&conn, &circulation_type, frequency.as_deref())
    })
}

#[tauri::command]
pub fn create_circulation(
    state: tauri::State<AppState>,
    title: String,
    circulation_type: String,
    frequency: Option<String>,
    frequency_config: Option<String>,
    target_count: Option<i32>,
) -> Result<Circulation, String> {
    // Validate inputs
    validation::validate_title(&title)?;
    validation::validate_circulation_type(&circulation_type)?;
    if let Some(ref f) = frequency {
        validation::validate_frequency(f)?;
    }

    log_command!("create_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let id = uuid::Uuid::new_v4().to_string();

        CirculationRepository::create(
            &conn,
            &id,
            &title,
            &circulation_type,
            frequency.as_deref(),
            frequency_config.as_deref(),
            target_count,
        )
    })
}

#[tauri::command]
pub fn update_circulation(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    circulation_type: Option<String>,
    frequency: Option<String>,
    frequency_config: Option<String>,
    target_count: Option<i32>,
    status: Option<String>,
) -> Result<Circulation, String> {
    // Validate inputs
    if let Some(ref t) = title {
        validation::validate_title(t)?;
    }
    if let Some(ref ct) = circulation_type {
        validation::validate_circulation_type(ct)?;
    }
    if let Some(ref f) = frequency {
        validation::validate_frequency(f)?;
    }
    if let Some(ref s) = status {
        validation::validate_circulation_status(s)?;
    }

    log_command!("update_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        CirculationRepository::update(
            &conn,
            &id,
            title.as_deref(),
            circulation_type.as_deref(),
            frequency.as_deref(),
            frequency_config.as_deref(),
            target_count,
            status.as_deref(),
        )
    })
}

#[tauri::command]
pub fn delete_circulation(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        CirculationRepository::delete(&conn, &id)
    })
}
