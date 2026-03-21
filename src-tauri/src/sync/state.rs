use serde::Serialize;
use std::sync::atomic::{AtomicU32, AtomicU8, Ordering};
use tokio::sync::RwLock;

#[derive(Debug, Clone, Serialize)]
#[serde(tag = "type", rename_all = "lowercase")]
pub enum SyncStatus {
    Idle,
    Syncing { progress: u32 },
    Error { message: String },
}

pub struct SyncState {
    status: AtomicU8,
    progress: AtomicU32,
    error_message: RwLock<Option<String>>,
}

impl Default for SyncState {
    fn default() -> Self {
        Self::new()
    }
}

impl SyncState {
    pub fn new() -> Self {
        Self {
            status: AtomicU8::new(0),
            progress: AtomicU32::new(0),
            error_message: RwLock::new(None),
        }
    }

    pub fn set_syncing(&self, progress: u32) {
        self.status.store(1, Ordering::SeqCst);
        self.progress.store(progress.min(100), Ordering::SeqCst);
    }

    pub fn set_idle(&self) {
        self.status.store(0, Ordering::SeqCst);
        self.progress.store(100, Ordering::SeqCst);
        if let Ok(mut guard) = self.error_message.try_write() {
            *guard = None;
        }
    }

    pub fn set_error(&self, message: &str) {
        self.status.store(2, Ordering::SeqCst);
        if let Ok(mut guard) = self.error_message.try_write() {
            *guard = Some(message.to_string());
        }
    }

    pub fn get_status(&self) -> SyncStatus {
        match self.status.load(Ordering::SeqCst) {
            0 => SyncStatus::Idle,
            1 => SyncStatus::Syncing {
                progress: self.progress.load(Ordering::SeqCst),
            },
            2 => {
                let msg = self
                    .error_message
                    .try_read()
                    .ok()
                    .and_then(|g| g.clone())
                    .unwrap_or_default();
                SyncStatus::Error { message: msg }
            }
            _ => SyncStatus::Idle,
        }
    }
}
