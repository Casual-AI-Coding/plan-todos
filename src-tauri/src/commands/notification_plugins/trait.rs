//! Notification Sender Trait
//!
//! Defines the interface for all notification plugins.

use async_trait::async_trait;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SendResult {
    pub success: bool,
    pub message: String,
    pub external_id: Option<String>,
}

/// Trait for notification senders (OCP: Open-Closed Principle)
///
/// Implement this trait to add new notification channels:
/// - Feishu/Lark
/// - DingTalk
/// - Email
/// - Webhook
/// - etc.
#[async_trait]
pub trait NotificationSender: Send + Sync {
    /// Unique identifier for this sender type
    fn sender_type(&self) -> &str;

    /// Send a notification
    async fn send(&self, title: &str, content: &str) -> Result<SendResult, String>;

    /// Validate the configuration
    fn validate_config(&self, config: &str) -> Result<(), String>;
}
