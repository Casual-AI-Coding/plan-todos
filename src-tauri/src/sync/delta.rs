// Delta Calculator - computes differences for sync
// Phase 6: Incremental sync support

use rusqlite::{Connection, OptionalExtension};
use serde_json::Value;
use std::sync::{Arc, Mutex};

/// Represents an entity identifier for sync
#[derive(Debug, Clone)]
pub struct SyncEntity {
    pub entity_type: String,
    pub entity_id: String,
    pub local_modified_at: String,
    pub is_deleted: bool,
}

/// Calculates deltas between local and remote state
pub struct DeltaCalculator {
    db: Arc<Mutex<Connection>>,
}

impl DeltaCalculator {
    pub fn new(db: Arc<Mutex<Connection>>) -> Self {
        Self { db }
    }

    /// Calculate entities to upload (local changes not yet synced)
    /// Returns a list of entity identifiers in format "entity_type:entity_id"
    pub fn get_upload_delta(&self) -> Result<Vec<String>, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT entity_type, entity_id, local_modified_at, is_deleted 
                 FROM sync_metadata 
                 WHERE sync_status = 'pending'",
            )
            .map_err(|e| e.to_string())?;

        let entities = stmt
            .query_map([], |row| {
                let entity_type: String = row.get(0)?;
                let entity_id: String = row.get(1)?;
                let modified_at: String = row.get(2)?;
                let is_deleted: bool = row.get::<_, i32>(3)? != 0;
                Ok(format!(
                    "{}:{}:{}:{}",
                    entity_type, entity_id, modified_at, is_deleted
                ))
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(entities)
    }

    /// Calculate entities to download based on remote manifest
    /// Takes a list of remote entities and compares with local state
    pub fn get_download_delta(&self, remote_manifest: &[Value]) -> Result<Vec<String>, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        let mut download_list = Vec::new();

        for remote_entity in remote_manifest {
            let entity_type = remote_entity
                .get("entity_type")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let entity_id = remote_entity
                .get("entity_id")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let remote_modified_at = remote_entity
                .get("modified_at")
                .and_then(|v| v.as_str())
                .unwrap_or("");
            let remote_is_deleted = remote_entity
                .get("is_deleted")
                .and_then(|v| v.as_bool())
                .unwrap_or(false);

            // Check if we have local metadata for this entity
            let local_meta = conn
                .query_row(
                    "SELECT local_modified_at, sync_status, is_deleted 
                     FROM sync_metadata 
                     WHERE entity_type = ?1 AND entity_id = ?2",
                    rusqlite::params![entity_type, entity_id],
                    |row| {
                        Ok((
                            row.get::<_, Option<String>>(0)?,
                            row.get::<_, String>(1)?,
                            row.get::<_, i32>(2)? != 0,
                        ))
                    },
                )
                .optional()
                .map_err(|e: rusqlite::Error| e.to_string())?;

            match local_meta {
                // Entity doesn't exist locally - download it
                None => {
                    if !remote_is_deleted {
                        download_list.push(format!("{}:{}", entity_type, entity_id));
                    }
                }
                // Entity exists - check if remote is newer
                Some((local_modified, sync_status, local_deleted)) => {
                    // Skip if already synced and no newer remote version
                    if sync_status == "synced"
                        && local_modified.as_deref() >= Some(remote_modified_at)
                    {
                        continue;
                    }

                    // Conflict detection: both modified
                    if sync_status == "pending"
                        && local_modified.as_deref() > Some(remote_modified_at)
                    {
                        // Local is newer, don't download (will be handled as conflict)
                        continue;
                    }

                    // Remote is newer or local was deleted remotely
                    if remote_modified_at > local_modified.as_deref().unwrap_or("")
                        || remote_is_deleted
                    {
                        download_list.push(format!(
                            "{}:{}:{}",
                            entity_type, entity_id, remote_is_deleted
                        ));
                    }
                }
            }
        }

        Ok(download_list)
    }

    /// Get all entities that need to be uploaded (detailed version)
    pub fn get_upload_entities(&self) -> Result<Vec<SyncEntity>, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT entity_type, entity_id, local_modified_at, is_deleted 
                 FROM sync_metadata 
                 WHERE sync_status = 'pending'",
            )
            .map_err(|e| e.to_string())?;

        let entities = stmt
            .query_map([], |row| {
                Ok(SyncEntity {
                    entity_type: row.get(0)?,
                    entity_id: row.get(1)?,
                    local_modified_at: row.get(2)?,
                    is_deleted: row.get::<_, i32>(3)? != 0,
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(entities)
    }

    /// Mark an entity as synced after successful upload
    pub fn mark_synced(&self, entity_type: &str, entity_id: &str) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "UPDATE sync_metadata 
             SET sync_status = 'synced', remote_modified_at = ?1, updated_at = datetime('now')
             WHERE entity_type = ?2 AND entity_id = ?3",
            rusqlite::params![now, entity_type, entity_id],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }

    /// Mark an entity as having a conflict
    pub fn mark_conflict(&self, entity_type: &str, entity_id: &str) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE sync_metadata 
             SET sync_status = 'conflict', updated_at = datetime('now')
             WHERE entity_type = ?1 AND entity_id = ?2",
            rusqlite::params![entity_type, entity_id],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }
}
