// Change Tracker - tracks local changes for sync
// Phase 6: Incremental sync support

use rusqlite::Connection;
use std::sync::Mutex;

/// Tracks changes to entities for incremental sync
pub struct ChangeTracker {
    db: Mutex<Connection>,
}

impl ChangeTracker {
    pub fn new(db: Mutex<Connection>) -> Self {
        Self { db }
    }

    /// Record a change to an entity
    pub fn record_change(
        &self,
        entity_type: &str,
        entity_id: &str,
        device_id: &str,
    ) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO sync_metadata (entity_type, entity_id, local_modified_at, sync_status, device_id)
             VALUES (?1, ?2, ?3, 'pending', ?4)
             ON CONFLICT(entity_type, entity_id) DO UPDATE SET
                local_modified_at = ?3,
                sync_status = 'pending',
                device_id = ?4,
                updated_at = datetime('now')",
            rusqlite::params![entity_type, entity_id, now, device_id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }

    /// Mark an entity as deleted (tombstone)
    pub fn record_deletion(
        &self,
        entity_type: &str,
        entity_id: &str,
        device_id: &str,
    ) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO sync_metadata (entity_type, entity_id, local_modified_at, sync_status, is_deleted, device_id)
             VALUES (?1, ?2, ?3, 'pending', 1, ?4)
             ON CONFLICT(entity_type, entity_id) DO UPDATE SET
                local_modified_at = ?3,
                sync_status = 'pending',
                is_deleted = 1,
                device_id = ?4,
                updated_at = datetime('now')",
            rusqlite::params![entity_type, entity_id, now, device_id],
        ).map_err(|e| e.to_string())?;

        Ok(())
    }

    /// Get all pending changes
    pub fn get_pending_changes(&self) -> Result<Vec<(String, String, String)>, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT entity_type, entity_id, local_modified_at FROM sync_metadata WHERE sync_status = 'pending'")
            .map_err(|e| e.to_string())?;

        let changes = stmt
            .query_map([], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)))
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(changes)
    }
}
