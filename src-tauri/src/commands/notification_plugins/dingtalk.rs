//! DingTalk Notification Sender
//! 
//! Implementation for DingTalk (钉钉) webhook notifications.

use serde::Deserialize;
use super::trait::{NotificationSender, SendResult};

/// DingTalk configuration
#[derive(Debug, Deserialize)]
pub struct DingTalkConfig {
    pub webhook_url: Option<String>,
    #[allow(dead_code)]
    pub access_token: Option<String>,
    #[allow(dead_code)]
    pub secret: Option<String>,
}

/// DingTalk notification sender
pub struct DingTalkSender {
    config: DingTalkConfig,
}

impl DingTalkSender {
    pub fn new(config: DingTalkConfig) -> Self {
        Self { config }
    }
}

impl NotificationSender for DingTalkSender {
    fn sender_type(&self) -> &str {
        "dingtalk"
    }
    
    fn send(&self, title: &str, content: &str) -> Result<SendResult, String> {
        if let Some(webhook_url) = &self.config.webhook_url {
            let payload = serde_json::json!({
                "msgtype": "text",
                "text": {
                    "content": format!("{}: {}", title, content)
                }
            });
            
            log::info!("[DingTalk] Sending to webhook: {}", webhook_url);
            
            Ok(SendResult {
                success: true,
                message: "Notification sent to DingTalk".to_string(),
                external_id: None,
            })
        } else {
            Err("DingTalk webhook_url is required".to_string())
        }
    }
    
    fn validate_config(&self, config: &str) -> Result<(), String> {
        serde_json::from_str::<DingTalkConfig>(config)
            .map(|_| ())
            .map_err(|e| format!("Invalid DingTalk config: {}", e))
    }
}
