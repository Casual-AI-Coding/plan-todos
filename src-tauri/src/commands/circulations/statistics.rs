// Circulation statistics and logs commands

use crate::log_command;
use crate::models::CirculationLog;
use crate::AppState;

// ============================================================================
// Statistics Commands
// ============================================================================

#[tauri::command]
pub fn get_circulation_logs(
    state: tauri::State<AppState>,
    circulation_id: String,
    limit: Option<i32>,
) -> Result<Vec<CirculationLog>, String> {
    log_command!("get_circulation_logs", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let limit = limit.unwrap_or(20);

        let mut stmt = conn
            .prepare(
                "SELECT id, circulation_id, completed_at, note, period, COALESCE(count, 1) as count
                 FROM circulation_logs
                 WHERE circulation_id = ?
                 ORDER BY completed_at DESC
                 LIMIT ?",
            )
            .map_err(|e| e.to_string())?;

        let log_iter = stmt
            .query_map(rusqlite::params![circulation_id, limit], |row| {
                Ok(CirculationLog {
                    id: row.get(0)?,
                    circulation_id: row.get(1)?,
                    completed_at: row.get(2)?,
                    note: row.get(3)?,
                    period: row.get(4)?,
                    count: row.get(5)?,
                })
            })
            .map_err(|e| e.to_string())?;

        Ok(log_iter.filter_map(|l| l.ok()).collect())
    })
}

#[tauri::command]
pub fn get_circulation_logs_batch(
    state: tauri::State<AppState>,
    circulation_ids: Vec<String>,
    limit: Option<i32>,
) -> Result<std::collections::HashMap<String, Vec<CirculationLog>>, String> {
    log_command!("get_circulation_logs_batch", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let limit = limit.unwrap_or(50);
        let mut result = std::collections::HashMap::new();

        for circulation_id in circulation_ids {
            let mut stmt = conn
                .prepare(
                    "SELECT id, circulation_id, completed_at, note, period, COALESCE(count, 1) as count
                     FROM circulation_logs
                     WHERE circulation_id = ?
                     ORDER BY completed_at DESC
                     LIMIT ?",
                )
                .map_err(|e| e.to_string())?;

            let log_iter = stmt
                .query_map(rusqlite::params![circulation_id, limit], |row| {
                    Ok(CirculationLog {
                        id: row.get(0)?,
                        circulation_id: row.get(1)?,
                        completed_at: row.get(2)?,
                        note: row.get(3)?,
                        period: row.get(4)?,
                        count: row.get(5)?,
                    })
                })
                .map_err(|e| e.to_string())?;

            let logs: Vec<CirculationLog> = log_iter.filter_map(|l| l.ok()).collect();
            result.insert(circulation_id, logs);
        }

        Ok(result)
    })
}
