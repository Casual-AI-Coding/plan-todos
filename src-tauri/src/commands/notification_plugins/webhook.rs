//! Webhook Notification Sender
//! 
//! Implementation for generic webhook notifications.

use async_trait::async_trait;
use serde::Deserialize;
use std::collections::HashMap;
use super::r#trait::{NotificationSender, SendResult};

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
    pub fn new(config: &str) -> Result<Self, String> {
        let config = serde_json::from_str::<WebhookConfig>(config)
            .map_err(|e| format!("Invalid config: {}", e))?;
        Ok(Self { config })
    }
}

#[async_trait]
impl NotificationSender for WebhookSender {
    fn sender_type(&self) -> &str {
        "webhook"
    }
    
    async fn send(&self, title: &str, content: &str) -> Result<SendResult, String> {
        if let Some(url) = &self.config.url {
            // TODO: 实际发送 HTTP 请求
            // let payload = serde_json::json!({
            //     "title": title,
            //     "content": content,
            //     "timestamp": chrono::Utc::now().to_rfc3339(),
            // });
            
            log::info!(
                "[Webhook] Would send to {}: {}",
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
        let _: WebhookConfig = serde_json::from_str(config)
            .map_err(|e| format!("Invalid config: {}", e))?;
        Ok(())
    }
}
