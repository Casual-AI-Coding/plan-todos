//! Plugin Registry
//! 
//! Central registry for managing notification plugins using OCP pattern.

use std::collections::HashMap;
use super::trait::{NotificationSender, SendResult};

/// Plugin Registry - manages all notification senders
/// 
/// OCP: New notification types can be added without modifying existing code
pub struct PluginRegistry {
    senders: HashMap<String, Box<dyn NotificationSender>>,
}

impl PluginRegistry {
    pub fn new() -> Self {
        Self {
            senders: HashMap::new(),
        }
    }
    
    /// Register a new notification sender
    pub fn register(&mut self, sender: Box<dyn NotificationSender>) {
        let sender_type = sender.sender_type().to_string();
        self.senders.insert(sender_type, sender);
    }
    
    /// Get a sender by type
    pub fn get(&self, sender_type: &str) -> Option<&Box<dyn NotificationSender>> {
        self.senders.get(sender_type)
    }
    
    /// Send notification through a specific sender
    pub fn send(&self, sender_type: &str, title: &str, content: &str) -> Result<SendResult, String> {
        let sender = self.senders.get(sender_type)
            .ok_or_else(|| format!("Unknown sender type: {}", sender_type))?;
        
        sender.send(title, content)
    }
    
    /// List all registered sender types
    pub fn list_types(&self) -> Vec<String> {
        self.senders.keys().cloned().collect()
    }
}

impl Default for PluginRegistry {
    fn default() -> Self {
        Self::new()
    }
}
