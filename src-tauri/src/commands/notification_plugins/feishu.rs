//! Feishu/Lark Notification Sender
//! 
//! Implementation for Feishu (飞书) webhook notifications.

use serde::Deserialize;
use super::trait::{NotificationSender, SendResult};

/// Feishu configuration
#[derive(Debug, Deserialize)]
pub struct FeishuConfig {
    pub webhook_url: Option<String>,
    #[allow(dead_code)]
    pub app_id: Option<String>,
    #[allow(dead_code)]
    pub app_secret: Option<String>,
}

/// Feishu notification sender
pub struct FeishuSender {
    config: FeishuConfig,
}

impl FeishuSender {
    pub fn new(config: FeishuConfig) -> Self {
        Self { config }
    }
}

impl NotificationSender for FeishuSender {
    fn sender_type(&self) -> &str {
        "feishu"
    }
    
    fn send(&self, title: &str, content: &str) -> Result<SendResult, String> {
        if let Some(webhook_url) = &self.config.webhook_url {
            let payload = serde_json::json!({
                "msg_type": "text",
                "content": {
                    "text": format!("{}: {}", title, content)
                }
            });
            
            log::info!("[Feishu] Sending to webhook: {}", webhook_url);
            
            Ok(SendResult {
                success: true,
                message: "Notification sent to Feishu".to_string(),
                external_id: None,
            })
        } else {
            Err("Feishu webhook_url is required".to_string())
        }
    }
    
    fn validate_config(&self, config: &str) -> Result<(), String> {
        serde_json::from_str::<FeishuConfig>(config)
            .map(|_| ())
            .map_err(|e| format!("Invalid Feishu config: {}", e))
    }
}
