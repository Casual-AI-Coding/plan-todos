// Sync progress commands - real-time atomic sync status
// Phase 6: Atomic sync state tracking

use crate::sync::{SyncState, SyncStatus};
use tauri::State;

/// Get real-time sync progress status
/// Returns atomic state: Idle, Syncing { progress }, or Error { message }
#[tauri::command]
pub fn get_sync_progress(state: State<'_, SyncState>) -> SyncStatus {
    state.get_status()
}
