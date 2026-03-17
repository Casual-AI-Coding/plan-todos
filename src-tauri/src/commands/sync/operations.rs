// Sync operations commands
// Phase 6: Sync execution and status

use crate::models::{AppState, SyncLog, SyncStatus};
use tauri::State;

/// Get current sync status
#[tauri::command]
pub fn get_sync_status(state: State<AppState>) -> Result<SyncStatus, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    // Get config
    let (enabled, last_sync_at, last_sync_status): (i32, Option<String>, Option<String>) = conn
        .query_row(
            "SELECT enabled, last_sync_at, last_sync_status FROM sync_config WHERE id = 'default'",
            [],
            |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
        )
        .map_err(|e| e.to_string())?;
    
    // Count pending changes
    let pending_changes: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM sync_metadata WHERE sync_status = 'pending'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    
    // Count conflicts
    let conflicts_count: i64 = conn
        .query_row(
            "SELECT COUNT(*) FROM sync_metadata WHERE sync_status = 'conflict'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;
    
    Ok(SyncStatus {
        enabled: enabled != 0,
        is_syncing: false,
        last_sync_at,
        last_sync_status,
        pending_changes,
        conflicts_count,
    })
}

/// Trigger a manual sync
#[tauri::command]
pub async fn trigger_sync(state: State<'_, AppState>) -> Result<(), String> {
    // TODO: Implement sync trigger in Wave 5
    Err("Manual sync not yet implemented".to_string())
}

/// Get count of pending changes
#[tauri::command]
pub fn get_pending_changes_count(state: State<AppState>) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    conn.query_row(
        "SELECT COUNT(*) FROM sync_metadata WHERE sync_status = 'pending'",
        [],
        |row| row.get(0),
    ).map_err(|e| e.to_string())
}

/// Get sync logs (paginated)
#[tauri::command]
pub fn get_sync_logs(
    state: State<AppState>,
    limit: Option<i32>,
    offset: Option<i32>,
) -> Result<Vec<SyncLog>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let limit = limit.unwrap_or(50);
    let offset = offset.unwrap_or(0);
    
    let mut stmt = conn
        .prepare(
            "SELECT id, started_at, completed_at, status, entities_uploaded,
                    entities_downloaded, conflicts_count, error_message, duration_ms
             FROM sync_log
             ORDER BY started_at DESC
             LIMIT ? OFFSET ?",
        )
        .map_err(|e| e.to_string())?;
    
    let logs = stmt
        .query_map(rusqlite::params![limit, offset], |row| {
            Ok(SyncLog {
                id: row.get(0)?,
                started_at: row.get(1)?,
                completed_at: row.get(2)?,
                status: row.get(3)?,
                entities_uploaded: row.get(4)?,
                entities_downloaded: row.get(5)?,
                conflicts_count: row.get(6)?,
                error_message: row.get(7)?,
                duration_ms: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();
    
    Ok(logs)
}