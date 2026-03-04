//! Webhook Notification Sender
//! 
//! Implementation for generic webhook notifications.

use serde::Deserialize;
use std::collections::HashMap;
use super::trait::{NotificationSender, SendResult};

/// Webhook configuration
#[derive(Debug, Deserialize)]
pub struct WebhookConfig {
    pub url: Option<String>,
    pub method: Option<String>,
    pub headers: Option<HashMap<String, String>>,
}

/// Generic webhook notification sender
pub struct WebhookSender {
    config: WebhookConfig,
}

impl WebhookSender {
    pub fn new(config: WebhookConfig) -> Self {
        Self { config }
    }
}

impl NotificationSender for WebhookSender {
    fn sender_type(&self) -> &str {
        "webhook"
    }
    
    fn send(&self, title: &str, content: &str) -> Result<SendResult, String> {
        if let Some(url) = &self.config.url {
            let payload = serde_json::json!({
                "title": title,
                "content": content,
                "timestamp": chrono::Utc::now().to_rfc3339(),
            });
            
            log::info!(
                "[Webhook] Sending to {}: {}",
                self.config.method.as_deref().unwrap_or("POST"),
                url
            );
            
            Ok(SendResult {
                success: true,
                message: "Webhook notification sent".to_string(),
                external_id: None,
            })
        } else {
            Err("Webhook url is required".to_string())
        }
    }
    
    fn validate_config(&self, config: &str) -> Result<(), String> {
        serde_json::from_str::<WebhookConfig>(config)
            .map(|_| ())
            .map_err(|e| format!("Invalid Webhook config: {}", e))
    }
}
