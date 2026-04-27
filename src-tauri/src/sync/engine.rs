// Sync Engine - orchestrates the sync process
// Phase 6: Core synchronization logic

use crate::models::{SyncConfig, SyncStatus};
use crate::sync::client::WebDAVClient;
use crate::sync::conflict::{ConflictResolution, ConflictResolver};
use crate::sync::delta::DeltaCalculator;
use crate::sync::serializer::SyncSerializer;
use crate::sync::state::SyncState;
use rusqlite::Connection;
use std::sync::{Arc, Mutex};
use std::time::Instant;

/// Sync result summary
#[derive(Debug, serde::Serialize)]
pub struct SyncResult {
    pub uploaded: i32,
    pub downloaded: i32,
    pub conflicts: i32,
    pub errors: Vec<String>,
}

/// Main sync engine that orchestrates the synchronization process
pub struct SyncEngine {
    db: Arc<Mutex<Connection>>,
    sync_state: Option<Arc<SyncState>>,
}

impl SyncEngine {
    /// Create a new sync engine with database only (backward compatible)
    pub fn new(db: Arc<Mutex<Connection>>) -> Self {
        Self {
            db,
            sync_state: None,
        }
    }

    /// Create a new sync engine with sync state for progress tracking
    pub fn with_sync_state(db: Arc<Mutex<Connection>>, sync_state: Arc<SyncState>) -> Self {
        Self {
            db,
            sync_state: Some(sync_state),
        }
    }

    /// Helper to set syncing state
    fn set_syncing(&self, progress: u32) {
        if let Some(state) = &self.sync_state {
            state.set_syncing(progress);
        }
    }

    /// Helper to set idle state
    fn set_idle(&self) {
        if let Some(state) = &self.sync_state {
            state.set_idle();
        }
    }

    /// Helper to set error state
    fn set_error(&self, message: &str) {
        if let Some(state) = &self.sync_state {
            state.set_error(message);
        }
    }

    /// Get current sync status
    pub fn get_status(&self) -> Result<SyncStatus, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        let config = get_sync_config(&conn)?;
        let pending_changes = count_pending_changes(&conn)?;
        let conflicts_count = count_conflicts(&conn)?;

        // Check if currently syncing using SyncState
        let is_syncing = self.sync_state.as_ref().map_or(false, |s| {
            matches!(
                s.get_status(),
                crate::sync::state::SyncStatus::Syncing { .. }
            )
        });

