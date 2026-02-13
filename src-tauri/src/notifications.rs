// Notification system module

use crate::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationSettings {
    pub id: String,
    pub entity_type: String,
    pub entity_id: String,
    pub reminder_minutes: i32,
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

#[derive(Debug, Serialize, Deserialize)]
pub struct DueReminder {
    pub entity_type: String,
    pub entity_id: String,
    pub title: String,
    pub due_date: String,
    pub minutes_until_due: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DailySummary {
    pub date: String,
    pub pending_count: i32,
    pub overdue_count: i32,
    pub completed_count: i32,
    pub upcoming_count: i32,
}

// CRUD for notification settings

#[tauri::command]
pub fn get_notification_settings(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_id: String,
) -> Result<Option<NotificationSettings>, String> {
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
                reminder_minutes: row.get(3)?,
                reminder_sent: row.get::<_, i32>(4)? != 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        },
    );

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
    reminder_minutes: i32,
) -> Result<NotificationSettings, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();
    let id = format!("notif-{}-{}", entity_type, entity_id);

    conn.execute(
        "INSERT INTO notification_settings (id, entity_type, entity_id, reminder_minutes, reminder_sent, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)
         ON CONFLICT(entity_type, entity_id) DO UPDATE SET reminder_minutes = ?, updated_at = ?",
        rusqlite::params![&id, &entity_type, &entity_id, reminder_minutes, &now, &now, reminder_minutes, &now],
    ).map_err(|e| e.to_string())?;

    // Retrieve the settings directly
    let result = conn.query_row(
        "SELECT id, entity_type, entity_id, reminder_minutes, reminder_sent, created_at, updated_at 
         FROM notification_settings WHERE entity_type = ? AND entity_id = ?",
        rusqlite::params![&entity_type, &entity_id],
        |row| {
            Ok(NotificationSettings {
                id: row.get(0)?,
                entity_type: row.get(1)?,
                entity_id: row.get(2)?,
                reminder_minutes: row.get(3)?,
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

// Get due reminders - finds entities with upcoming due dates

#[tauri::command]
pub fn get_due_reminders(state: tauri::State<AppState>) -> Result<Vec<DueReminder>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now();

    let mut reminders: Vec<DueReminder> = Vec::new();

    // Check todos
    let mut stmt = conn
        .prepare(
            "SELECT id, title, due_date FROM todos WHERE status != 'done' AND due_date IS NOT NULL",
        )
        .map_err(|e| e.to_string())?;

    let todo_iter = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    for todo in todo_iter {
        let (id, title, due_date) = todo.map_err(|e| e.to_string())?;
        if let Some(due) = parse_date(&due_date) {
            let duration = due.signed_duration_since(now);
            let minutes = duration.num_minutes();

            // Get reminder minutes for this entity
            let reminder_minutes: i32 = conn.query_row(
                "SELECT reminder_minutes FROM notification_settings WHERE entity_type = 'todo' AND entity_id = ? AND reminder_sent = 0",
                [&id],
                |row| row.get(0),
            ).unwrap_or(30); // Default 30 minutes

            if minutes > 0 && minutes <= reminder_minutes as i64 {
                reminders.push(DueReminder {
                    entity_type: "todo".to_string(),
                    entity_id: id,
                    title,
                    due_date,
                    minutes_until_due: minutes as i32,
                });
            }
        }
    }

    // Check tasks
    let mut stmt = conn
        .prepare(
            "SELECT id, title, end_date FROM tasks WHERE status != 'done' AND end_date IS NOT NULL",
        )
        .map_err(|e| e.to_string())?;

    let task_iter = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    for task in task_iter {
        let (id, title, end_date) = task.map_err(|e| e.to_string())?;
        if let Some(due) = parse_date(&end_date) {
            let duration = due.signed_duration_since(now);
            let minutes = duration.num_minutes();

            let reminder_minutes: i32 = conn.query_row(
                "SELECT reminder_minutes FROM notification_settings WHERE entity_type = 'task' AND entity_id = ? AND reminder_sent = 0",
                [&id],
                |row| row.get(0),
            ).unwrap_or(30);

            if minutes > 0 && minutes <= reminder_minutes as i64 {
                reminders.push(DueReminder {
                    entity_type: "task".to_string(),
                    entity_id: id,
                    title,
                    due_date: end_date,
                    minutes_until_due: minutes as i32,
                });
            }
        }
    }

    // Check milestones
    let mut stmt = conn.prepare(
        "SELECT id, title, target_date FROM milestones WHERE status != 'completed' AND target_date IS NOT NULL"
    ).map_err(|e| e.to_string())?;

    let milestone_iter = stmt
        .query_map([], |row| {
            Ok((
                row.get::<_, String>(0)?,
                row.get::<_, String>(1)?,
                row.get::<_, String>(2)?,
            ))
        })
        .map_err(|e| e.to_string())?;

    for milestone in milestone_iter {
        let (id, title, target_date) = milestone.map_err(|e| e.to_string())?;
        if let Some(due) = parse_date(&target_date) {
            let duration = due.signed_duration_since(now);
            let minutes = duration.num_minutes();

            let reminder_minutes: i32 = conn.query_row(
                "SELECT reminder_minutes FROM notification_settings WHERE entity_type = 'milestone' AND entity_id = ? AND reminder_sent = 0",
                [&id],
                |row| row.get(0),
            ).unwrap_or(30);

            if minutes > 0 && minutes <= reminder_minutes as i64 {
                reminders.push(DueReminder {
                    entity_type: "milestone".to_string(),
                    entity_id: id,
                    title,
                    due_date: target_date,
                    minutes_until_due: minutes as i32,
                });
            }
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
    chrono::DateTime::parse_from_rfc3339(date_str)
        .map(|dt| dt.with_timezone(&chrono::Utc))
        .ok()
        .or_else(|| {
            chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
                .ok()
                .map(|d| d.and_hms_opt(0, 0, 0).unwrap().and_utc())
        })
}
