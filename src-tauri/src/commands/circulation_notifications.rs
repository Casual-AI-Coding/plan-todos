// Circulation Notification Settings API

use crate::log_command;
use crate::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CirculationNotificationSettings {
    pub id: String,
    pub circulation_id: String,
    pub enabled: bool,
    pub reminder_type: String,
    pub fixed_time: Option<String>,
    pub before_minutes: Option<i32>,
    pub achievement_type: Option<String>,
    pub achievement_threshold: Option<i32>,
    pub channels: String,
    pub message_template: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CirculationNotificationSettingsInput {
    pub enabled: Option<bool>,
    pub reminder_type: Option<String>,
    pub fixed_time: Option<String>,
    pub before_minutes: Option<i32>,
    pub achievement_type: Option<String>,
    pub achievement_threshold: Option<i32>,
    pub channels: Option<String>,
    pub message_template: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GlobalCirculationNotificationSettings {
    pub id: String,
    pub master_enabled: bool,
    pub default_reminder_type: String,
    pub default_fixed_time: String,
    pub default_before_minutes: i32,
    pub achievement_notifications: bool,
    pub streak_milestones: String,
    pub count_milestones: String,
    pub default_channels: String,
    pub dnd_enabled: bool,
    pub dnd_start_time: String,
    pub dnd_end_time: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GlobalCirculationNotificationSettingsInput {
    pub master_enabled: Option<bool>,
    pub default_reminder_type: Option<String>,
    pub default_fixed_time: Option<String>,
    pub default_before_minutes: Option<i32>,
    pub achievement_notifications: Option<bool>,
    pub streak_milestones: Option<String>,
    pub count_milestones: Option<String>,
    pub default_channels: Option<String>,
    pub dnd_enabled: Option<bool>,
    pub dnd_start_time: Option<String>,
    pub dnd_end_time: Option<String>,
}

// Get notification settings for a specific circulation
#[tauri::command]
pub fn get_circulation_notification_settings(
    state: tauri::State<AppState>,
    circulation_id: String,
) -> Result<Option<CirculationNotificationSettings>, String> {
    log_command!("get_circulation_notification_settings", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT id, circulation_id, enabled, reminder_type, fixed_time, 
                        before_minutes, achievement_type, achievement_threshold,
                        channels, message_template, created_at, updated_at
                 FROM circulation_notification_settings 
                 WHERE circulation_id = ?",
            )
            .map_err(|e| e.to_string())?;

        let result = stmt
            .query_row([&circulation_id], |row| {
                Ok(CirculationNotificationSettings {
                    id: row.get(0)?,
                    circulation_id: row.get(1)?,
                    enabled: row.get::<_, i32>(2)? == 1,
                    reminder_type: row.get(3)?,
                    fixed_time: row.get(4)?,
                    before_minutes: row.get(5)?,
                    achievement_type: row.get(6)?,
                    achievement_threshold: row.get(7)?,
                    channels: row.get(8)?,
                    message_template: row.get(9)?,
                    created_at: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            })
            .ok();

        Ok(result)
    })
}

// Update notification settings for a circulation
#[tauri::command]
pub fn update_circulation_notification_settings(
    state: tauri::State<AppState>,
    circulation_id: String,
    input: CirculationNotificationSettingsInput,
) -> Result<CirculationNotificationSettings, String> {
    log_command!("update_circulation_notification_settings", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let now = chrono::Utc::now().to_rfc3339();

        // Check if settings exist
        let exists: bool = conn
            .query_row(
                "SELECT 1 FROM circulation_notification_settings WHERE circulation_id = ?",
                [&circulation_id],
                |row| row.get::<_, i32>(0).map(|_| true),
            )
            .unwrap_or(false);

        if exists {
            // Update existing
            let mut updates = vec!["updated_at = ?".to_string()];
            let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now.clone())];

            if let Some(enabled) = input.enabled {
                updates.push("enabled = ?".to_string());
                params.push(Box::new(if enabled { 1 } else { 0 }));
            }
            if let Some(ref reminder_type) = input.reminder_type {
                updates.push("reminder_type = ?".to_string());
                params.push(Box::new(reminder_type.clone()));
            }
            if let Some(ref fixed_time) = input.fixed_time {
                updates.push("fixed_time = ?".to_string());
                params.push(Box::new(fixed_time.clone()));
            }
            if let Some(before_minutes) = input.before_minutes {
                updates.push("before_minutes = ?".to_string());
                params.push(Box::new(before_minutes));
            }
            if let Some(ref achievement_type) = input.achievement_type {
                updates.push("achievement_type = ?".to_string());
                params.push(Box::new(achievement_type.clone()));
            }
            if let Some(achievement_threshold) = input.achievement_threshold {
                updates.push("achievement_threshold = ?".to_string());
                params.push(Box::new(achievement_threshold));
            }
            if let Some(ref channels) = input.channels {
                updates.push("channels = ?".to_string());
                params.push(Box::new(channels.clone()));
            }
            if let Some(ref message_template) = input.message_template {
                updates.push("message_template = ?".to_string());
                params.push(Box::new(message_template.clone()));
            }

            let query = format!(
                "UPDATE circulation_notification_settings SET {} WHERE circulation_id = ?",
                updates.join(", ")
            );
            params.push(Box::new(circulation_id.clone()));

            conn.execute(
                &query,
                rusqlite::params_from_iter(params.iter().map(|p| p.as_ref())),
            )
            .map_err(|e| e.to_string())?;
        } else {
            // Insert new
            let id = uuid::Uuid::new_v4().to_string();
            let enabled = input.enabled.unwrap_or(true);
            let reminder_type = input.reminder_type.unwrap_or_else(|| "fixed".to_string());
            let channels = input
                .channels
                .unwrap_or_else(|| "[\"desktop\"]".to_string());

            conn.execute(
                "INSERT INTO circulation_notification_settings 
                 (id, circulation_id, enabled, reminder_type, fixed_time, before_minutes,
                  achievement_type, achievement_threshold, channels, message_template, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![
                    id,
                    circulation_id,
                    if enabled { 1 } else { 0 },
                    reminder_type,
                    input.fixed_time,
                    input.before_minutes,
                    input.achievement_type,
                    input.achievement_threshold,
                    channels,
                    input.message_template,
                    now,
                    now,
                ],
            )
            .map_err(|e| e.to_string())?;
        }

        // Return updated settings
        drop(conn);
        get_circulation_notification_settings(state, circulation_id)?
            .ok_or_else(|| "Failed to get updated settings".to_string())
    })
}

// Delete notification settings for a circulation
#[tauri::command]
pub fn delete_circulation_notification_settings(
    state: tauri::State<AppState>,
    circulation_id: String,
) -> Result<bool, String> {
    log_command!("delete_circulation_notification_settings", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let rows_affected = conn
            .execute(
                "DELETE FROM circulation_notification_settings WHERE circulation_id = ?",
                [&circulation_id],
            )
            .map_err(|e| e.to_string())?;

        Ok(rows_affected > 0)
    })
}

