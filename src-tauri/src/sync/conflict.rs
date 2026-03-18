// Conflict Resolution - handles sync conflicts
// Phase 6: Multi-strategy conflict resolution

use crate::models::SyncConflict;
use rusqlite::{Connection, OptionalExtension};
use serde_json::Value;
use std::sync::{Arc, Mutex};

/// Conflict resolution strategy
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ConflictResolution {
    LocalWins,
    RemoteWins,
    Timestamp,
    ManualMerge,
}

impl From<&str> for ConflictResolution {
    fn from(s: &str) -> Self {
        match s {
            "local-wins" => ConflictResolution::LocalWins,
            "remote-wins" => ConflictResolution::RemoteWins,
            "timestamp" => ConflictResolution::Timestamp,
            "manual-merge" => ConflictResolution::ManualMerge,
            _ => ConflictResolution::Timestamp,
        }
    }
}

impl std::fmt::Display for ConflictResolution {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConflictResolution::LocalWins => write!(f, "local-wins"),
            ConflictResolution::RemoteWins => write!(f, "remote-wins"),
            ConflictResolution::Timestamp => write!(f, "timestamp"),
            ConflictResolution::ManualMerge => write!(f, "manual-merge"),
        }
    }
}

/// Handles conflict detection and resolution
pub struct ConflictResolver {
    db: Arc<Mutex<Connection>>,
    default_strategy: ConflictResolution,
}

impl ConflictResolver {
    pub fn new(db: Arc<Mutex<Connection>>, default_strategy: ConflictResolution) -> Self {
        Self {
            db,
            default_strategy,
        }
    }

