// Background sync scheduler - automatic periodic sync
// Phase 6: Background sync with configurable intervals

use crate::models::AppState;
use crate::sync::{retry_with_backoff, CircuitBreaker, CircuitBreakerConfig, RetryConfig};
use std::sync::Arc;
use std::time::Duration;
use tauri::{AppHandle, Emitter, Manager};

/// Scheduler state shared across the application
#[derive(Debug)]
pub struct SchedulerState {
    /// Whether the scheduler is currently running
    pub is_running: std::sync::atomic::AtomicBool,
    /// Current sync interval in minutes
    pub interval_minutes: std::sync::atomic::AtomicU32,
    /// Circuit breaker for sync operations
    pub circuit_breaker: CircuitBreaker,
}

impl Default for SchedulerState {
    fn default() -> Self {
        Self {
            is_running: std::sync::atomic::AtomicBool::new(false),
            interval_minutes: std::sync::atomic::AtomicU32::new(5),
            circuit_breaker: CircuitBreaker::new(CircuitBreakerConfig {
                failure_threshold: 5,
                reset_timeout: Duration::from_secs(60),
                success_threshold: 2,
                failure_window: Duration::from_secs(300),
            }),
        }
    }
}

impl SchedulerState {
    pub fn new() -> Self {
        Self::default()
    }
}

/// Start the background sync scheduler
///
/// This spawns a background task that periodically checks if sync should run
/// based on the managed SchedulerState's is_running flag and interval_minutes.
pub fn start_sync_scheduler(app: &AppHandle) {
    let app_handle = app.clone();

    tauri::async_runtime::spawn(async move {
        log::info!("Sync scheduler background task started");

        loop {
            // Get current interval (default to 5 minutes if state not available)
            let interval_minutes = app_handle
                .try_state::<SchedulerState>()
                .map(|s| s.interval_minutes.load(std::sync::atomic::Ordering::SeqCst))
                .unwrap_or(5);

            // Sleep for the interval
            tokio::time::sleep(Duration::from_secs(interval_minutes as u64 * 60)).await;

            // Check if scheduler is running
            let should_run = app_handle
                .try_state::<SchedulerState>()
                .map(|s| s.is_running.load(std::sync::atomic::Ordering::SeqCst))
                .unwrap_or(false);

            if should_run {
                log::info!("Sync scheduler tick - performing sync");
                perform_sync(&app_handle).await;
            }
        }
    });

    log::info!("Sync scheduler initialized");
}

/// Perform a sync operation with retry and circuit breaker protection
async fn perform_sync(app: &AppHandle) {
    // Get scheduler state for circuit breaker
    let scheduler_state = match app.try_state::<SchedulerState>() {
        Some(s) => s,
        None => {
            log::error!("Failed to get SchedulerState for sync");
            return;
        }
    };

    // Check circuit breaker
    if !scheduler_state.circuit_breaker.is_call_allowed() {
        log::warn!("Sync skipped - circuit breaker is open");
        return;
    }

    // Get database connection
    let db = match app.try_state::<AppState>() {
        Some(s) => s.db.clone(),
        None => {
            log::error!("Failed to get AppState for sync");
            return;
        }
    };

    // Get sync config
    let config = {
        let conn = match db.lock() {
            Ok(c) => c,
            Err(e) => {
                log::error!("Failed to acquire database lock: {}", e);
                return;
            }
        };

        match get_sync_config_from_db(&conn) {
            Ok(c) => c,
            Err(e) => {
                log::error!("Failed to get sync config: {}", e);
                return;
            }
        }
    };

    // Check if sync is enabled
    if !config.enabled {
        log::debug!("Sync is disabled, skipping");
        return;
    }

    // Create sync engine
    let engine = crate::sync::SyncEngine::new(db);

    // Configure retry
    let retry_config = RetryConfig {
        max_attempts: 3,
        initial_delay: Duration::from_secs(2),
        max_delay: Duration::from_secs(30),
        multiplier: 2.0,
        with_jitter: true,
    };

    // Perform sync with retry
    let result = retry_with_backoff(&retry_config, || {
        let engine = &engine;
        async move { engine.trigger_sync().await }
    })
    .await;

    match result {
        crate::sync::retry::RetryResult::Success(sync_result) => {
            log::info!(
                "Sync completed: uploaded={}, downloaded={}, conflicts={}",
                sync_result.uploaded,
                sync_result.downloaded,
                sync_result.conflicts
            );
            scheduler_state.circuit_breaker.record_success();

            // Emit sync completed event
            let _ = app.emit("sync-completed", &sync_result);
        }
        crate::sync::retry::RetryResult::Exhausted {
            attempts,
            last_error,
        } => {
            log::error!("Sync failed after {} attempts: {}", attempts, last_error);
            scheduler_state.circuit_breaker.record_failure();

            // Emit sync failed event
            let _ = app.emit("sync-failed", last_error);
        }
    }
}

/// Get sync configuration from database
fn get_sync_config_from_db(
    conn: &rusqlite::Connection,
) -> Result<crate::models::SyncConfig, String> {
    conn.query_row(
        "SELECT id, enabled, provider_type, server_url, username, password_encrypted,
                remote_path, sync_interval_minutes, conflict_strategy, last_sync_at,
                last_sync_status, last_sync_error, created_at, updated_at
         FROM sync_config WHERE id = 'default'",
        [],
        |row| {
            Ok(crate::models::SyncConfig {
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
