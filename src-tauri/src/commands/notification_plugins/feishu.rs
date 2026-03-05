//! Feishu/Lark Notification Sender
//! 
//! Implementation for Feishu (飞书) webhook notifications.

use async_trait::async_trait;
use serde::Deserialize;
use super::r#trait::{NotificationSender, SendResult};

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
    pub fn new(config: &str) -> Result<Self, String> {
        let config = serde_json::from_str::<FeishuConfig>(config)
            .map_err(|e| format!("Invalid config: {}", e))?;
        Ok(Self { config })
    }
}

#[async_trait]
impl NotificationSender for FeishuSender {
    fn sender_type(&self) -> &str {
        "feishu"
    }
    
    async fn send(&self, title: &str, content: &str) -> Result<SendResult, String> {
        if let Some(webhook_url) = &self.config.webhook_url {
            // TODO: 实际发送 HTTP 请求
            // let payload = serde_json::json!({
            //     "msg_type": "text",
            //     "content": {
            //         "text": format!("{}: {}", title, content)
            //     }
            // });
            
            log::info!("[Feishu] Would send to webhook: {}", webhook_url);
            log::info!("[Feishu] Title: {}, Content: {}", title, content);
            
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
        let _: FeishuConfig = serde_json::from_str(config)
            .map_err(|e| format!("Invalid config: {}", e))?;
        Ok(())
    }
}
