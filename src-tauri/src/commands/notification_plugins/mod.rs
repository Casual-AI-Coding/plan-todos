//! Notification Plugins Module
//! 
//! This module implements the OCP-compliant plugin system using Trait + Registry pattern.

mod trait;
mod registry;
mod feishu;
mod dingtalk;
mod email;
mod webhook;

pub use trait::{NotificationSender, SendResult};
pub use registry::PluginRegistry;
