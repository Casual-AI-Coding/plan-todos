// Database utility commands

use crate::AppState;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct DbHealthStatus {
    pub healthy: bool,
    pub table_count: i32,
    pub foreign_keys_enabled: bool,
    pub version: String,
}

/// Verify database connection health and return diagnostic info.
/// Useful for sync pre-checks and troubleshooting.
#[tauri::command]
pub fn db_health_check(state: tauri::State<'_, AppState>) -> Result<DbHealthStatus, String> {
    let conn = state
        .db
        .lock()
        .map_err(|e| format!("Failed to lock database: {}", e))?;

    let version: String = conn
        .query_row("SELECT sqlite_version()", [], |row| row.get(0))
        .map_err(|e| format!("Database not responsive: {}", e))?;

    let table_count: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| format!("Failed to count tables: {}", e))?;

    let fk_enabled: bool = conn
        .query_row("PRAGMA foreign_keys", [], |row| row.get(0))
        .unwrap_or(false);

    Ok(DbHealthStatus {
        healthy: true,
        table_count,
        foreign_keys_enabled: fk_enabled,
        version,
    })
}
