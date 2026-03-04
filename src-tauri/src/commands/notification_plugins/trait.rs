//! Notification Sender Trait
//!
//! Defines the interface for all notification plugins.

/// Result of sending a notification
#[derive(Debug, Clone)]
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
pub trait NotificationSender {
    /// Unique identifier for this sender type
    fn sender_type(&self) -> &str;

    /// Send a notification
    fn send(&self, title: &str, content: &str) -> Result<SendResult, String>;

    /// Validate the configuration
    fn validate_config(&self, config: &str) -> Result<(), String>;
}
