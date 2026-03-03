// Circulation statistics and logs commands

use crate::log_command;
use crate::models::CirculationLog;
use crate::AppState;

// ============================================================================
// Constants
// ============================================================================
const DEFAULT_CIRCULATION_LOGS_LIMIT: i32 = 20;
const DEFAULT_LOGS_BATCH_LIMIT: i32 = 50;
const MAX_LOGS_LIMIT: i32 = 100;

// ============================================================================
// Statistics Commands
// ============================================================================

// ============================================================================

#[tauri::command]
pub fn get_circulation_logs(
    state: tauri::State<AppState>,
    circulation_id: String,
    limit: Option<i32>,
) -> Result<Vec<CirculationLog>, String> {
    log_command!("get_circulation_logs", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let limit = limit.unwrap_or(DEFAULT_CIRCULATION_LOGS_LIMIT).min(MAX_LOGS_LIMIT);

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
        let limit = limit.unwrap_or(DEFAULT_LOGS_BATCH_LIMIT).min(MAX_LOGS_LIMIT);
        let mut result = std::collections::HashMap::new();

        // Early return if no circulation_ids provided
        if circulation_ids.is_empty() {
            return Ok(result);
        }

        // Build IN clause placeholders: ["?", "?", ...]
        let placeholders: Vec<&str> = circulation_ids.iter().map(|_| "?").collect();
        let in_clause = placeholders.join(", ");

        // Build SQL with IN clause
        let sql = format!(
            "SELECT id, circulation_id, completed_at, note, period, COALESCE(count, 1) as count
             FROM circulation_logs
             WHERE circulation_id IN ({})
             ORDER BY circulation_id, completed_at DESC",
            in_clause
        );

        // Prepare and execute single query
        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;

        // Build parameters: circulation_ids as slice
        let params: Vec<&dyn rusqlite::ToSql> = circulation_ids
            .iter()
            .map(|s| s as &dyn rusqlite::ToSql)
            .collect();

        let log_iter = stmt
            .query_map(params.as_slice(), |row| {
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

        // Collect all logs
        let all_logs: Vec<CirculationLog> = log_iter.filter_map(|l| l.ok()).collect();

        // Group by circulation_id in Rust and limit each group
        for (circulation_id, logs) in
            all_logs
                .into_iter()
                .fold(std::collections::HashMap::new(), |mut acc, log| {
                    acc.entry(log.circulation_id.clone())
                        .or_insert_with(Vec::new)
                        .push(log);
                    acc
                })
        {
            // Limit each circulation_id to at most `limit` records
            let limited_logs: Vec<CirculationLog> = logs.into_iter().take(limit as usize).collect();
            result.insert(circulation_id, limited_logs);
        }

        Ok(result)
    })
}