    /// Detect conflicts between local and remote versions
    /// Returns entities where both local and remote have unsynced changes
    pub fn detect_conflicts(&self) -> Result<Vec<SyncConflict>, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT sm.id, sm.entity_type, sm.entity_id, sm.local_modified_at, sm.remote_modified_at
                 FROM sync_metadata sm
                 WHERE sm.sync_status = 'pending' 
                 AND sm.remote_modified_at IS NOT NULL
                 AND sm.remote_modified_at > sm.local_modified_at"
            )
            .map_err(|e| e.to_string())?;

        let conflict_ids: Vec<(i64, String, String, String, Option<String>)> = stmt
            .query_map([], |row| {
                Ok((
                    row.get(0)?,
                    row.get(1)?,
                    row.get(2)?,
                    row.get(3)?,
                    row.get(4)?,
                ))
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        let mut conflicts = Vec::new();
        for (id, entity_type, entity_id, local_modified_at, remote_modified_at) in conflict_ids {
            // Get local version
            let local_version = self.get_local_entity(&conn, &entity_type, &entity_id)?;

            // For remote version, we would need it passed in or stored
            // For now, create a placeholder - actual remote data comes from sync engine
            let remote_version = serde_json::json!({
                "entity_type": entity_type,
                "entity_id": entity_id,
                "modified_at": remote_modified_at.clone(),
            });

            conflicts.push(SyncConflict {
                id,
                entity_type: entity_type.clone(),
                entity_id: entity_id.clone(),
                local_version,
                remote_version,
                local_modified_at: local_modified_at.clone(),
                remote_modified_at,
            });
        }

        Ok(conflicts)
    }

    /// Resolve a conflict using the specified strategy
    pub fn resolve_conflict(
        &self,
        conflict_id: i64,
        resolution: ConflictResolution,
    ) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        // Get conflict details
        let conflict_info = conn
            .query_row(
                "SELECT entity_type, entity_id, local_modified_at, remote_modified_at 
                 FROM sync_metadata WHERE id = ?1",
                [conflict_id],
                |row| {
                    Ok((
                        row.get::<_, String>(0)?,
                        row.get::<_, String>(1)?,
                        row.get::<_, String>(2)?,
                        row.get::<_, Option<String>>(3)?,
                    ))
                },
            )
            .optional()
            .map_err(|e: rusqlite::Error| e.to_string())?;

        let (entity_type, entity_id, local_modified, remote_modified) =
            conflict_info.ok_or("Conflict not found")?;

        match resolution {
            ConflictResolution::LocalWins => {
                // Keep local version, mark as synced
                self.apply_resolution(&conn, conflict_id, "local", &entity_type, &entity_id)?;
            }
            ConflictResolution::RemoteWins => {
                // Accept remote version - actual data application handled by caller
                self.apply_resolution(&conn, conflict_id, "remote", &entity_type, &entity_id)?;
            }
            ConflictResolution::Timestamp => {
                // Compare timestamps and decide
                let remote = remote_modified.unwrap_or_default();
                if local_modified >= remote {
                    self.apply_resolution(&conn, conflict_id, "local", &entity_type, &entity_id)?;
                } else {
                    self.apply_resolution(&conn, conflict_id, "remote", &entity_type, &entity_id)?;
                }
            }
            ConflictResolution::ManualMerge => {
                // Mark for manual resolution - don't auto-resolve
                conn.execute(
                    "UPDATE sync_metadata SET sync_status = 'conflict' WHERE id = ?1",
                    [conflict_id],
                )
                .map_err(|e| e.to_string())?;
            }
        }

        Ok(())
    }

    /// Resolve all conflicts using the default strategy
    pub fn resolve_all(&self) -> Result<i64, String> {
        let conflicts = self.detect_conflicts()?;
        let mut resolved_count = 0;

        for conflict in conflicts {
            match self.resolve_conflict(conflict.id, self.default_strategy) {
                Ok(()) => resolved_count += 1,
                Err(e) => {
                    // Log error but continue with other conflicts
                    eprintln!("Failed to resolve conflict {}: {}", conflict.id, e);
                }
            }
        }

        Ok(resolved_count)
    }

    /// Get the number of pending conflicts
    pub fn count_pending(&self) -> Result<i64, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        conn.query_row(
            "SELECT COUNT(*) FROM sync_metadata WHERE sync_status = 'conflict'",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())
    }

    // Helper methods

    fn get_local_entity(
        &self,
        conn: &Connection,
        entity_type: &str,
        entity_id: &str,
    ) -> Result<Value, String> {
        let result = match entity_type {
            "todo" => {
                conn.query_row(
                    "SELECT id, title, description, status, priority, due_date, plan_id, target_id, tags, created_at, updated_at, completed_at FROM todos WHERE id = ?1",
                    [entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "title": row.get::<_, String>(1)?,
                            "description": row.get::<_, Option<String>>(2)?,
                            "status": row.get::<_, String>(3)?,
                            "priority": row.get::<_, String>(4)?,
                            "due_date": row.get::<_, Option<String>>(5)?,
                            "plan_id": row.get::<_, Option<String>>(6)?,
                            "target_id": row.get::<_, Option<String>>(7)?,
                            "tags": row.get::<_, Option<String>>(8)?,
                            "created_at": row.get::<_, String>(9)?,
                            "updated_at": row.get::<_, String>(10)?,
                            "completed_at": row.get::<_, Option<String>>(11)?,
                        }))
                    },
                ).optional()
            }
            "plan" => {
                conn.query_row(
                    "SELECT id, title, description, status, start_date, end_date, tags, created_at, updated_at FROM plans WHERE id = ?1",
                    [entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "title": row.get::<_, String>(1)?,
                            "description": row.get::<_, Option<String>>(2)?,
                            "status": row.get::<_, String>(3)?,
                            "start_date": row.get::<_, Option<String>>(4)?,
                            "end_date": row.get::<_, Option<String>>(5)?,
                            "tags": row.get::<_, Option<String>>(6)?,
                            "created_at": row.get::<_, String>(7)?,
                            "updated_at": row.get::<_, String>(8)?,
                        }))
                    },
                ).optional()
            }
            "task" => {
                conn.query_row(
                    "SELECT id, title, description, status, priority, due_date, plan_id, tags, created_at, updated_at, completed_at FROM tasks WHERE id = ?1",
                    [entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "title": row.get::<_, String>(1)?,
                            "description": row.get::<_, Option<String>>(2)?,
                            "status": row.get::<_, String>(3)?,
                            "priority": row.get::<_, String>(4)?,
                            "due_date": row.get::<_, Option<String>>(5)?,
                            "plan_id": row.get::<_, Option<String>>(6)?,
                            "tags": row.get::<_, Option<String>>(7)?,
                            "created_at": row.get::<_, String>(8)?,
                            "updated_at": row.get::<_, String>(9)?,
                            "completed_at": row.get::<_, Option<String>>(10)?,
                        }))
                    },
                ).optional()
            }
            "target" => {
                conn.query_row(
                    "SELECT id, title, description, status, progress, plan_id, due_date, tags, created_at, updated_at FROM targets WHERE id = ?1",
                    [entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "title": row.get::<_, String>(1)?,
                            "description": row.get::<_, Option<String>>(2)?,
                            "status": row.get::<_, String>(3)?,
                            "progress": row.get::<_, i32>(4)?,
                            "plan_id": row.get::<_, Option<String>>(5)?,
                            "due_date": row.get::<_, Option<String>>(6)?,
                            "tags": row.get::<_, Option<String>>(7)?,
                            "created_at": row.get::<_, String>(8)?,
                            "updated_at": row.get::<_, String>(9)?,
                        }))
                    },
                ).optional()
            }
            "step" => {
                conn.query_row(
                    "SELECT id, title, description, status, target_id, order_index, created_at, updated_at FROM steps WHERE id = ?1",
                    [entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "title": row.get::<_, String>(1)?,
                            "description": row.get::<_, Option<String>>(2)?,
                            "status": row.get::<_, String>(3)?,
                            "target_id": row.get::<_, String>(4)?,
                            "order_index": row.get::<_, i32>(5)?,
                            "created_at": row.get::<_, String>(6)?,
                            "updated_at": row.get::<_, String>(7)?,
                        }))
                    },
                ).optional()
            }
            "milestone" => {
                conn.query_row(
                    "SELECT id, title, description, status, target_id, due_date, created_at, updated_at, completed_at FROM milestones WHERE id = ?1",
                    [entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "title": row.get::<_, String>(1)?,
                            "description": row.get::<_, Option<String>>(2)?,
                            "status": row.get::<_, String>(3)?,
                            "target_id": row.get::<_, String>(4)?,
                            "due_date": row.get::<_, Option<String>>(5)?,
                            "created_at": row.get::<_, String>(6)?,
                            "updated_at": row.get::<_, String>(7)?,
                            "completed_at": row.get::<_, Option<String>>(8)?,
                        }))
                    },
                ).optional()
            }
            "circulation" => {
                conn.query_row(
                    "SELECT id, title, description, frequency, target_days, current_streak, best_streak, tags, created_at, updated_at FROM circulations WHERE id = ?1",
                    [entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "title": row.get::<_, String>(1)?,
                            "description": row.get::<_, Option<String>>(2)?,
                            "frequency": row.get::<_, String>(3)?,
                            "target_days": row.get::<_, i32>(4)?,
                            "current_streak": row.get::<_, i32>(5)?,
                            "best_streak": row.get::<_, i32>(6)?,
                            "tags": row.get::<_, Option<String>>(7)?,
                            "created_at": row.get::<_, String>(8)?,
                            "updated_at": row.get::<_, String>(9)?,
                        }))
                    },
                ).optional()
            }
            "tag" => {
                conn.query_row(
                    "SELECT id, name, color, created_at FROM tags WHERE id = ?1",
                    [entity_id],
                    |row| {
                        Ok(serde_json::json!({
                            "id": row.get::<_, String>(0)?,
                            "name": row.get::<_, String>(1)?,
                            "color": row.get::<_, String>(2)?,
                            "created_at": row.get::<_, String>(3)?,
                        }))
                    },
                ).optional()
            }
            _ => return Err(format!("Unknown entity type: {}", entity_type)),
        };

        match result {
            Ok(Some(value)) => Ok(value),
            Ok(None) => Ok(Value::Null),
            Err(e) => Err(e.to_string()),
        }
    }

    fn apply_resolution(
        &self,
        conn: &Connection,
        conflict_id: i64,
        winner: &str,
        entity_type: &str,
        entity_id: &str,
    ) -> Result<(), String> {
        let now = chrono::Utc::now().to_rfc3339();

        // Update sync metadata based on winner
        if winner == "local" {
            conn.execute(
                "UPDATE sync_metadata 
                 SET sync_status = 'pending', updated_at = datetime('now')
                 WHERE id = ?1",
                [conflict_id],
            )
            .map_err(|e| e.to_string())?;
        } else {
            // Remote wins - mark as needing download
            conn.execute(
                "UPDATE sync_metadata 
                 SET sync_status = 'pending', local_modified_at = ?1, updated_at = datetime('now')
                 WHERE id = ?2",
                rusqlite::params![now, conflict_id],
            )
            .map_err(|e| e.to_string())?;
        }

        // Log the resolution
        conn.execute(
            "INSERT INTO sync_log (started_at, status, entities_uploaded, entities_downloaded, conflicts_count)
             VALUES (datetime('now'), 'completed', 0, 0, 1)",
            [],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    }
}
