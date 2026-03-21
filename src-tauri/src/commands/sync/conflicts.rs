// Sync conflict resolution commands
// Phase 6: Conflict management

use crate::models::{AppState, SyncConflict};
use crate::sync::{ConflictResolution, ConflictResolver};
use tauri::State;

/// Get pending conflicts
#[tauri::command]
pub fn get_pending_conflicts(state: State<AppState>) -> Result<Vec<SyncConflict>, String> {
    let db = state.db.clone();
    let resolver = ConflictResolver::new(db, ConflictResolution::ManualMerge);

    resolver.detect_conflicts()
}

/// Resolve a single conflict
#[tauri::command]
pub fn resolve_conflict(
    state: State<AppState>,
    conflict_id: i64,
    resolution: String, // 'local' | 'remote'
) -> Result<(), String> {
    let db = state.db.clone();

    // Parse resolution strategy
    let strategy = match resolution.as_str() {
        "local" => ConflictResolution::LocalWins,
        "remote" => ConflictResolution::RemoteWins,
        _ => return Err(format!("Invalid resolution strategy: {}", resolution)),
    };

    let resolver = ConflictResolver::new(db, strategy);
    resolver.resolve_conflict(conflict_id, strategy)
}

/// Resolve all conflicts with a single strategy
#[tauri::command]
pub fn resolve_all_conflicts(
    state: State<AppState>,
    strategy: String, // 'local-wins' | 'remote-wins' | 'timestamp'
) -> Result<i64, String> {
    let db = state.db.clone();

    // Parse strategy
    let resolution = ConflictResolution::from(strategy.as_str());

    let resolver = ConflictResolver::new(db, resolution);
    resolver.resolve_all()
}
