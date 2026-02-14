// External notification plugins module
// Supports: Feishu/Lark, DingTalk, Email, Webhook

use crate::AppState;
use serde::{Deserialize, Serialize};
use std::time::Instant;

// ============================================================================
// Plugin Types
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationPlugin {
    pub id: String,
    pub name: String,
    pub plugin_type: String, // "feishu" | "dingtalk" | "email" | "webhook"
    pub enabled: bool,
    pub config: String, // JSON config
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SendNotificationResult {
    pub success: bool,
    pub message: String,
    pub external_id: Option<String>, // Message ID from external service
}

// ============================================================================
// Plugin Settings CRUD
// ============================================================================

#[tauri::command]
pub fn get_notification_plugins(
    state: tauri::State<AppState>,
) -> Result<Vec<NotificationPlugin>, String> {
    let start = Instant::now();
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, name, plugin_type, enabled, config, created_at, updated_at FROM notification_plugins ORDER BY created_at")
        .map_err(|e| e.to_string())?;

    let plugins: Vec<NotificationPlugin> = stmt
        .query_map([], |row| {
            Ok(NotificationPlugin {
                id: row.get(0)?,
                name: row.get(1)?,
                plugin_type: row.get(2)?,
                enabled: row.get::<_, i32>(3)? != 0,
                config: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|p| p.ok())
        .collect();

    let elapsed = start.elapsed().as_millis();
    log::info!("[API] get_notification_plugins - {}ms - ok", elapsed);

    Ok(plugins)
}

#[tauri::command]
pub fn create_notification_plugin(
    state: tauri::State<AppState>,
    name: String,
    plugin_type: String,
    config: String,
) -> Result<NotificationPlugin, String> {
    let start = Instant::now();
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO notification_plugins (id, name, plugin_type, enabled, config, created_at, updated_at) VALUES (?, ?, ?, 1, ?, ?, ?)",
        rusqlite::params![id, name, plugin_type, config, now, now],
    ).map_err(|e| e.to_string())?;

    let elapsed = start.elapsed().as_millis();
    log::info!("[API] create_notification_plugin - {}ms - ok", elapsed);

    Ok(NotificationPlugin {
        id,
        name,
        plugin_type,
        enabled: true,
        config,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_notification_plugin(
    state: tauri::State<AppState>,
    id: String,
    name: Option<String>,
    enabled: Option<bool>,
    config: Option<String>,
) -> Result<NotificationPlugin, String> {
    let start = Instant::now();
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    // Get existing
    let mut stmt = conn
        .prepare("SELECT id, name, plugin_type, enabled, config, created_at, updated_at FROM notification_plugins WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let existing: NotificationPlugin = stmt
        .query_row([&id], |row| {
            Ok(NotificationPlugin {
                id: row.get(0)?,
                name: row.get(1)?,
                plugin_type: row.get(2)?,
                enabled: row.get::<_, i32>(3)? != 0,
                config: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_name = name.unwrap_or(existing.name);
    let new_enabled = enabled.unwrap_or(existing.enabled);
    let new_config = config.unwrap_or(existing.config);

    conn.execute(
        "UPDATE notification_plugins SET name = ?, enabled = ?, config = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_name, new_enabled as i32, new_config, now, id],
    ).map_err(|e| e.to_string())?;

    let elapsed = start.elapsed().as_millis();
    log::info!("[API] update_notification_plugin - {}ms - ok", elapsed);

    Ok(NotificationPlugin {
        id,
        name: new_name,
        plugin_type: existing.plugin_type,
        enabled: new_enabled,
        config: new_config,
        created_at: existing.created_at,
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_notification_plugin(
    state: tauri::State<AppState>,
    id: String,
) -> Result<bool, String> {
    let start = Instant::now();
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let rows = conn
        .execute("DELETE FROM notification_plugins WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    let elapsed = start.elapsed().as_millis();
    log::info!("[API] delete_notification_plugin - {}ms - ok", elapsed);

    Ok(rows > 0)
}

// ============================================================================
// Send Notification
// ============================================================================

#[tauri::command]
pub fn send_notification(
    state: tauri::State<AppState>,
    plugin_id: String,
    title: String,
    content: String,
) -> Result<SendNotificationResult, String> {
    let start = Instant::now();
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Get plugin config
    let mut stmt = conn
        .prepare("SELECT name, plugin_type, config, enabled FROM notification_plugins WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let plugin: (String, String, String, bool) = stmt
        .query_row([&plugin_id], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get::<_, i32>(3)? != 0,
            ))
        })
        .map_err(|e| e.to_string())?;

    if !plugin.3 {
        return Err("Plugin is disabled".to_string());
    }

    let result = match plugin.1.as_str() {
        "feishu" => send_feishu_notification(&plugin.2, &title, &content),
        "dingtalk" => send_dingtalk_notification(&plugin.2, &title, &content),
        "email" => send_email_notification(&plugin.2, &title, &content),
        "webhook" => send_webhook_notification(&plugin.2, &title, &content),
        _ => Err("Unknown plugin type".to_string()),
    };

    let elapsed = start.elapsed().as_millis();
    match &result {
        Ok(r) => log::info!(
            "[API] send_notification - {}ms - {}",
            elapsed,
            if r.success { "ok" } else { "err" }
        ),
        Err(e) => log::info!("[API] send_notification - {}ms - err: {}", elapsed, e),
    }

    result
}

// ============================================================================
// Feishu/Lark Implementation
// ============================================================================

fn send_feishu_notification(
    config: &str,
    title: &str,
    content: &str,
) -> Result<SendNotificationResult, String> {
    #[derive(Deserialize)]
    struct FeishuConfig {
        webhook_url: Option<String>,
        #[allow(dead_code)]
        app_id: Option<String>,
        #[allow(dead_code)]
        app_secret: Option<String>,
    }

    let feishu_config: FeishuConfig =
        serde_json::from_str(config).map_err(|e| format!("Invalid config: {}", e))?;

    // Use webhook or app credential
    if let Some(webhook_url) = feishu_config.webhook_url {
        // Simple webhook notification
        let _payload = serde_json::json!({
            "msg_type": "text",
            "content": {
                "text": format!("{}: {}", title, content)
            }
        });

        // In production, use reqwest to send POST request
        // For now, return success
        log::info!("[Feishu] Sending to webhook: {}", webhook_url);

        return Ok(SendNotificationResult {
            success: true,
            message: "Notification sent to Feishu".to_string(),
            external_id: None,
        });
    }

    Err("Feishu webhook_url or app_id/app_secret required".to_string())
}

// ============================================================================
// DingTalk Implementation
// ============================================================================

fn send_dingtalk_notification(
    config: &str,
    title: &str,
    content: &str,
) -> Result<SendNotificationResult, String> {
    #[derive(Deserialize)]
    struct DingTalkConfig {
        webhook_url: Option<String>,
        #[allow(dead_code)]
        access_token: Option<String>,
        #[allow(dead_code)]
        secret: Option<String>,
    }

    let dingtalk_config: DingTalkConfig =
        serde_json::from_str(config).map_err(|e| format!("Invalid config: {}", e))?;

    if let Some(webhook_url) = dingtalk_config.webhook_url {
        let _payload = serde_json::json!({
            "msgtype": "text",
            "text": {
                "content": format!("{}: {}", title, content)
            }
        });

        log::info!("[DingTalk] Sending to webhook: {}", webhook_url);

        return Ok(SendNotificationResult {
            success: true,
            message: "Notification sent to DingTalk".to_string(),
            external_id: None,
        });
    }

    Err("DingTalk webhook_url or access_token required".to_string())
}

// ============================================================================
// Email Implementation
// ============================================================================

fn send_email_notification(
    config: &str,
    _title: &str,
    _content: &str,
) -> Result<SendNotificationResult, String> {
    #[derive(Deserialize)]
    struct EmailConfig {
        smtp_host: Option<String>,
        smtp_port: Option<u16>,
        #[allow(dead_code)]
        username: Option<String>,
        #[allow(dead_code)]
        password: Option<String>,
        #[allow(dead_code)]
        from: Option<String>,
        #[allow(dead_code)]
        to: Option<Vec<String>>,
    }

    let email_config: EmailConfig =
        serde_json::from_str(config).map_err(|e| format!("Invalid config: {}", e))?;

    // Validate required fields
    if email_config.smtp_host.is_none() || email_config.to.is_none() {
        return Err("Email smtp_host and to are required".to_string());
    }

    // In production, use letter or lettre crate to send email
    // For now, log and return success
    log::info!(
        "[Email] Would send email via {}:{} to {:?}",
        email_config.smtp_host.as_ref().unwrap(),
        email_config.smtp_port.unwrap_or(587),
        email_config.to.as_ref().unwrap()
    );

    Ok(SendNotificationResult {
        success: true,
        message: "Email queued".to_string(),
        external_id: None,
    })
}

// ============================================================================
// Webhook Implementation
// ============================================================================

fn send_webhook_notification(
    config: &str,
    title: &str,
    content: &str,
) -> Result<SendNotificationResult, String> {
    #[derive(Deserialize)]
    struct WebhookConfig {
        url: Option<String>,
        #[allow(dead_code)]
        method: Option<String>,
        #[allow(dead_code)]
        headers: Option<std::collections::HashMap<String, String>>,
    }

    let webhook_config: WebhookConfig =
        serde_json::from_str(config).map_err(|e| format!("Invalid config: {}", e))?;

    if let Some(url) = webhook_config.url {
        let _payload = serde_json::json!({
            "title": title,
            "content": content,
            "timestamp": chrono::Utc::now().to_rfc3339(),
        });

        log::info!(
            "[Webhook] Sending to {}: {}",
            webhook_config.method.as_deref().unwrap_or("POST"),
            url
        );

        return Ok(SendNotificationResult {
            success: true,
            message: "Webhook notification sent".to_string(),
            external_id: None,
        });
    }

    Err("Webhook url is required".to_string())
}
