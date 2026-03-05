//! Notification Sender Trait
//!
//! Defines the interface for all notification plugins.
//!
//! ## Usage
//!
//! Implement this trait to add new notification channels. Each implementation must:
//! - Provide a unique `sender_type()` identifier
//! - Implement async `send()` for notification delivery
//! - Implement `validate_config()` for configuration validation
//!
//! ## Adding New Plugins (OCP Principle)
//!
//! To add a new notification type:
//! 1. Create a new module (e.g., `slack.rs`)
//! 2. Implement `NotificationSender` trait
//! 3. Register in `registry.rs`'s `GLOBAL_REGISTRY`
//!
//! No existing code needs modification to add new plugins.
//!
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
