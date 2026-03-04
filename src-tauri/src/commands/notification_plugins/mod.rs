//! Notification Plugins Module
//! 
//! This module implements the OCP-compliant plugin system using Trait + Registry pattern.

mod r#trait;
mod registry;
mod feishu;
mod dingtalk;
mod email;
mod webhook;

pub use r#trait::{NotificationSender, SendResult};
pub use registry::{PluginRegistry, GLOBAL_REGISTRY, SenderRef};