// Get global circulation notification settings
#[tauri::command]
pub fn get_global_circulation_notification_settings(
    state: tauri::State<AppState>,
) -> Result<GlobalCirculationNotificationSettings, String> {
    log_command!("get_global_circulation_notification_settings", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        conn.query_row(
            "SELECT id, master_enabled, default_reminder_type, default_fixed_time,
                    default_before_minutes, achievement_notifications, streak_milestones,
                    count_milestones, default_channels, dnd_enabled, dnd_start_time,
                    dnd_end_time, updated_at
             FROM global_circulation_notification_settings
             WHERE id = 'global'",
            [],
            |row| {
                Ok(GlobalCirculationNotificationSettings {
                    id: row.get(0)?,
                    master_enabled: row.get::<_, i32>(1)? == 1,
                    default_reminder_type: row.get(2)?,
                    default_fixed_time: row.get(3)?,
                    default_before_minutes: row.get(4)?,
                    achievement_notifications: row.get::<_, i32>(5)? == 1,
                    streak_milestones: row.get(6)?,
                    count_milestones: row.get(7)?,
                    default_channels: row.get(8)?,
                    dnd_enabled: row.get::<_, i32>(9)? == 1,
                    dnd_start_time: row.get(10)?,
                    dnd_end_time: row.get(11)?,
                    updated_at: row.get(12)?,
                })
            },
        )
        .map_err(|e| e.to_string())
    })
}

