// Sync Engine - orchestrates the sync process
// Phase 6: Core synchronization logic

use crate::models::{SyncConfig, SyncLog, SyncMetadata, SyncStatus};
use rusqlite::Connection;
use std::sync::Mutex;

/// Main sync engine that orchestrates the synchronization process
pub struct SyncEngine {
    db: Mutex<Connection>,
}

impl SyncEngine {
    pub fn new(db: Mutex<Connection>) -> Self {
        Self { db }
    }

    /// Get current sync status
    pub fn get_status(&self) -> Result<SyncStatus, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        let config = get_sync_config(&conn)?;
        let pending_changes = count_pending_changes(&conn)?;
        let conflicts_count = count_conflicts(&conn)?;

        Ok(SyncStatus {
            enabled: config.enabled,
            is_syncing: false, // TODO: track sync state
            last_sync_at: config.last_sync_at,
            last_sync_status: config.last_sync_status,
            pending_changes,
            conflicts_count,
        })
    }

    /// Trigger a manual sync
    pub fn trigger_sync(&self) -> Result<(), String> {
        // TODO: Implement in Wave 5
        Err("Sync not yet implemented".to_string())
    }
}

// Helper functions

fn get_sync_config(conn: &Connection) -> Result<SyncConfig, String> {
    conn.query_row(
        "SELECT id, enabled, provider_type, server_url, username, password_encrypted,
                remote_path, sync_interval_minutes, conflict_strategy, last_sync_at,
                last_sync_status, last_sync_error, created_at, updated_at
         FROM sync_config WHERE id = 'default'",
        [],
        |row| {
            Ok(SyncConfig {
                id: row.get(0)?,
                enabled: row.get::<_, i32>(1)? != 0,
                provider_type: row.get(2)?,
                server_url: row.get(3)?,
                username: row.get(4)?,
                password_encrypted: row.get(5)?,
                remote_path: row.get(6)?,
                sync_interval_minutes: row.get(7)?,
                conflict_strategy: row.get(8)?,
                last_sync_at: row.get(9)?,
                last_sync_status: row.get(10)?,
                last_sync_error: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(13)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

fn count_pending_changes(conn: &Connection) -> Result<i64, String> {
    conn.query_row(
        "SELECT COUNT(*) FROM sync_metadata WHERE sync_status = 'pending'",
        [],
        |row| row.get(0),
    )
    .map_err(|e| e.to_string())
}

fn count_conflicts(conn: &Connection) -> Result<i64, String> {
    conn.query_row(
        "SELECT COUNT(*) FROM sync_metadata WHERE sync_status = 'conflict'",
        [],
        |row| row.get(0),
    )
    .map_err(|e| e.to_string())
}
