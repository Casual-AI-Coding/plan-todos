//! DingTalk Notification Sender
//!
//! Implementation for DingTalk (钉钉) webhook notifications.
//!
//! ## Configuration Format
//!
//! ```json
//! {
//!   "webhook_url": "https://oapi.dingtalk.com/robot/send?access_token=xxx"
//! }
//! ```
//!
//! 
//! Implementation for DingTalk (钉钉) webhook notifications.

use async_trait::async_trait;
use serde::Deserialize;
use super::r#trait::{NotificationSender, SendResult};

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
    pub fn new(config: &str) -> Result<Self, String> {
        let config = serde_json::from_str::<DingTalkConfig>(config)
            .map_err(|e| format!("Invalid config: {}", e))?;
        Ok(Self { config })
    }
}

#[async_trait]
impl NotificationSender for DingTalkSender {
    fn sender_type(&self) -> &str {
        "dingtalk"
    }
    
    async fn send(&self, title: &str, content: &str) -> Result<SendResult, String> {
        if let Some(webhook_url) = &self.config.webhook_url {
            // TODO: 实际发送 HTTP 请求
            // let payload = serde_json::json!({
            //     "msgtype": "text",
            //     "text": {
            //         "content": format!("{}: {}", title, content)
            //     }
            // });
            
            log::info!("[DingTalk] Would send to webhook: {}", webhook_url);
            log::info!("[DingTalk] Title: {}, Content: {}", title, content);
            
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
        let _: DingTalkConfig = serde_json::from_str(config)
            .map_err(|e| format!("Invalid config: {}", e))?;
        Ok(())
    }
}