// Update global circulation notification settings
#[tauri::command]
pub fn update_global_circulation_notification_settings(
    state: tauri::State<AppState>,
    input: GlobalCirculationNotificationSettingsInput,
) -> Result<GlobalCirculationNotificationSettings, String> {
    log_command!("update_global_circulation_notification_settings", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let now = chrono::Utc::now().to_rfc3339();

        let mut updates = vec!["updated_at = ?".to_string()];
        let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now.clone())];

        if let Some(master_enabled) = input.master_enabled {
            updates.push("master_enabled = ?".to_string());
            params.push(Box::new(if master_enabled { 1 } else { 0 }));
        }
        if let Some(ref default_reminder_type) = input.default_reminder_type {
            updates.push("default_reminder_type = ?".to_string());
            params.push(Box::new(default_reminder_type.clone()));
        }
        if let Some(ref default_fixed_time) = input.default_fixed_time {
            updates.push("default_fixed_time = ?".to_string());
            params.push(Box::new(default_fixed_time.clone()));
        }
        if let Some(default_before_minutes) = input.default_before_minutes {
            updates.push("default_before_minutes = ?".to_string());
            params.push(Box::new(default_before_minutes));
        }
        if let Some(achievement_notifications) = input.achievement_notifications {
            updates.push("achievement_notifications = ?".to_string());
            params.push(Box::new(if achievement_notifications { 1 } else { 0 }));
        }
        if let Some(ref streak_milestones) = input.streak_milestones {
            updates.push("streak_milestones = ?".to_string());
            params.push(Box::new(streak_milestones.clone()));
        }
        if let Some(ref count_milestones) = input.count_milestones {
            updates.push("count_milestones = ?".to_string());
            params.push(Box::new(count_milestones.clone()));
        }
        if let Some(ref default_channels) = input.default_channels {
            updates.push("default_channels = ?".to_string());
            params.push(Box::new(default_channels.clone()));
        }
        if let Some(dnd_enabled) = input.dnd_enabled {
            updates.push("dnd_enabled = ?".to_string());
            params.push(Box::new(if dnd_enabled { 1 } else { 0 }));
        }
        if let Some(ref dnd_start_time) = input.dnd_start_time {
            updates.push("dnd_start_time = ?".to_string());
            params.push(Box::new(dnd_start_time.clone()));
        }
        if let Some(ref dnd_end_time) = input.dnd_end_time {
            updates.push("dnd_end_time = ?".to_string());
            params.push(Box::new(dnd_end_time.clone()));
        }

        let query = format!(
            "UPDATE global_circulation_notification_settings SET {} WHERE id = 'global'",
            updates.join(", ")
        );

        conn.execute(
            &query,
            rusqlite::params_from_iter(params.iter().map(|p| p.as_ref())),
        )
        .map_err(|e| e.to_string())?;

        drop(conn);
        get_global_circulation_notification_settings(state)
    })
}

// Get all circulations with their notification settings
#[tauri::command]
pub fn get_circulations_with_notification_settings(
    state: tauri::State<AppState>,
) -> Result<Vec<CirculationWithNotificationSettings>, String> {
    log_command!("get_circulations_with_notification_settings", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT c.id, c.title, c.circulation_type, c.frequency, c.status,
                        COALESCE(ns.enabled, 1) as enabled,
                        COALESCE(ns.reminder_type, 'fixed') as reminder_type,
                        ns.fixed_time, ns.before_minutes, ns.achievement_type,
                        ns.achievement_threshold, ns.channels, ns.message_template
                 FROM circulations c
                 LEFT JOIN circulation_notification_settings ns ON c.id = ns.circulation_id
                 WHERE c.status = 'active'
                 ORDER BY c.title",
            )
            .map_err(|e| e.to_string())?;

        let circulations: Vec<CirculationWithNotificationSettings> = stmt
            .query_map([], |row| {
                Ok(CirculationWithNotificationSettings {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    circulation_type: row.get(2)?,
                    frequency: row.get(3)?,
                    status: row.get(4)?,
                    notification_settings: Some(CirculationNotificationSettings {
                        id: String::new(),
                        circulation_id: row.get(0)?,
                        enabled: row.get::<_, i32>(5)? == 1,
                        reminder_type: row.get(6)?,
                        fixed_time: row.get(7)?,
                        before_minutes: row.get(8)?,
                        achievement_type: row.get(9)?,
                        achievement_threshold: row.get(10)?,
                        channels: row
                            .get::<_, String>(11)
                            .unwrap_or_else(|_| "[\"desktop\"]".to_string()),
                        message_template: row.get(12)?,
                        created_at: String::new(),
                        updated_at: String::new(),
                    }),
                })
            })
            .map_err(|e| e.to_string())?
            .filter_map(|r| r.ok())
            .collect();

        Ok(circulations)
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CirculationWithNotificationSettings {
    pub id: String,
    pub title: String,
    pub circulation_type: String,
    pub frequency: Option<String>,
    pub status: String,
    pub notification_settings: Option<CirculationNotificationSettings>,
}
