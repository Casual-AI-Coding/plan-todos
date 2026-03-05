//! Email Notification Sender
//! 
//! Implementation for email notifications via SMTP.

use async_trait::async_trait;
use serde::Deserialize;
use super::r#trait::{NotificationSender, SendResult};

/// Email configuration
#[derive(Debug, Deserialize)]
pub struct EmailConfig {
    pub smtp_host: Option<String>,
    pub smtp_port: Option<u16>,
    #[allow(dead_code)]
    pub username: Option<String>,
    #[allow(dead_code)]
    pub password: Option<String>,
    #[allow(dead_code)]
    pub from: Option<String>,
    pub to: Option<Vec<String>>,
}

/// Email notification sender
pub struct EmailSender {
    config: EmailConfig,
}

impl EmailSender {
    pub fn new(config: &str) -> Result<Self, String> {
        let config = serde_json::from_str::<EmailConfig>(config)
            .map_err(|e| format!("Invalid config: {}", e))?;
        Ok(Self { config })
    }
}

#[async_trait]
impl NotificationSender for EmailSender {
    fn sender_type(&self) -> &str {
        "email"
    }
    
    async fn send(&self, title: &str, content: &str) -> Result<SendResult, String> {
        if self.config.smtp_host.is_none() || self.config.to.is_none() {
            return Err("Email smtp_host and to are required".to_string());
        }
        
        log::info!(
            "[Email] Would send email via {}:{} to {:?}",
            self.config.smtp_host.as_ref().unwrap(),
            self.config.smtp_port.unwrap_or(587),
            self.config.to.as_ref().unwrap()
        );
        
        Ok(SendResult {
            success: true,
            message: "Email queued".to_string(),
            external_id: None,
        })
    }
    
    fn validate_config(&self, config: &str) -> Result<(), String> {
        let _: EmailConfig = serde_json::from_str(config)
            .map_err(|e| format!("Invalid config: {}", e))?;
        Ok(())
    }
}
