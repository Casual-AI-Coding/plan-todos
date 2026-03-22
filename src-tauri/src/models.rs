// Data Models

use rusqlite::Connection;
use std::sync::{Arc, Mutex};

// Database state
pub struct AppState {
    pub db: Arc<Mutex<Connection>>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Plan {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: String,  // active | completed | archived
    pub sort_order: i32, // For drag-drop sorting
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub plan_id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: String,   // pending | in-progress | done
    pub priority: String, // P0 | P1 | P2 | P3 (default P2)
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Target {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub status: String,  // active | completed | archived
    pub progress: i32,   // Calculated from Steps (0-100)
    pub sort_order: i32, // For drag-drop sorting
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Step {
    pub id: String,
    pub target_id: String,
    pub title: String,
    pub weight: i32,      // 0-100, sum should not exceed 100
    pub status: String,   // pending | completed
    pub priority: String, // P0 | P1 | P2 | P3 (default P2)
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub due_date: Option<String>,
    pub status: String,                  // pending | in-progress | done
    pub priority: String,                // P0 | P1 | P2 | P3 (default P2)
    pub recurrence: Option<String>,      // JSON string of Recurrence config
    pub recurrence_from: Option<String>, // Original todo ID for tracking chain
    pub recurrence_index: Option<i32>,   // Current occurrence number
    pub sort_order: i32,                 // For drag-drop sorting
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Milestone {
    pub id: String,
    pub title: String,
    pub target_date: Option<String>,
    // Unified fields for flexible linking to any entity
    pub biz_type: Option<String>, // 'plan' | 'task' | 'target' | 'circulation'
    pub biz_id: Option<String>,
    pub status: String, // pending | completed
    pub progress: i32,  // Calculated from linked entity (0-100)
    pub created_at: String,
    pub updated_at: String,
}

// Circulation - 打卡
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Circulation {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub circulation_type: String,         // 'periodic' | 'count'
    pub frequency: Option<String>,        // 'daily' | 'weekly' | 'monthly' (periodic only)
    pub frequency_config: Option<String>, // JSON config (e.g., {"weekdays": [1,2,3]})
    pub target_count: Option<i32>,        // target count (count only)
    pub current_count: i32,               // current count (count only)
    pub streak_count: i32,                // current streak (periodic only)
    pub best_streak: i32,                 // best streak (periodic only)
    pub last_completed_at: Option<String>,
    pub status: String, // 'active' | 'archived'
    pub created_at: String,
    pub updated_at: String,
}

// CirculationLog - 打卡记录
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct CirculationLog {
    pub id: String,
    pub circulation_id: String,
    pub completed_at: String,
    pub note: Option<String>,
    pub period: Option<String>, // periodic: "2024-W05" / "2024-02"
    pub count: Option<i32>,     // count for count-type circulation
}

// ==================== Sync Models (Phase 6) ====================

/// Sync metadata tracks the sync state for each entity
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct SyncMetadata {
    pub id: i64,
    pub entity_type: String,
    pub entity_id: String,
    pub local_modified_at: String,
    pub remote_modified_at: Option<String>,
    pub sync_status: String, // 'pending' | 'synced' | 'conflict' | 'error'
    pub remote_version: Option<String>,
    pub is_deleted: bool,
    pub device_id: String,
    pub created_at: String,
    pub updated_at: String,
}

/// Sync configuration
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct SyncConfig {
    pub id: String,
    pub enabled: bool,
    pub provider_type: String, // 'webdav'
    pub server_url: Option<String>,
    pub username: Option<String>,
    pub password_encrypted: Option<String>,
    pub remote_path: String,
    pub sync_interval_minutes: i32,
    pub conflict_strategy: String, // 'local-wins' | 'remote-wins' | 'timestamp' | 'manual-merge'
    pub last_sync_at: Option<String>,
    pub last_sync_status: Option<String>,
    pub last_sync_error: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

impl Default for SyncConfig {
    fn default() -> Self {
        Self {
            id: "default".to_string(),
            enabled: false,
            provider_type: "webdav".to_string(),
            server_url: None,
            username: None,
            password_encrypted: None,
            remote_path: "/plan-todos-sync".to_string(),
            sync_interval_minutes: 30,
            conflict_strategy: "timestamp".to_string(),
            last_sync_at: None,
            last_sync_status: None,
            last_sync_error: None,
            created_at: chrono::Utc::now().to_rfc3339(),
            updated_at: chrono::Utc::now().to_rfc3339(),
        }
    }
}

/// Device information for multi-device sync
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct DeviceInfo {
    pub device_id: String,
    pub device_name: String,
    pub is_current_device: bool,
    pub last_seen_at: String,
    pub created_at: String,
}

/// Sync operation log
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct SyncLog {
    pub id: i64,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub status: String, // 'started' | 'completed' | 'failed'
    pub entities_uploaded: i32,
    pub entities_downloaded: i32,
    pub conflicts_count: i32,
    pub error_message: Option<String>,
    pub duration_ms: Option<i64>,
}

/// Sync status response
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct SyncStatus {
    pub enabled: bool,
    pub is_syncing: bool,
    pub last_sync_at: Option<String>,
    pub last_sync_status: Option<String>,
    pub pending_changes: i64,
    pub conflicts_count: i64,
}

/// Conflict for manual resolution
#[derive(Debug, serde::Serialize, serde::Deserialize)]
pub struct SyncConflict {
    pub id: i64,
    pub entity_type: String,
    pub entity_id: String,
    pub local_version: serde_json::Value,
    pub remote_version: serde_json::Value,
    pub local_modified_at: String,
    pub remote_modified_at: Option<String>,
}
