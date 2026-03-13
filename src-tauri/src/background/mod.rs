// Background notification polling module
//
// This module implements the background task that polls for pending notifications
// and sends them using configured notification plugins.

use crate::commands::notifications::NotificationHistory;
use crate::commands::notification_plugins::registry::GLOBAL_REGISTRY;
use crate::AppState;

use rusqlite::Connection;
use std::time::Duration;
use tauri::{AppHandle, Manager};

/// Start the notification checker background task with graceful shutdown
///
/// This function spawns an async task that periodically checks for pending
/// notifications and sends them using the configured notification plugins.
/// The task can be gracefully shut down using the returned shutdown handle.
///
/// # Arguments
/// * `app` - The Tauri application handle
/// * `interval_secs` - The polling interval in seconds
///
/// # Returns
/// A shutdown sender that can be used to gracefully stop the background task
pub fn start_notification_checker(app: &AppHandle, interval_secs: u64) -> tokio::sync::mpsc::Sender<()> {
    let app_handle = app.clone();
    let (shutdown_tx, mut shutdown_rx) = tokio::sync::mpsc::channel::<()>(1);

    tauri::async_runtime::spawn(async move {
        let mut tick_count: u64 = 0;

        loop {
            tokio::select! {
                // Check for shutdown signal
                _ = shutdown_rx.recv() => {
                    log::info!("Notification checker shutting down gracefully");
                    break;
                }
                // Wait for the polling interval
                _ = tokio::time::sleep(tokio::time::Duration::from_secs(interval_secs)) => {
                    tick_count += 1;

                    // Get database connection from app state
                    let state_result = app_handle.try_state::<AppState>();

                    if let Some(state) = state_result {
                        let conn_result = state.db.lock();

                        if let Ok(conn) = conn_result {
                            // Check for pending notifications
                            match get_pending_notifications(&conn) {
                                Ok(pending) => {
                                    for notification in pending {
                                        // Send the notification
                                        let result = send_notification(&notification).await;

                                        // Update status based on result
                                        let update_result = if result.is_ok() {
                                            update_notification_status(&conn, &notification.id, "sent", None)
                                        } else {
                                            let error_msg = result.unwrap_err();
                                            update_notification_status(
                                                &conn,
                                                &notification.id,
                                                "failed",
                                                Some(error_msg),
                                            )
                                        };

                                        if let Err(e) = update_result {
                                            log::error!("Failed to update notification status: {}", e);
                                        }
                                    }
                                }
                                Err(e) => {
                                    log::error!("Failed to get pending notifications: {}", e);
                                }
                            }
                        } else {
                            log::error!("Failed to acquire database lock");
                        }
                    } else {
                        log::error!("Failed to get AppState");
                    }
                }
            }
        }
    });

    shutdown_tx
}

/// Get all pending notifications that are due to be sent
fn get_pending_notifications(
    conn: &Connection,
) -> Result<Vec<NotificationHistory>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, entity_type, entity_id, title, message, reminder_time,
                    scheduled_at, sent_at, channel, status, error_message, created_at
             FROM notification_history
             WHERE status = 'pending' AND scheduled_at <= datetime('now')
             ORDER BY scheduled_at ASC",
        )
        .map_err(|e| e.to_string())?;

    let notifications = stmt
        .query_map([], |row| {
            Ok(NotificationHistory {
                id: row.get(0)?,
                entity_type: row.get(1)?,
                entity_id: row.get(2)?,
                title: row.get(3)?,
                message: row.get(4)?,
                reminder_time: row.get(5)?,
                scheduled_at: row.get(6)?,
                sent_at: row.get(7)?,
                channel: row.get(8)?,
                status: row.get(9)?,
                error_message: row.get(10)?,
                created_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;

    notifications
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

/// Send a notification using the appropriate plugin
async fn send_notification(notification: &NotificationHistory) -> Result<(), String> {
    // Get the sender from the global registry
    let sender = GLOBAL_REGISTRY
        .get(&notification.channel)
        .ok_or_else(|| format!("Plugin {} not found", notification.channel))?;

    // Send the notification
    let title = &notification.title;
    let message = notification.message.as_deref().unwrap_or("");
    sender.send(title, message).await?;

    Ok(())
}

/// Update the status of a notification in the database
fn update_notification_status(
    conn: &Connection,
    id: &str,
    status: &str,
    error_message: Option<String>,
) -> Result<(), String> {
    let sent_at = if status == "sent" {
        Some(chrono::Utc::now().to_rfc3339())
    } else {
        None
    };

    if let Some(err) = error_message {
        conn.execute(
            "UPDATE notification_history
             SET status = ?, sent_at = ?, error_message = ?
             WHERE id = ?",
            rusqlite::params![
                status,
                &sent_at.unwrap_or_default(),
                &err,
                id
            ],
        )
        .map_err(|e| e.to_string())?;
    } else {
        conn.execute(
            "UPDATE notification_history
             SET status = ?, sent_at = ?
             WHERE id = ?",
            rusqlite::params![status, &sent_at.unwrap_or_default(), id],
        )
        .map_err(|e| e.to_string())?;
    }

    Ok(())
}
