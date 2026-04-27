//! Unit tests for notification_plugins module

/// Test SendResult serialization and deserialization
mod send_result_tests {
    use crate::commands::notification_plugins::SendResult;

    #[test]
    fn test_send_result_serialization() {
        let result = SendResult {
            success: true,
            message: "Test message".to_string(),
            external_id: Some("ext-123".to_string()),
        };

        let json = serde_json::to_string(&result).unwrap();
        let deserialized: SendResult = serde_json::from_str(&json).unwrap();

        assert_eq!(result.success, deserialized.success);
        assert_eq!(result.message, deserialized.message);
        assert_eq!(result.external_id, deserialized.external_id);
    }

    #[test]
    fn test_send_result_without_external_id() {
        let result = SendResult {
            success: false,
            message: "Failed to send".to_string(),
            external_id: None,
        };

        let json = serde_json::to_string(&result).unwrap();
        let deserialized: SendResult = serde_json::from_str(&json).unwrap();

        assert_eq!(result.success, deserialized.success);
        assert_eq!(result.message, deserialized.message);
        assert!(deserialized.external_id.is_none());
    }

    #[test]
    fn test_send_result_json_format() {
        let result = SendResult {
            success: true,
            message: "Test".to_string(),
            external_id: Some("id123".to_string()),
        };

        let json = serde_json::to_string(&result).unwrap();
        assert!(json.contains("\"success\":true"));
        assert!(json.contains("\"message\":\"Test\""));
        assert!(json.contains("\"external_id\":\"id123\""));
    }
}

/// Test PluginRegistry functionality
mod registry_tests {
    use crate::commands::notification_plugins::registry::GLOBAL_REGISTRY;
    use crate::commands::notification_plugins::PluginRegistry;
    use std::sync::Arc;

    #[test]
    fn test_registry_new() {
        let registry = PluginRegistry::new();
        let types = registry.list_types();
        assert!(types.is_empty());
    }

    #[test]
    fn test_registry_register_and_get() {
        use crate::commands::notification_plugins::feishu::FeishuSender;

        let registry = PluginRegistry::new();
        let sender = Arc::new(FeishuSender::new("{}").unwrap());
        registry.register(sender);

        assert!(registry.get("feishu").is_some());
        assert!(registry.get("unknown").is_none());
    }

    #[test]
    fn test_global_registry_has_default_senders() {
        // Global registry should have all default senders registered
        assert!(GLOBAL_REGISTRY.get("feishu").is_some());
        assert!(GLOBAL_REGISTRY.get("dingtalk").is_some());
        assert!(GLOBAL_REGISTRY.get("email").is_some());
        assert!(GLOBAL_REGISTRY.get("webhook").is_some());
        assert!(GLOBAL_REGISTRY.get("unknown").is_none());
    }

    #[test]
    fn test_registry_list_types() {
        let types = GLOBAL_REGISTRY.list_types();
        assert!(types.contains(&"feishu".to_string()));
        assert!(types.contains(&"dingtalk".to_string()));
        assert!(types.contains(&"email".to_string()));
        assert!(types.contains(&"webhook".to_string()));
    }

    // #[tokio::test] (ignored - needs tokio)
    async fn test_registry_send_unknown_type() {
        // Test that sending with unknown type returns error
        let result = GLOBAL_REGISTRY
            .send("unknown_type", "Test Title", "Test Content")
            .await;
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("Unknown sender type"));
    }
}

/// Test FeishuSender configuration validation
mod feishu_sender_tests {
    use crate::commands::notification_plugins::feishu::FeishuSender;
    use crate::commands::notification_plugins::r#trait::NotificationSender;

    #[test]
    fn test_feishu_new_valid_config() {
        let sender = FeishuSender::new("{}");
        assert!(sender.is_ok());
    }

