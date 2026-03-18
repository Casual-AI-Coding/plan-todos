// Scheduler control commands - Tauri commands for background sync scheduler
// Phase 6: Background sync control

use crate::AppState;
use crate::background::SchedulerState;
use serde::{Deserialize, Serialize};
use std::sync::atomic::Ordering;
use tauri::{AppHandle, Manager};

/// Scheduler status response
#[derive(Debug, Serialize, Deserialize)]
pub struct SchedulerStatus {
    /// Whether the scheduler is running
    pub is_running: bool,
    /// Current sync interval in minutes
    pub interval_minutes: u32,
    /// Whether the circuit breaker allows operations
    pub circuit_breaker_closed: bool,
    /// Current failure count in circuit breaker
    pub failure_count: u64,
}

/// Get the current scheduler status
#[tauri::command]
pub async fn get_scheduler_status(app: AppHandle) -> Result<SchedulerStatus, String> {
    // Get scheduler state from app
    let state = app
        .try_state::<SchedulerState>()
        .ok_or("Scheduler state not found")?;

    Ok(SchedulerStatus {
        is_running: state.is_running.load(Ordering::SeqCst),
        interval_minutes: state.interval_minutes.load(Ordering::SeqCst),
        circuit_breaker_closed: state.circuit_breaker.is_call_allowed(),
        failure_count: state.circuit_breaker.failure_count(),
    })
}

/// Start the background sync scheduler
#[tauri::command]
pub async fn start_scheduler(app: AppHandle) -> Result<(), String> {
    let state = app
        .try_state::<SchedulerState>()
        .ok_or("Scheduler state not found")?;

    state.is_running.store(true, Ordering::SeqCst);
    log::info!("Background sync scheduler started");

    Ok(())
}

/// Stop the background sync scheduler
#[tauri::command]
pub async fn stop_scheduler(app: AppHandle) -> Result<(), String> {
    let state = app
        .try_state::<SchedulerState>()
        .ok_or("Scheduler state not found")?;

    state.is_running.store(false, Ordering::SeqCst);
    log::info!("Background sync scheduler stopped");

    Ok(())
}

/// Set the sync interval in minutes
#[tauri::command]
pub async fn set_sync_interval(app: AppHandle, minutes: u32) -> Result<(), String> {
    if minutes < 1 {
        return Err("Sync interval must be at least 1 minute".to_string());
    }

    let state = app
        .try_state::<SchedulerState>()
        .ok_or("Scheduler state not found")?;

    state.interval_minutes.store(minutes, Ordering::SeqCst);

    // Also update database config
    let db = app
        .try_state::<AppState>()
        .ok_or("AppState not found")?
        .db
        .clone();

    {
        let conn = db.lock().map_err(|e| e.to_string())?;
        conn.execute(
            "UPDATE sync_config SET sync_interval_minutes = ?, updated_at = datetime('now') WHERE id = 'default'",
            [minutes],
        )
        .map_err(|e| e.to_string())?;
    }

    log::info!("Sync interval set to {} minutes", minutes);

    Ok(())
}

/// Trigger an immediate sync
#[tauri::command]
pub async fn trigger_background_sync(app: AppHandle) -> Result<(), String> {
    let state = app
        .try_state::<SchedulerState>()
        .ok_or("Scheduler state not found")?;

    // Check circuit breaker
    if !state.circuit_breaker.is_call_allowed() {
        return Err("Circuit breaker is open - sync temporarily disabled".to_string());
    }

    // Get database and perform sync
    let db = app
        .try_state::<AppState>()
        .ok_or("AppState not found")?
        .db
        .clone();

    let engine = crate::sync::SyncEngine::new(db);
    engine.trigger_sync().await?;

    log::info!("Manual sync completed");

    Ok(())
}

/// Reset the circuit breaker
#[tauri::command]
pub async fn reset_circuit_breaker(app: AppHandle) -> Result<(), String> {
    let state = app
        .try_state::<SchedulerState>()
        .ok_or("Scheduler state not found")?;

    state.circuit_breaker.reset();
    log::info!("Circuit breaker reset");

    Ok(())
}