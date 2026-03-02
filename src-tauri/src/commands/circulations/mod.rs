// Circulation CRUD commands

pub mod checkin;
pub mod statistics;

pub use checkin::{checkin_circulation, undo_checkin_circulation};
pub use statistics::{get_circulation_logs, get_circulation_logs_batch};

use crate::commands::validation;
use crate::log_command;
use crate::models::{Circulation, CirculationLog};
use crate::AppState;

// ============================================================================
// CRUD Commands
// ============================================================================

#[tauri::command]
pub fn get_circulation(state: tauri::State<AppState>, id: String) -> Result<Circulation, String> {
    log_command!("get_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        stmt.query_row([&id], |row| {
            Ok(Circulation {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                circulation_type: row.get(3)?,
                frequency: row.get(4)?,
                frequency_config: row.get(5)?,
                target_count: row.get(6)?,
                current_count: row.get(7)?,
                streak_count: row.get(8)?,
                best_streak: row.get(9)?,
                last_completed_at: row.get(10)?,
                status: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(13)?,
            })
        })
        .map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn get_circulations(state: tauri::State<AppState>) -> Result<Vec<Circulation>, String> {
    log_command!("get_circulations", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations ORDER BY created_at DESC",
            )
            .map_err(|e| e.to_string())?;

        let circ_iter = stmt
            .query_map([], |row| {
                Ok(Circulation {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    circulation_type: row.get(3)?,
                    frequency: row.get(4)?,
                    frequency_config: row.get(5)?,
                    target_count: row.get(6)?,
                    current_count: row.get(7)?,
                    streak_count: row.get(8)?,
                    best_streak: row.get(9)?,
                    last_completed_at: row.get(10)?,
                    status: row.get(11)?,
                    created_at: row.get(12)?,
                    updated_at: row.get(13)?,
                })
            })
            .map_err(|e| e.to_string())?;

        Ok(circ_iter.filter_map(|c| c.ok()).collect())
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

        let (query, params): (&str, Vec<String>) = if frequency.is_some() {
            ("SELECT id, title, content, circulation_type, frequency, frequency_config, target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at FROM circulations WHERE circulation_type = ?1 AND frequency = ?2 AND status = 'active' ORDER BY created_at DESC",
             vec![circulation_type, frequency.unwrap()])
        } else {
            ("SELECT id, title, content, circulation_type, frequency, frequency_config, target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at FROM circulations WHERE circulation_type = ?1 AND status = 'active' ORDER BY created_at DESC",
             vec![circulation_type])
        };

        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let params_ref: Vec<&dyn rusqlite::ToSql> =
            params.iter().map(|p| p as &dyn rusqlite::ToSql).collect();

        let rows = stmt
            .query_map(params_ref.as_slice(), |row| {
                Ok(Circulation {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    circulation_type: row.get(3)?,
                    frequency: row.get(4)?,
                    frequency_config: row.get(5)?,
                    target_count: row.get(6)?,
                    current_count: row.get(7)?,
                    streak_count: row.get(8)?,
                    best_streak: row.get(9)?,
                    last_completed_at: row.get(10)?,
                    status: row.get(11)?,
                    created_at: row.get(12)?,
                    updated_at: row.get(13)?,
                })
            })
            .map_err(|e| e.to_string())?;

        Ok(rows.filter_map(|c| c.ok()).collect())
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
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO circulations (id, title, content, circulation_type, frequency, frequency_config, target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at)
             VALUES (?, ?, NULL, ?, ?, ?, ?, 0, 0, 0, NULL, 'active', ?, ?)",
            rusqlite::params![id, title, circulation_type, frequency, frequency_config, target_count, now, now],
        ).map_err(|e| e.to_string())?;

        Ok(Circulation {
            id,
            title,
            content: None,
            circulation_type,
            frequency,
            frequency_config,
            target_count,
            current_count: 0,
            streak_count: 0,
            best_streak: 0,
            last_completed_at: None,
            status: "active".to_string(),
            created_at: now.clone(),
            updated_at: now,
        })
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
        let now = chrono::Utc::now().to_rfc3339();

        // Get existing
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        let existing: Circulation = stmt
            .query_row([&id], |row| {
                Ok(Circulation {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    circulation_type: row.get(3)?,
                    frequency: row.get(4)?,
                    frequency_config: row.get(5)?,
                    target_count: row.get(6)?,
                    current_count: row.get(7)?,
                    streak_count: row.get(8)?,
                    best_streak: row.get(9)?,
                    last_completed_at: row.get(10)?,
                    status: row.get(11)?,
                    created_at: row.get(12)?,
                    updated_at: row.get(13)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let new_title = title.unwrap_or(existing.title);
        let new_type = circulation_type.unwrap_or(existing.circulation_type);
        let new_freq = frequency.or(existing.frequency);
        let new_config = frequency_config.or(existing.frequency_config);
        let new_target = target_count.or(existing.target_count);
        let new_status = status.unwrap_or(existing.status);

        conn.execute(
            "UPDATE circulations SET title = ?, circulation_type = ?, frequency = ?, frequency_config = ?, target_count = ?, status = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![new_title, new_type, new_freq, new_config, new_target, new_status, now, id],
        ).map_err(|e| e.to_string())?;

        Ok(Circulation {
            id: existing.id,
            title: new_title,
            content: existing.content,
            circulation_type: new_type,
            frequency: new_freq,
            frequency_config: new_config,
            target_count: new_target,
            current_count: existing.current_count,
            streak_count: existing.streak_count,
            best_streak: existing.best_streak,
            last_completed_at: existing.last_completed_at,
            status: new_status,
            created_at: existing.created_at,
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn delete_circulation(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM circulations WHERE id = ?", [&id])
            .map_err(|e| e.to_string())?;
        Ok(())
    })
}
