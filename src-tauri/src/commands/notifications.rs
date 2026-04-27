// Notification system module

use crate::AppState;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json;
use std::collections::HashSet;
use std::time::Instant;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationSettings {
    pub id: String,
    pub entity_type: String,
    pub entity_id: String,
    #[serde(default)]
    pub reminder_times: Vec<i32>, // Multi-reminder times
    #[serde(default)]
    pub reminder_minutes: i32, // Keep for compatibility
    pub reminder_sent: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DailySummarySettings {
    pub id: String,
    pub enabled: bool,
    pub time: String,
    pub include_pending: bool,
    pub include_overdue: bool,
    pub include_completed: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DueReminder {
    pub entity_type: String,
    pub entity_id: String,
    pub title: String,
    pub due_date: String,
    pub minutes_until_due: i64,
    pub reminder_times: Vec<i32>, // Which reminder times matched
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DailySummary {
    pub date: String,
    pub pending_count: i32,
    pub overdue_count: i32,
    pub completed_count: i32,
    pub upcoming_count: i32,
}

// NotificationHistory - notification send history record
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationHistory {
    pub id: String,
    pub entity_type: String,
    pub entity_id: String,
    pub title: String,
    pub message: Option<String>,
    pub reminder_time: Option<i32>,
    pub scheduled_at: String,
    pub sent_at: Option<String>,
    pub channel: String,
    pub status: String, // "pending" | "sent" | "failed"
    pub error_message: Option<String>,
    pub created_at: String,
}

// GlobalNotificationSettings - global notification settings
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GlobalNotificationSettings {
    pub id: String,
    pub master_enabled: bool,
    pub desktop_enabled: bool,
    pub sound_enabled: bool,
    pub default_reminder_times: Vec<i32>,
    pub todo_default_enabled: bool,
    pub todo_default_times: Vec<i32>,
    pub plan_default_enabled: bool,
    pub plan_default_times: Vec<i32>,
    pub target_default_enabled: bool,
    pub target_default_times: Vec<i32>,
    pub dnd_enabled: bool,
    pub dnd_start_time: Option<String>,
    pub dnd_end_time: Option<String>,
    pub dnd_days: Vec<i32>,
    pub channel_priority: Vec<String>,
    pub retention_days: i32,
    pub created_at: String,
    pub updated_at: String,
}

// CRUD for notification settings

#[tauri::command]
pub fn get_notification_settings(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_id: String,
) -> Result<Option<NotificationSettings>, String> {
    let start = Instant::now();
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let result = conn.query_row(
        "SELECT id, entity_type, entity_id, reminder_minutes, reminder_sent, created_at, updated_at 
         FROM notification_settings WHERE entity_type = ? AND entity_id = ?",
        rusqlite::params![entity_type, entity_id],
        |row| {
            Ok(NotificationSettings {
                id: row.get(0)?,
                entity_type: row.get(1)?,
                entity_id: row.get(2)?,
                reminder_times: vec![row.get::<_, i32>(3)?], // Convert single value to vec for compatibility
                reminder_minutes: row.get(3)?,
                reminder_sent: row.get::<_, i32>(4)? != 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    );

    let elapsed = start.elapsed().as_millis();
    match &result {
        Ok(_) => log::info!("[API] get_notification_settings - {}ms - ok", elapsed),
        Err(e) => log::info!(
            "[API] get_notification_settings - {}ms - err: {}",
            elapsed,
            e
        ),
    }

    match result {
        Ok(settings) => Ok(Some(settings)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
pub fn set_notification_settings(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_id: String,
    reminder_times: Vec<i32>,
) -> Result<NotificationSettings, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now().to_rfc3339();
    let id = format!("notif-{}-{}", entity_type, entity_id);

    // Serialize reminder_times to JSON string for storage
    let reminder_times_json = serde_json::to_string(&reminder_times).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO notification_settings (id, entity_type, entity_id, reminder_times, reminder_sent, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)
         ON CONFLICT(entity_type, entity_id) DO UPDATE SET reminder_times = ?, reminder_sent = 0, updated_at = ?",
        rusqlite::params![&id, &entity_type, &entity_id, &reminder_times_json, &now, &now, &reminder_times_json, &now],
    ).map_err(|e| e.to_string())?;

    // Retrieve the settings directly
    let result = conn.query_row(
        "SELECT id, entity_type, entity_id, reminder_times, reminder_sent, created_at, updated_at 
         FROM notification_settings WHERE entity_type = ? AND entity_id = ?",
        rusqlite::params![&entity_type, &entity_id],
        |row| {
            // Parse reminder_times from JSON string
            let reminder_times_str: String = row.get(3)?;
            let reminder_times_vec: Vec<i32> = serde_json::from_str(&reminder_times_str).unwrap_or_default();

            Ok(NotificationSettings {
                id: row.get(0)?,
                entity_type: row.get(1)?,
                entity_id: row.get(2)?,
                reminder_times: reminder_times_vec.clone(),
                reminder_minutes: reminder_times_vec.first().copied().unwrap_or(0),
                reminder_sent: row.get::<_, i32>(4)? != 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    ).map_err(|e| e.to_string())?;

    Ok(result)
}

#[tauri::command]
pub fn delete_notification_settings(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_id: String,
) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let rows = conn
        .execute(
            "DELETE FROM notification_settings WHERE entity_type = ? AND entity_id = ?",
            rusqlite::params![entity_type, entity_id],
        )
        .map_err(|e| e.to_string())?;

    Ok(rows > 0)
}

// Delete entity notifications - cleanup notification data when entities are deleted
pub fn delete_entity_notifications(
    conn: &rusqlite::Connection,
    entity_type: &str,
    entity_id: &str,
) -> Result<(), String> {
    // 1. Delete notification_settings
    conn.execute(
        "DELETE FROM notification_settings WHERE entity_type = ? AND entity_id = ?",
        rusqlite::params![entity_type, entity_id],
    )
    .map_err(|e| e.to_string())?;

    // 2. Delete pending status notification_history (keep sent/failed for record keeping)
    conn.execute(
        "DELETE FROM notification_history 
         WHERE entity_type = ? AND entity_id = ? AND status = 'pending'",
        rusqlite::params![entity_type, entity_id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

// Daily summary settings

#[tauri::command]
pub fn get_daily_summary_settings(
    state: tauri::State<AppState>,
) -> Result<DailySummarySettings, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.query_row(
        "SELECT id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at 
         FROM daily_summary_settings LIMIT 1",
        [],
        |row| {
            Ok(DailySummarySettings {
                id: row.get(0)?,
                enabled: row.get::<_, i32>(1)? != 0,
                time: row.get(2)?,
                include_pending: row.get::<_, i32>(3)? != 0,
                include_overdue: row.get::<_, i32>(4)? != 0,
                include_completed: row.get::<_, i32>(5)? != 0,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_daily_summary_settings(
    state: tauri::State<AppState>,
    enabled: bool,
    time: String,
    include_pending: bool,
    include_overdue: bool,
    include_completed: bool,
) -> Result<DailySummarySettings, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE daily_summary_settings SET enabled = ?, time = ?, include_pending = ?, include_overdue = ?, include_completed = ?, updated_at = ? WHERE id = 'default'",
        rusqlite::params![
            enabled as i32,
            &time,
            include_pending as i32,
            include_overdue as i32,
            include_completed as i32,
            &now
        ],
    ).map_err(|e| e.to_string())?;

    // Retrieve the settings directly
    conn.query_row(
        "SELECT id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at 
         FROM daily_summary_settings LIMIT 1",
        [],
        |row| {
            Ok(DailySummarySettings {
                id: row.get(0)?,
                enabled: row.get::<_, i32>(1)? != 0,
                time: row.get(2)?,
                include_pending: row.get::<_, i32>(3)? != 0,
                include_overdue: row.get::<_, i32>(4)? != 0,
                include_completed: row.get::<_, i32>(5)? != 0,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        },
    ).map_err(|e| e.to_string())
}

/// Check if any reminder time matches the current time within tolerance
fn should_trigger_reminder(
    due_date: &str,
    reminder_times: &[i32],
    tolerance_minutes: i32,
) -> Vec<i32> {
    let now = Utc::now();
    let due = match DateTime::parse_from_rfc3339(due_date) {
        Ok(d) => d.with_timezone(&Utc),
        Err(_) => return vec![],
    };

    let minutes_until_due = (due - now).num_minutes();

    reminder_times
        .iter()
        .filter(|&&rt| {
            let expected = rt as i64;
            let actual = minutes_until_due;
            (actual - expected).abs() <= tolerance_minutes as i64
        })
        .copied()
        .collect()
}

// Get due reminders - finds entities with upcoming due dates
#[tauri::command]
pub fn get_due_reminders(state: tauri::State<AppState>) -> Result<Vec<DueReminder>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = Utc::now();
    let tolerance_minutes = 1;

    let mut reminders: Vec<DueReminder> = Vec::new();

    // Query notification settings joined with todos/plans/targets
    let query = r#"
        SELECT ns.entity_type, ns.entity_id, 
               COALESCE(t.due_date, p.due_date, tg.due_date) as due_date,
               COALESCE(t.title, p.title, tg.title) as title,
               ns.reminder_times
        FROM notification_settings ns
        LEFT JOIN todos t ON ns.entity_type = 'todo' AND ns.entity_id = t.id
        LEFT JOIN plans p ON ns.entity_type = 'plan' AND ns.entity_id = p.id  
        LEFT JOIN targets tg ON ns.entity_type = 'target' AND ns.entity_id = tg.id
        WHERE ns.reminder_sent = 0
          AND ns.reminder_times IS NOT NULL
          AND ns.reminder_times != '[]'
          AND ns.reminder_times != ''
          AND COALESCE(t.due_date, p.due_date, tg.due_date) IS NOT NULL
          AND COALESCE(t.due_date, p.due_date, tg.due_date) != ''
    "#;

    let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            let entity_type: String = row.get(0)?;
            let entity_id: String = row.get(1)?;
            let due_date: String = row.get(2)?;
            let title: String = row.get(3)?;
            let reminder_times_json: String = row
                .get::<_, Option<String>>(4)?
                .unwrap_or_else(|| "[]".to_string());

            Ok((entity_type, entity_id, due_date, title, reminder_times_json))
        })
        .map_err(|e| e.to_string())?;

    for row in rows {
        let (entity_type, entity_id, due_date, title, reminder_times_json) =
            row.map_err(|e| e.to_string())?;

        // Parse reminder_times from JSON
        let reminder_times: Vec<i32> =
            serde_json::from_str(&reminder_times_json).unwrap_or_default();

        if reminder_times.is_empty() {
            continue;
        }

        // Parse due date and calculate minutes until due
        let due = match DateTime::parse_from_rfc3339(&due_date) {
            Ok(d) => d.with_timezone(&Utc),
            Err(_) => continue,
        };

        let minutes_until_due = (due - now).num_minutes();

        // Skip if overdue or too far in the future
        if minutes_until_due <= 0 {
            continue;
        }

        // Find which reminder times match current time
        let matched_times = should_trigger_reminder(&due_date, &reminder_times, tolerance_minutes);

        // Only include if at least one reminder time matches
        if !matched_times.is_empty() {
            reminders.push(DueReminder {
                entity_type,
                entity_id,
                title,
                due_date,
                minutes_until_due,
                reminder_times: matched_times,
            });
        }
    }

    Ok(reminders)
}

// Mark reminder as sent

#[tauri::command]
pub fn mark_reminder_sent(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_id: String,
) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let rows = conn.execute(
        "UPDATE notification_settings SET reminder_sent = 1, updated_at = ? WHERE entity_type = ? AND entity_id = ?",
        rusqlite::params![&now, &entity_type, &entity_id],
    ).map_err(|e| e.to_string())?;

    Ok(rows > 0)
}

// Get daily summary

#[tauri::command]
pub fn get_daily_summary(state: tauri::State<AppState>) -> Result<DailySummary, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

    let pending_count: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos WHERE status = 'pending' OR status = 'in-progress'",
            [],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let overdue_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM todos WHERE status != 'done' AND due_date IS NOT NULL AND due_date < ?",
        [&today],
        |row| row.get(0),
    ).unwrap_or(0);

    let completed_count: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos WHERE status = 'done' AND updated_at LIKE ?",
            [&format!("{}%", today)],
            |row| row.get(0),
        )
        .unwrap_or(0);

    let upcoming_count: i32 = conn.query_row(
        "SELECT COUNT(*) FROM todos WHERE status != 'done' AND due_date IS NOT NULL AND due_date > ?",
        [&today],
        |row| row.get(0),
    ).unwrap_or(0);

    Ok(DailySummary {
        date: today,
        pending_count,
        overdue_count,
        completed_count,
        upcoming_count,
    })
}

fn parse_date(date_str: &str) -> Option<chrono::DateTime<chrono::Utc>> {
    // Try RFC3339 format first
    match chrono::DateTime::parse_from_rfc3339(date_str) {
        Ok(dt) => return Some(dt.with_timezone(&chrono::Utc)),
        Err(e) => {
            // Log parse error for debugging
            log::debug!("Failed to parse date '{}' as RFC3339: {}", date_str, e);
        }
    }

    // Fallback to YYYY-MM-DD format
    match chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d") {
        Ok(d) => d.and_hms_opt(0, 0, 0).map(|dt| dt.and_utc()),
        Err(e) => {
            log::warn!(
                "Failed to parse date '{}': neither RFC3339 nor YYYY-MM-DD format. Error: {}",
                date_str,
                e
            );
            None
        }
    }
}

// Notification History APIs

/// Filters for querying notification history
#[derive(Debug, Serialize, Deserialize)]
pub struct NotificationHistoryFilters {
    pub status: Option<String>,
    pub entity_type: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
}

/// Get notification history with optional filters
#[tauri::command]
pub fn get_notification_history(
    state: tauri::State<AppState>,
    filters: Option<NotificationHistoryFilters>,
) -> Result<Vec<NotificationHistory>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut query = String::from(
        "SELECT id, entity_type, entity_id, title, message, reminder_time,
                scheduled_at, sent_at, channel, status, error_message, created_at
         FROM notification_history WHERE 1=1",
    );

    let mut param_values: Vec<Box<dyn rusqlite::types::ToSql>> = Vec::new();

    if let Some(ref f) = filters {
        if let Some(ref status) = f.status {
            query.push_str(" AND status = ?");
            param_values.push(Box::new(status.clone()));
        }
        if let Some(ref entity_type) = f.entity_type {
            query.push_str(" AND entity_type = ?");
            param_values.push(Box::new(entity_type.clone()));
        }
        if let Some(ref start_date) = f.start_date {
            query.push_str(" AND created_at >= ?");
            param_values.push(Box::new(start_date.clone()));
        }
        if let Some(ref end_date) = f.end_date {
            query.push_str(" AND created_at <= ?");
            param_values.push(Box::new(end_date.clone()));
        }
    }

    // Add ordering
    query.push_str(" ORDER BY created_at DESC");

    let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;
    let param_refs: Vec<&dyn rusqlite::types::ToSql> =
        param_values.iter().map(|p| p.as_ref()).collect();
    let items = stmt
        .query_map(param_refs.as_slice(), |row| {
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

    items
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())
}

/// Get pending notifications that are due to be sent
#[tauri::command]
pub fn get_pending_notifications(
    state: tauri::State<AppState>,
) -> Result<Vec<NotificationHistory>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

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

// Global Notification Settings APIs

#[tauri::command]
pub fn get_global_notification_settings(
    state: tauri::State<AppState>,
) -> Result<GlobalNotificationSettings, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.query_row(
        "SELECT id, master_enabled, desktop_enabled, sound_enabled, default_reminder_times,
                todo_default_enabled, todo_default_times, plan_default_enabled, plan_default_times,
                target_default_enabled, target_default_times, dnd_enabled, dnd_start_time, dnd_end_time,
                dnd_days, channel_priority, retention_days, created_at, updated_at
         FROM global_notification_settings LIMIT 1",
        [],
        |row| {
            let default_reminder_times_str: String = row.get(4)?;
            let default_reminder_times: Vec<i32> = serde_json::from_str(&default_reminder_times_str).unwrap_or_else(|_| vec![5, 15, 30]);

            let todo_default_times_str: String = row.get(6)?;
            let todo_default_times: Vec<i32> = serde_json::from_str(&todo_default_times_str).unwrap_or_else(|_| vec![5, 15, 30]);

            let plan_default_times_str: String = row.get(8)?;
            let plan_default_times: Vec<i32> = serde_json::from_str(&plan_default_times_str).unwrap_or_else(|_| vec![5, 15, 30]);

            let target_default_times_str: String = row.get(10)?;
            let target_default_times: Vec<i32> = serde_json::from_str(&target_default_times_str).unwrap_or_else(|_| vec![5, 15, 30]);

            let dnd_days_str: String = row.get(14)?;
            let dnd_days: Vec<i32> = serde_json::from_str(&dnd_days_str).unwrap_or_else(|_| vec![0, 1, 2, 3, 4, 5, 6]);

            let channel_priority_str: String = row.get(15)?;
            let channel_priority: Vec<String> = serde_json::from_str(&channel_priority_str).unwrap_or_else(|_| vec!["desktop".to_string(), "email".to_string(), "webhook".to_string()]);

            Ok(GlobalNotificationSettings {
                id: row.get(0)?,
                master_enabled: row.get::<_, i32>(1)? != 0,
                desktop_enabled: row.get::<_, i32>(2)? != 0,
                sound_enabled: row.get::<_, i32>(3)? != 0,
                default_reminder_times,
                todo_default_enabled: row.get::<_, i32>(5)? != 0,
                todo_default_times,
                plan_default_enabled: row.get::<_, i32>(7)? != 0,
                plan_default_times,
                target_default_enabled: row.get::<_, i32>(9)? != 0,
                target_default_times,
                dnd_enabled: row.get::<_, i32>(11)? != 0,
                dnd_start_time: row.get(12)?,
                dnd_end_time: row.get(13)?,
                dnd_days,
                channel_priority,
                retention_days: row.get(16)?,
                created_at: row.get(17)?,
                updated_at: row.get(18)?,
            })
        },
    ).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_global_notification_settings(
    state: tauri::State<AppState>,
    settings: GlobalNotificationSettings,
) -> Result<GlobalNotificationSettings, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let default_reminder_times_json =
        serde_json::to_string(&settings.default_reminder_times).map_err(|e| e.to_string())?;
    let todo_default_times_json =
        serde_json::to_string(&settings.todo_default_times).map_err(|e| e.to_string())?;
    let plan_default_times_json =
        serde_json::to_string(&settings.plan_default_times).map_err(|e| e.to_string())?;
    let target_default_times_json =
        serde_json::to_string(&settings.target_default_times).map_err(|e| e.to_string())?;
    let dnd_days_json = serde_json::to_string(&settings.dnd_days).map_err(|e| e.to_string())?;
    let channel_priority_json =
        serde_json::to_string(&settings.channel_priority).map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE global_notification_settings SET
            master_enabled = ?, desktop_enabled = ?, sound_enabled = ?, default_reminder_times = ?,
            todo_default_enabled = ?, todo_default_times = ?, plan_default_enabled = ?, plan_default_times = ?,
            target_default_enabled = ?, target_default_times = ?, dnd_enabled = ?, dnd_start_time = ?,
            dnd_end_time = ?, dnd_days = ?, channel_priority = ?, retention_days = ?, updated_at = ?
         WHERE id = 'default'",
        rusqlite::params![
            settings.master_enabled as i32,
            settings.desktop_enabled as i32,
            settings.sound_enabled as i32,
            default_reminder_times_json,
            settings.todo_default_enabled as i32,
            todo_default_times_json,
            settings.plan_default_enabled as i32,
            plan_default_times_json,
            settings.target_default_enabled as i32,
            target_default_times_json,
            settings.dnd_enabled as i32,
            settings.dnd_start_time,
            settings.dnd_end_time,
            dnd_days_json,
            channel_priority_json,
            settings.retention_days,
            &now
        ],
    ).map_err(|e| e.to_string())?;

    // Explicitly drop the connection to release the lock before re-using state
    drop(conn);

    get_global_notification_settings(state)
}

#[tauri::command]
pub fn reset_global_notification_settings(
    state: tauri::State<AppState>,
) -> Result<GlobalNotificationSettings, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "UPDATE global_notification_settings SET
            master_enabled = 1, desktop_enabled = 1, sound_enabled = 1, default_reminder_times = '[5, 15, 30]',
            todo_default_enabled = 1, todo_default_times = '[5, 15, 30]', plan_default_enabled = 1, plan_default_times = '[5, 15, 30]',
            target_default_enabled = 1, target_default_times = '[5, 15, 30]', dnd_enabled = 0, dnd_start_time = '22:00',
            dnd_end_time = '08:00', dnd_days = '[0, 1, 2, 3, 4, 5, 6]', channel_priority = '[\"desktop\", \"email\", \"webhook\"]', retention_days = 30, updated_at = ?
         WHERE id = 'default'",
        rusqlite::params![&now],
    ).map_err(|e| e.to_string())?;

    // Explicitly drop the connection to release the lock before re-using state
    drop(conn);

    get_global_notification_settings(state)
}

/// Send a test notification
/// Uses the first available notification plugin to verify the system is working
#[tauri::command]
pub async fn send_test_notification() -> Result<(), String> {
    use crate::commands::notification_plugins::GLOBAL_REGISTRY;

    // Try to send using the global registry
    // Check if there's any registered sender
    let registry = &*GLOBAL_REGISTRY;

    // Try common notification channels
    let channels = ["webhook", "feishu", "dingtalk", "email"];
    let mut sent = false;

    for channel in channels {
        if let Some(sender) = registry.get(channel) {
            match sender
                .send(
                    "Plan Todos 测试通知",
                    "如果您看到这条消息，说明通知功能正常工作！",
                )
                .await
            {
                Ok(_) => {
                    log::info!("Test notification sent successfully via {}", channel);
                    sent = true;
                    break;
                }
                Err(e) => {
                    log::warn!("Failed to send test notification via {}: {}", channel, e);
                }
            }
        }
    }

    if sent {
        Ok(())
    } else {
        Err("No notification plugin configured. Please configure a notification channel in Settings.".to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use chrono::{Duration, Utc};
    use rusqlite::Connection;

    fn create_test_db() -> Connection {
        let conn = Connection::open_in_memory().unwrap();

        conn.execute(
            "CREATE TABLE IF NOT EXISTS notification_settings (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                reminder_times TEXT,
                reminder_sent INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(entity_type, entity_id)
            )",
            [],
        )
        .unwrap();

        conn.execute(
            "CREATE TABLE IF NOT EXISTS notification_history (
                id TEXT PRIMARY KEY,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT,
                reminder_time INTEGER,
                scheduled_at TEXT NOT NULL,
                sent_at TEXT,
                channel TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'pending',
                error_message TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )
        .unwrap();

        conn
    }

    #[test]
    fn test_set_notification_settings() {
        let conn = create_test_db();
        let now = Utc::now().to_rfc3339();
        let reminder_times = vec![5, 15, 30, 60, 1440];
        let reminder_times_json = serde_json::to_string(&reminder_times).unwrap();

        conn.execute(
            "INSERT INTO notification_settings (id, entity_type, entity_id, reminder_times, reminder_sent, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)",
            rusqlite::params!["notif-todo-1", "todo", "todo-1", &reminder_times_json, &now, &now],
        ).unwrap();

        let settings = conn.query_row(
            "SELECT reminder_times FROM notification_settings WHERE entity_type = 'todo' AND entity_id = 'todo-1'",
            [], |row| {
                let rt: String = row.get(0)?;
                Ok(rt)
            },
        ).unwrap();
        let parsed: Vec<i32> = serde_json::from_str(&settings).unwrap();
        assert_eq!(parsed, vec![5, 15, 30, 60, 1440]);
    }

    #[test]
    fn test_should_trigger_reminder() {
        let now = Utc::now();
        let due_date = now + Duration::minutes(5);
        let result = should_trigger_reminder(&due_date.to_rfc3339(), &[5], 1);
        assert!(!result.is_empty());

        let due_date = now + Duration::minutes(10);
        let result = should_trigger_reminder(&due_date.to_rfc3339(), &[5], 1);
        assert!(result.is_empty());
    }

    #[test]
    fn test_should_trigger_reminder_invalid_date() {
        let result = should_trigger_reminder("invalid", &[5], 1);
        assert!(result.is_empty());
    }

    #[test]
    fn test_delete_entity_notifications() {
        let conn = create_test_db();
        let now = Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO notification_settings (id, entity_type, entity_id, reminder_times, reminder_sent, created_at, updated_at) VALUES (?, ?, ?, ?, 0, ?, ?)",
            rusqlite::params!["notif-todo-1", "todo", "todo-1", "[5]", &now, &now],
        ).unwrap();

        conn.execute(
            "INSERT INTO notification_history (id, entity_type, entity_id, title, message, reminder_time, scheduled_at, sent_at, channel, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params!["hist-pending", "todo", "todo-1", "Test", None::<String>, 30, &now, None::<String>, "test", "pending", None::<String>, &now],
        ).unwrap();

        conn.execute(
            "INSERT INTO notification_history (id, entity_type, entity_id, title, message, reminder_time, scheduled_at, sent_at, channel, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params!["hist-sent", "todo", "todo-1", "Test", None::<String>, 30, &now, &now, "test", "sent", None::<String>, &now],
        ).unwrap();

        delete_entity_notifications(&conn, "todo", "todo-1").unwrap();

        let settings_cnt: i32 = conn
            .query_row("SELECT COUNT(*) FROM notification_settings", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(settings_cnt, 0);

        let pending_cnt: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM notification_history WHERE status = 'pending'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(pending_cnt, 0);

        let sent_cnt: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM notification_history WHERE status = 'sent'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(sent_cnt, 1);
    }

    #[test]
    fn test_notification_history_filters() {
        let conn = create_test_db();
        let now = Utc::now().to_rfc3339();

        for i in 1..=3 {
            conn.execute(
                "INSERT INTO notification_history (id, entity_type, entity_id, title, message, reminder_time, scheduled_at, sent_at, channel, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![format!("hist-{}", i), "todo", format!("todo-{}", i), "Test", None::<String>, 30, &now, None::<String>, "test", "pending", None::<String>, &now],
            ).unwrap();
        }

        let total: i32 = conn
            .query_row("SELECT COUNT(*) FROM notification_history", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(total, 3);

        let pending: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM notification_history WHERE status = 'pending'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(pending, 3);
    }
}