        Ok(SyncStatus {
            enabled: config.enabled,
            is_syncing,
            last_sync_at: config.last_sync_at,
            last_sync_status: config.last_sync_status,
            pending_changes,
            conflicts_count,
        })
    }

    /// Trigger a manual sync
    pub async fn trigger_sync(&self) -> Result<SyncResult, String> {
        let start_time = Instant::now();
        let mut result = SyncResult {
            uploaded: 0,
            downloaded: 0,
            conflicts: 0,
            errors: Vec::new(),
        };

        // Set syncing state at the start
        self.set_syncing(0);

        // 1. Create sync log entry
        let log_id = self.create_sync_log().map_err(|e| {
            self.set_error(&e);
            e
        })?;

        // 2. Get sync configuration
        let config = {
            let conn = self.db.lock().map_err(|e| e.to_string())?;
            get_sync_config(&conn)?
        };

        if !config.enabled {
            self.set_idle();
            return Err("Sync is not enabled".to_string());
        }

        // 3. Create WebDAV client
        let client = self.create_webdav_client(&config)?;

        // 4. Ensure base path exists
        client.ensure_base_path().await.map_err(|e| {
            self.update_sync_log(log_id, "failed", 0, 0, 0, Some(&e));
            self.set_error(&e);
            e
        })?;

        // 5. Create delta calculator and serializer (clone Arc for sharing)
        let delta = DeltaCalculator::new(Arc::clone(&self.db));
        let serializer = SyncSerializer::new(Arc::clone(&self.db));

        // Update progress: starting upload phase
        self.set_syncing(10);

        // 6. Upload pending changes
        let upload_entities = delta.get_upload_entities().map_err(|e| {
            self.update_sync_log(log_id, "failed", 0, 0, 0, Some(&e));
            self.set_error(&e);
            e
        })?;

        let total_entities = upload_entities.len().max(1);
        for (idx, entity) in upload_entities.iter().enumerate() {
            // Update progress during upload (10-40%)
            let progress = 10 + ((idx as u32 * 30) / total_entities as u32);
            self.set_syncing(progress);

            match self.upload_entity(&client, &serializer, entity).await {
                Ok(()) => {
                    result.uploaded += 1;
                    // Mark as synced
                    if let Err(e) = delta.mark_synced(&entity.entity_type, &entity.entity_id) {
                        result.errors.push(format!("Failed to mark synced: {}", e));
                    }
                }
                Err(e) => {
                    result
                        .errors
                        .push(format!("Failed to upload {}: {}", entity.entity_id, e));
                }
            }
        }

        // 7. Get remote manifest
        self.set_syncing(45);
        let remote_manifest = match self.get_remote_manifest(&client).await {
            Ok(m) => m,
            Err(e) => {
                result
                    .errors
                    .push(format!("Failed to get remote manifest: {}", e));
                Vec::new()
            }
        };

        // 8. Calculate download delta
        let download_delta = delta.get_download_delta(&remote_manifest).map_err(|e| {
            self.update_sync_log(log_id, "failed", result.uploaded, 0, 0, Some(&e));
            self.set_error(&e);
            e
        })?;

        // 9. Download and apply remote changes
        self.set_syncing(50);
        let download_total = download_delta.len().max(1);
        for (idx, entry) in download_delta.iter().enumerate() {
            // Update progress during download (50-80%)
            let progress = 50 + ((idx as u32 * 30) / download_total as u32);
            self.set_syncing(progress);

            let parts: Vec<&str> = entry.split(':').collect();
            if parts.len() < 2 {
                continue;
            }
            let entity_type = parts[0];
            let entity_id = parts[1];
            let is_deleted = parts.get(2).map(|&s| s == "true").unwrap_or(false);

            if is_deleted {
                // Apply tombstone
                if let Err(e) = serializer.delete_entity(entity_type, entity_id) {
                    result
                        .errors
                        .push(format!("Failed to delete {}: {}", entity_id, e));
                }
            } else {
                match self
                    .download_entity(&client, &serializer, entity_type, entity_id)
                    .await
                {
                    Ok(()) => {
                        result.downloaded += 1;
                    }
                    Err(e) => {
                        result
                            .errors
                            .push(format!("Failed to download {}: {}", entity_id, e));
                    }
                }
            }
        }

        // 10. Detect and resolve conflicts
        self.set_syncing(85);
        let resolver = ConflictResolver::new(
            Arc::clone(&self.db),
            ConflictResolution::from(config.conflict_strategy.as_str()),
        );

        let conflicts = match resolver.detect_conflicts() {
            Ok(c) => c,
            Err(e) => {
                result
                    .errors
                    .push(format!("Conflict detection failed: {}", e));
                Vec::new()
            }
        };

        result.conflicts = conflicts.len() as i32;

        // Auto-resolve non-manual conflicts
        self.set_syncing(90);
        if config.conflict_strategy != "manual-merge" {
            if let Ok(resolved) = resolver.resolve_all() {
                result.conflicts -= resolved as i32;
            }
        }

        // 11. Update sync log and config
        self.set_syncing(95);
        let duration_ms = start_time.elapsed().as_millis() as i64;
        let status = if result.errors.is_empty() {
            "completed"
        } else {
            "partial"
        };
        let error_msg = if result.errors.is_empty() {
            None
        } else {
            Some(result.errors.join("; "))
        };

        self.update_sync_log(
            log_id,
            status,
            result.uploaded,
            result.downloaded,
            result.conflicts,
            error_msg.as_deref(),
        );

        self.update_sync_config(status, duration_ms)?;

        // Set final state based on result
        if result.errors.is_empty() {
            self.set_idle();
        } else {
            self.set_error(&result.errors.join("; "));
        }

        Ok(result)
    }

    // Helper methods

    async fn upload_entity(
        &self,
        client: &WebDAVClient,
        serializer: &SyncSerializer,
        entity: &crate::sync::delta::SyncEntity,
    ) -> Result<(), String> {
        // Serialize entity to JSON
        let data = serializer.serialize_entity(&entity.entity_type, &entity.entity_id)?;

        // Convert to JSON string and then bytes
        let json_str = serde_json::to_string(&data).map_err(|e| e.to_string())?;

        // Build remote path: entities/{type}/{id}.json
        let remote_path = format!("entities/{}/{}.json", entity.entity_type, entity.entity_id);

        // Upload to WebDAV
        if entity.is_deleted {
            // Delete from remote
            client.delete(&remote_path).await?;
        } else {
            // Upload to remote
            client.upload(&remote_path, json_str.as_bytes()).await?;
        }

        Ok(())
    }

    async fn download_entity(
        &self,
        client: &WebDAVClient,
        serializer: &SyncSerializer,
        entity_type: &str,
        entity_id: &str,
    ) -> Result<(), String> {
        let remote_path = format!("entities/{}/{}.json", entity_type, entity_id);

        // Download from WebDAV
        let data = client.download(&remote_path).await?;

        // Parse JSON
        let json_str = String::from_utf8(data).map_err(|e| e.to_string())?;
        let value: serde_json::Value =
            serde_json::from_str(&json_str).map_err(|e| e.to_string())?;

        // Deserialize and apply
        serializer.deserialize_entity(entity_type, &value)?;

        Ok(())
    }

    async fn get_remote_manifest(
        &self,
        client: &WebDAVClient,
    ) -> Result<Vec<serde_json::Value>, String> {
        // List entities directory
        let items = client.list("entities").await?;

        let mut manifest = Vec::new();

        // For each entity type directory
        for item in items {
            if !item.is_directory {
                continue;
            }

            let entity_type = item.href.trim_end_matches('/').to_string();

            // List entities in this type
            if let Ok(entities) = client.list(&format!("entities/{}", entity_type)).await {
                for entity in entities {
                    if entity.is_directory {
                        continue;
                    }

                    // Parse entity ID from filename (remove .json extension)
                    let entity_id = entity.href.trim_end_matches(".json").to_string();

                    manifest.push(serde_json::json!({
                        "entity_type": entity_type,
                        "entity_id": entity_id,
                        "modified_at": entity.last_modified.unwrap_or_default(),
                        "etag": entity.etag.unwrap_or_default(),
                    }));
                }
            }
        }

        Ok(manifest)
    }

    fn create_webdav_client(&self, config: &SyncConfig) -> Result<WebDAVClient, String> {
        let server_url = config
            .server_url
            .clone()
            .ok_or("Server URL not configured")?;
        let username = config.username.clone().ok_or("Username not configured")?;
        let password = config
            .password_encrypted
            .clone()
            .ok_or("Password not configured")?;

        WebDAVClient::new(server_url, username, password, config.remote_path.clone())
    }

    fn create_sync_log(&self) -> Result<i64, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        conn.execute(
            "INSERT INTO sync_log (started_at, status, entities_uploaded, entities_downloaded, conflicts_count)
             VALUES (datetime('now'), 'started', 0, 0, 0)",
            [],
        )
        .map_err(|e| e.to_string())?;

        Ok(conn.last_insert_rowid())
    }

    fn update_sync_log(
        &self,
        log_id: i64,
        status: &str,
        uploaded: i32,
        downloaded: i32,
        conflicts: i32,
        error: Option<&str>,
    ) {
        if let Ok(conn) = self.db.lock() {
            let _ = conn.execute(
                "UPDATE sync_log SET 
                    completed_at = datetime('now'),
                    status = ?1,
                    entities_uploaded = ?2,
                    entities_downloaded = ?3,
                    conflicts_count = ?4,
                    error_message = ?5,
                    duration_ms = (SELECT (julianday('now') - julianday(started_at)) * 86400000 FROM sync_log WHERE id = ?6)
                 WHERE id = ?6",
                rusqlite::params![status, uploaded, downloaded, conflicts, error, log_id],
            );
        }
    }

    fn update_sync_config(&self, status: &str, duration_ms: i64) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        conn.execute(
            "UPDATE sync_config SET 
                last_sync_at = datetime('now'),
                last_sync_status = ?1,
                updated_at = datetime('now')
             WHERE id = 'default'",
            [status],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
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
