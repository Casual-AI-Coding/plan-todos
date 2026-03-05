//! Notification Plugins Module
//!
//! This module implements the OCP-compliant plugin system using Trait + Registry pattern.

mod r#trait;
mod registry;
mod feishu;
mod dingtalk;
mod email;
mod webhook;

pub use r#trait::{NotificationSender, SendResult};
pub use registry::PluginRegistry;

use serde::{Deserialize, Serialize};
use tauri::State;
use crate::AppState;

/// Notification plugin configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationPlugin {
    pub id: String,
    pub name: String,
    pub plugin_type: String,
    pub enabled: bool,
    pub config: String,
    pub created_at: String,
    pub updated_at: String,
}

/// Get all notification plugins
#[tauri::command]
pub async fn get_notification_plugins(
    state: State<'_, AppState>,
) -> Result<Vec<NotificationPlugin>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = conn
        .prepare(
            "SELECT id, name, plugin_type, enabled, config, created_at, updated_at 
             FROM notification_plugins ORDER BY created_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let plugins = stmt
        .query_map([], |row| {
            Ok(NotificationPlugin {
                id: row.get(0)?,
                name: row.get(1)?,
                plugin_type: row.get(2)?,
                enabled: row.get(3)?,
                config: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(plugins)
}

/// Create a new notification plugin
#[tauri::command]
pub async fn create_notification_plugin(
    state: State<'_, AppState>,
    id: String,
    name: String,
    plugin_type: String,
    enabled: bool,
    config: String,
) -> Result<NotificationPlugin, String> {
    // Validate config using the registry
    let registry = &registry::GLOBAL_REGISTRY;
    if let Some(sender) = registry.get(&plugin_type) {
        sender.validate_config(&config)?;
    } else {
        return Err(format!("Unknown plugin type: {}", plugin_type));
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().to_rfc3339();

    conn.execute(
        "INSERT INTO notification_plugins (id, name, plugin_type, enabled, config, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params![id, name, plugin_type, enabled, config, now, now],
    )
    .map_err(|e| e.to_string())?;

    Ok(NotificationPlugin {
        id,
        name,
        plugin_type,
        enabled,
        config,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Update a notification plugin
#[tauri::command]
pub async fn update_notification_plugin(
    state: State<'_, AppState>,
    id: String,
    name: String,
    enabled: bool,
    config: String,
) -> Result<NotificationPlugin, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Local::now().to_rfc3339();

    // Get existing plugin to validate config
    let plugin_type: String = conn
        .query_row(
            "SELECT plugin_type FROM notification_plugins WHERE id = ?",
            [&id],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Validate config
    let registry = &registry::GLOBAL_REGISTRY;
    if let Some(sender) = registry.get(&plugin_type) {
        sender.validate_config(&config)?;
    }

    conn.execute(
        "UPDATE notification_plugins 
         SET name = ?, enabled = ?, config = ?, updated_at = ? 
         WHERE id = ?",
        rusqlite::params![name, enabled, config, now, id],
    )
    .map_err(|e| e.to_string())?;

    Ok(NotificationPlugin {
        id,
        name,
        plugin_type,
        enabled,
        config,
        created_at: now.clone(),
        updated_at: now,
    })
}

/// Delete a notification plugin
#[tauri::command]
pub async fn delete_notification_plugin(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "DELETE FROM notification_plugins WHERE id = ?",
        [&id],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Send a notification through a plugin
#[tauri::command]
pub async fn send_notification(
    state: State<'_, AppState>,
    plugin_id: String,
    title: String,
    content: String,
) -> Result<SendResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Get plugin config
    let (plugin_type, config): (String, String) = conn
        .query_row(
            "SELECT plugin_type, config FROM notification_plugins WHERE id = ?",
            [&plugin_id],
            |row| Ok((row.get(0)?, row.get(1)?)),
        )
        .map_err(|e| e.to_string())?;

    // Get sender from registry
    let registry = &registry::GLOBAL_REGISTRY;
    let sender = registry
        .get(&plugin_type)
        .ok_or_else(|| format!("Unknown plugin type: {}", plugin_type))?;

    // Send notification
    sender.send(&title, &content).await
}

/// Get supported plugin types
#[tauri::command]
pub fn get_supported_plugin_types() -> Vec<String> {
    registry::GLOBAL_REGISTRY.list_types()
}
#[cfg(test)]
mod tests;
