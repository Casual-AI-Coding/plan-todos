// Delta Calculator - computes differences for sync
// Phase 6: Incremental sync support

use rusqlite::Connection;
use std::sync::Mutex;

/// Calculates deltas between local and remote state
pub struct DeltaCalculator {
    db: Mutex<Connection>,
}

impl DeltaCalculator {
    pub fn new(db: Mutex<Connection>) -> Self {
        Self { db }
    }

    /// Calculate entities to upload (local changes not yet synced)
    pub fn get_upload_delta(&self) -> Result<Vec<String>, String> {
        // TODO: Implement in Wave 4
        Ok(vec![])
    }

    /// Calculate entities to download (remote changes not yet applied)
    pub fn get_download_delta(&self) -> Result<Vec<String>, String> {
        // TODO: Implement in Wave 4
        Ok(vec![])
    }
}