    #[test]
    fn test_feishu_new_with_webhook_url() {
        let sender = FeishuSender::new(r#"{"webhook_url":"https://example.com"}"#);
        assert!(sender.is_ok());
        let sender = sender.unwrap();
        assert_eq!(sender.sender_type(), "feishu");
    }

    #[test]
    fn test_feishu_new_invalid_config() {
        let sender = FeishuSender::new("invalid json");
        assert!(sender.is_err());
    }

    #[test]
    fn test_feishu_validate_config_valid() {
        let sender = FeishuSender::new("{}").unwrap();
        let result = sender.validate_config(r#"{"webhook_url":"https://example.com"}"#);
        assert!(result.is_ok());
    }

    #[test]
    fn test_feishu_validate_config_invalid() {
        let sender = FeishuSender::new("{}").unwrap();
        let result = sender.validate_config("invalid");
        assert!(result.is_err());
    }
}

/// Test DingTalkSender configuration validation
mod dingtalk_sender_tests {
    use crate::commands::notification_plugins::dingtalk::DingTalkSender;
    use crate::commands::notification_plugins::r#trait::NotificationSender;

    #[test]
    fn test_dingtalk_new_valid_config() {
        let sender = DingTalkSender::new("{}");
        assert!(sender.is_ok());
    }

    #[test]
    fn test_dingtalk_new_with_webhook_url() {
        let sender = DingTalkSender::new(r#"{"webhook_url":"https://example.com"}"#);
        assert!(sender.is_ok());
        let sender = sender.unwrap();
        assert_eq!(sender.sender_type(), "dingtalk");
    }

    #[test]
    fn test_dingtalk_new_invalid_config() {
        let sender = DingTalkSender::new("invalid json");
        assert!(sender.is_err());
    }

    #[test]
    fn test_dingtalk_validate_config_valid() {
        let sender = DingTalkSender::new("{}").unwrap();
        let result = sender.validate_config(r#"{"webhook_url":"https://example.com"}"#);
        assert!(result.is_ok());
    }

    #[test]
    fn test_dingtalk_validate_config_invalid() {
        let sender = DingTalkSender::new("{}").unwrap();
        let result = sender.validate_config("invalid");
        assert!(result.is_err());
    }
}

/// Test EmailSender configuration validation
mod email_sender_tests {
    use crate::commands::notification_plugins::email::EmailSender;
    use crate::commands::notification_plugins::r#trait::NotificationSender;

    #[test]
    fn test_email_new_valid_config() {
        let sender = EmailSender::new("{}");
        assert!(sender.is_ok());
    }

    #[test]
    fn test_email_new_with_config() {
        let sender = EmailSender::new(
            r#"{"smtp_host":"smtp.example.com","smtp_port":587,"to":["test@example.com"]}"#,
        );
        assert!(sender.is_ok());
        let sender = sender.unwrap();
        assert_eq!(sender.sender_type(), "email");
    }

    #[test]
    fn test_email_new_invalid_config() {
        let sender = EmailSender::new("invalid json");
        assert!(sender.is_err());
    }

    #[test]
    fn test_email_validate_config_valid() {
        let sender = EmailSender::new("{}").unwrap();
        let result = sender.validate_config(
            r#"{"smtp_host":"smtp.example.com","smtp_port":587,"to":["test@example.com"]}"#,
        );
        assert!(result.is_ok());
    }

    #[test]
    fn test_email_validate_config_invalid() {
        let sender = EmailSender::new("{}").unwrap();
        let result = sender.validate_config("invalid");
        assert!(result.is_err());
    }
}

/// Test WebhookSender configuration validation
mod webhook_sender_tests {
    use crate::commands::notification_plugins::r#trait::NotificationSender;
    use crate::commands::notification_plugins::webhook::WebhookSender;

    #[test]
    fn test_webhook_new_valid_config() {
        let sender = WebhookSender::new("{}");
        assert!(sender.is_ok());
    }

    #[test]
    fn test_webhook_new_with_url() {
        let sender = WebhookSender::new(r#"{"url":"https://example.com/webhook"}"#);
        assert!(sender.is_ok());
        let sender = sender.unwrap();
        assert_eq!(sender.sender_type(), "webhook");
    }

    #[test]
    fn test_webhook_new_invalid_config() {
        let sender = WebhookSender::new("invalid json");
        assert!(sender.is_err());
    }

    #[test]
    fn test_webhook_validate_config_valid() {
        let sender = WebhookSender::new("{}").unwrap();
        let result = sender.validate_config(r#"{"url":"https://example.com/webhook"}"#);
        assert!(result.is_ok());
    }

    #[test]
    fn test_webhook_validate_config_invalid() {
        let sender = WebhookSender::new("{}").unwrap();
        let result = sender.validate_config("invalid");
        assert!(result.is_err());
    }
}

/// Test NotificationPlugin struct
mod notification_plugin_tests {
    use crate::commands::notification_plugins::NotificationPlugin;

    #[test]
    fn test_notification_plugin_create() {
        let plugin = NotificationPlugin {
            id: "test-id".to_string(),
            name: "Test Plugin".to_string(),
            plugin_type: "feishu".to_string(),
            enabled: true,
            config: "{}".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        assert_eq!(plugin.id, "test-id");
        assert_eq!(plugin.name, "Test Plugin");
        assert_eq!(plugin.plugin_type, "feishu");
        assert!(plugin.enabled);
    }

    #[test]
    fn test_notification_plugin_serialization() {
        let plugin = NotificationPlugin {
            id: "test-id".to_string(),
            name: "Test Plugin".to_string(),
            plugin_type: "feishu".to_string(),
            enabled: true,
            config: "{}".to_string(),
            created_at: "2024-01-01T00:00:00Z".to_string(),
            updated_at: "2024-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&plugin).unwrap();
        let deserialized: NotificationPlugin = serde_json::from_str(&json).unwrap();

        assert_eq!(plugin.id, deserialized.id);
        assert_eq!(plugin.name, deserialized.name);
    }
}

/// Test get_supported_plugin_types command
mod command_tests {
    use crate::commands::notification_plugins::get_supported_plugin_types;

    #[test]
    fn test_get_supported_plugin_types() {
        let types = get_supported_plugin_types();
        assert!(types.contains(&"feishu".to_string()));
        assert!(types.contains(&"dingtalk".to_string()));
        assert!(types.contains(&"email".to_string()));
        assert!(types.contains(&"webhook".to_string()));
    }
}
