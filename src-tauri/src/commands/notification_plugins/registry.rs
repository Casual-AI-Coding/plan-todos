//! Plugin Registry
//!
//! Central registry for managing notification plugins using OCP pattern.
//!
//! ## Architecture
//!
//! The registry uses a HashMap to store sender instances, allowing dynamic
//! lookup by sender type. All senders are wrapped in `Arc<dyn NotificationSender>`
//! for shared ownership and thread-safe access.
//!
//! ## Thread Safety
//!
//! - `RwLock` allows concurrent reads while exclusive writes
//! - `Arc` enables safe sharing across threads
//! - `Send + Sync` bounds ensure the trait object is safe for concurrency
//!
//! 
//! Central registry for managing notification plugins using OCP pattern.

use once_cell::sync::Lazy;
use parking_lot::RwLock;
use std::collections::HashMap;
use std::sync::Arc;

use super::r#trait::{NotificationSender, SendResult};
use super::feishu::FeishuSender;
use super::dingtalk::DingTalkSender;
use super::webhook::WebhookSender;
use super::email::EmailSender;

/// Sender reference type - Arc for shared ownership, Send + Sync for thread safety
pub type SenderRef = Arc<dyn NotificationSender>;

/// Plugin Registry - manages all notification senders
/// 
/// OCP: New notification types can be added without modifying existing code
pub struct PluginRegistry {
    senders: RwLock<HashMap<String, SenderRef>>,
}

impl PluginRegistry {
    pub fn new() -> Self {
        Self {
            senders: RwLock::new(HashMap::new()),
        }
    }
    
    /// Register a new notification sender
    pub fn register(&self, sender: SenderRef) {
        let sender_type = sender.sender_type().to_string();
        self.senders.write().insert(sender_type, sender);
    }
    
    /// Get a sender by type
    pub fn get(&self, sender_type: &str) -> Option<SenderRef> {
        self.senders.read().get(sender_type).cloned()
    }
    
    /// Send notification through a specific sender
    pub async fn send(&self, sender_type: &str, title: &str, content: &str) -> Result<SendResult, String> {
        // Clone the sender before the await to avoid holding the lock
        let sender = {
            let read_guard = self.senders.read();
            read_guard.get(sender_type)
                .cloned()
                .ok_or_else(|| format!("Unknown sender type: {}", sender_type))?
        };
        
        sender.send(title, content).await
    }

    
    /// List all registered sender types
    pub fn list_types(&self) -> Vec<String> {
        self.senders.read().keys().cloned().collect()
    }
}

impl Default for PluginRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Global registry with all senders registered
pub static GLOBAL_REGISTRY: Lazy<PluginRegistry> = Lazy::new(|| {
    let registry = PluginRegistry::new();
    
    // Register default senders (with empty config)
    // In real usage, users will provide their own config
    if let Ok(feishu) = FeishuSender::new("{}") {
        registry.register(Arc::new(feishu));
    }
    if let Ok(dingtalk) = DingTalkSender::new("{}") {
        registry.register(Arc::new(dingtalk));
    }
    if let Ok(webhook) = WebhookSender::new("{}") {
        registry.register(Arc::new(webhook));
    }
    if let Ok(email) = EmailSender::new("{}") {
        registry.register(Arc::new(email));
    }
    
    registry
});
