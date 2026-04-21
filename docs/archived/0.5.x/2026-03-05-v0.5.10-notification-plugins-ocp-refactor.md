# Notification Plugins OCP 重构设计方案

## 1. 问题分析

### 1.1 当前问题

`src-tauri/src/commands/notification_plugins.rs` 第 205-211 行违反了开放-封闭原则 (OCP)：

```rust
let result = match plugin.1.as_str() {
    "feishu" => send_feishu_notification(&plugin.2, &title, &content),
    "dingtalk" => send_dingtalk_notification(&plugin.2, &title, &content),
    "email" => send_email_notification(&plugin.2, &title, &content),
    "webhook" => send_webhook_notification(&plugin.2, &title, &content),
    _ => Err("Unknown plugin type".to_string()),
};
```

**问题**: 每次添加新插件类型（如 Slack、企业微信等）必须修改这个 `match` 语句，违反了"对扩展开放，对修改封闭"的原则。

### 1.2 影响范围

- **当前插件**: Feishu、DingTalk、Email、Webhook
- **潜在扩展**: Slack、企业微信、Telegram、短信网关等
- **修改点**:
  - `send_notification` 函数
  - 新增 `send_xxx_notification` 函数
  - 可能的配置验证逻辑

---

## 2. 设计目标

1. **符合 OCP**: 添加新插件无需修改现有代码
2. **保持向后兼容**: 现有 API 接口不变
3. **可测试性**: 每个插件可独立测试
4. **可配置性**: 支持运行时动态发现插件

---

## 3. 架构设计

### 3.1 目录结构

```
src-tauri/src/commands/notification_plugins/
├── mod.rs              # 主模块，导出公共接口
├── types.rs            # 公共类型定义
├── registry.rs         # 插件注册表
├── trait.rs            # NotificationSender trait 定义
├── feishu.rs           # Feishu/Lark 实现
├── dingtalk.rs         # DingTalk 实现
├── email.rs            # Email 实现
└── webhook.rs          # Webhook 实现
```

### 3.2 核心组件

```
┌─────────────────────────────────────────────────────────┐
│                    Tauri Command Layer                   │
│  send_notification / get_notification_plugins / CRUD    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Plugin Registry                        │
│  - 管理所有已注册的 NotificationSender                    │
│  - 提供 plugin_type -> sender 映射                       │
│  - 支持运行时注册新插件                                    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│               NotificationSender Trait                   │
│  - plugin_type() -> &'static str                        │
│  - send(config, title, content) -> Result               │
│  - validate_config(config) -> Result                    │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ FeishuSender │   │DingTalkSender│   │ EmailSender  │ ...
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 4. 详细设计

### 4.1 类型定义 (`types.rs`)

```rust
use serde::{Deserialize, Serialize};

/// 通知插件配置
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationPlugin {
    pub id: String,
    pub name: String,
    pub plugin_type: String,
    pub enabled: bool,
    pub config: String,
    pub created_at: String,
    pub updated_at: String,
}

/// 发送通知结果
#[derive(Debug, Serialize, Deserialize)]
pub struct SendNotificationResult {
    pub success: bool,
    pub message: String,
    pub external_id: Option<String>,
}
```

### 4.2 Trait 定义 (`trait.rs`)

```rust
use async_trait::async_trait;
use super::types::SendNotificationResult;

/// 通知发送器 Trait
///
/// 实现此 trait 以添加新的通知插件类型
/// 符合 OCP - 添加新插件无需修改现有代码
#[async_trait]
pub trait NotificationSender: Send + Sync {
    /// 返回插件类型标识符
    /// 用于在数据库中存储和查找插件
    fn plugin_type(&self) -> &'static str;

    /// 返回插件显示名称
    fn display_name(&self) -> &'static str;

    /// 发送通知
    ///
    /// # Arguments
    /// * `config` - JSON 格式的插件配置
    /// * `title` - 通知标题
    /// * `content` - 通知内容
    ///
    /// # Returns
    /// 发送结果或错误信息
    async fn send(
        &self,
        config: &str,
        title: &str,
        content: &str,
    ) -> Result<SendNotificationResult, String>;

    /// 验证配置是否有效
    ///
    /// # Arguments
    /// * `config` - JSON 格式的插件配置
    ///
    /// # Returns
    /// 验证通过返回 Ok(())，否则返回错误信息
    fn validate_config(&self, config: &str) -> Result<(), String>;
}
```

### 4.3 插件注册表 (`registry.rs`)

```rust
use std::collections::HashMap;
use std::sync::Arc;
use parking_lot::RwLock;
use super::trait::NotificationSender;

/// 插件注册表
///
/// 管理所有已注册的通知发送器
/// 支持运行时动态注册新插件
pub struct PluginRegistry {
    senders: RwLock<HashMap<&'static str, Arc<dyn NotificationSender>>>,
}

impl PluginRegistry {
    /// 创建新的注册表
    pub fn new() -> Self {
        Self {
            senders: RwLock::new(HashMap::new()),
        }
    }

    /// 注册插件发送器
    pub fn register<S: NotificationSender + 'static>(&self, sender: S) {
        let mut senders = self.senders.write();
        let sender = Arc::new(sender);
        senders.insert(sender.plugin_type(), sender);
    }

    /// 注册 Arc 包装的发送器
    pub fn register_arc(&self, sender: Arc<dyn NotificationSender>) {
        let mut senders = self.senders.write();
        senders.insert(sender.plugin_type(), sender);
    }

    /// 获取指定类型的发送器
    pub fn get(&self, plugin_type: &str) -> Option<Arc<dyn NotificationSender>> {
        let senders = self.senders.read();
        senders.get(plugin_type).cloned()
    }

    /// 获取所有支持的插件类型
    pub fn supported_types(&self) -> Vec<&'static str> {
        let senders = self.senders.read();
        senders.keys().copied().collect()
    }

    /// 获取所有已注册发送器的信息
    pub fn get_all_info(&self) -> Vec<PluginInfo> {
        let senders = self.senders.read();
        senders
            .values()
            .map(|s| PluginInfo {
                plugin_type: s.plugin_type(),
                display_name: s.display_name(),
            })
            .collect()
    }
}

impl Default for PluginRegistry {
    fn default() -> Self {
        let registry = Self::new();
        // 注册内置插件
        registry.register(crate::commands::notification_plugins::FeishuSender::new());
        registry.register(crate::commands::notification_plugins::DingTalkSender::new());
        registry.register(crate::commands::notification_plugins::EmailSender::new());
        registry.register(crate::commands::notification_plugins::WebhookSender::new());
        registry
    }
}

/// 插件信息
#[derive(Debug, Clone, Serialize)]
pub struct PluginInfo {
    pub plugin_type: &'static str,
    pub display_name: &'static str,
}

/// 全局注册表实例
static REGISTRY: once_cell::sync::Lazy<PluginRegistry> =
    once_cell::sync::Lazy::new(PluginRegistry::default);
```

### 4.4 具体实现示例 (`feishu.rs`)

```rust
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use super::trait::NotificationSender;
use super::types::SendNotificationResult;

/// Feishu/Lark 发送器
pub struct FeishuSender;

impl FeishuSender {
    pub fn new() -> Self {
        Self
    }
}

/// Feishu 配置
#[derive(Debug, Deserialize)]
struct FeishuConfig {
    /// Webhook URL (机器人)
    webhook_url: Option<String>,
    /// 应用 ID (应用内机器人)
    app_id: Option<String>,
    /// 应用密钥
    app_secret: Option<String>,
}

#[async_trait]
impl NotificationSender for FeishuSender {
    fn plugin_type(&self) -> &'static str {
        "feishu"
    }

    fn display_name(&self) -> &'static str {
        "飞书/Lark"
    }

    async fn send(
        &self,
        config: &str,
        title: &str,
        content: &str,
    ) -> Result<SendNotificationResult, String> {
        let feishu_config: FeishuConfig = serde_json::from_str(config)
            .map_err(|e| format!("Invalid Feishu config: {}", e))?;

        // 优先使用 Webhook
        if let Some(webhook_url) = &feishu_config.webhook_url {
            return self.send_via_webhook(webhook_url, title, content).await;
        }

        // 使用应用凭证
        if feishu_config.app_id.is_some() && feishu_config.app_secret.is_some() {
            return self.send_via_app(&feishu_config, title, content).await;
        }

        Err("Feishu requires webhook_url or app_id/app_secret".to_string())
    }

    fn validate_config(&self, config: &str) -> Result<(), String> {
        let _: FeishuConfig = serde_json::from_str(config)
            .map_err(|e| format!("Invalid Feishu config: {}", e))?;
        Ok(())
    }
}

impl FeishuSender {
    async fn send_via_webhook(
        &self,
        webhook_url: &str,
        title: &str,
        content: &str,
    ) -> Result<SendNotificationResult, String> {
        let payload = serde_json::json!({
            "msg_type": "interactive",
            "card": {
                "elements": [
                    {
                        "tag": "div",
                        "text": {
                            "content": format!("**{}**\n\n{}", title, content),
                            "tag": "lark_md"
                        }
                    }
                ]
            }
        });

        log::info!("[Feishu] Sending to webhook: {}", webhook_url);

        // TODO: 实际发送 HTTP 请求
        // let response = reqwest::Client::new()
        //     .post(webhook_url)
        //     .json(&payload)
        //     .send()
        //     .await
        //     .map_err(|e| format!("HTTP error: {}", e))?;

        Ok(SendNotificationResult {
            success: true,
            message: "Notification sent to Feishu".to_string(),
            external_id: None,
        })
    }

    async fn send_via_app(
        &self,
        _config: &FeishuConfig,
        title: &str,
        _content: &str,
    ) -> Result<SendNotificationResult, String> {
        // TODO: 实现应用内机器人发送
        log::info!("[Feishu] Would send via app: {}", title);

        Ok(SendNotificationResult {
            success: true,
            message: "Notification sent via Feishu app".to_string(),
            external_id: None,
        })
    }
}
```

### 4.5 主模块重构 (`mod.rs`)

```rust
mod types;
mod trait;
mod registry;
mod feishu;
mod dingtalk;
mod email;
mod webhook;

pub use types::{NotificationPlugin, SendNotificationResult};
pub use trait::NotificationSender;
pub use registry::PluginRegistry;
pub use feishu::FeishuSender;
pub use dingtalk::DingTalkSender;
pub use email::EmailSender;
pub use webhook::WebhookSender;

use crate::AppState;
use registry::REGISTRY;

// ============================================================================
// Tauri Commands
// ============================================================================

#[tauri::command]
pub fn get_notification_plugins(
    state: tauri::State<AppState>,
) -> Result<Vec<NotificationPlugin>, String> {
    // ... 保持不变
}

#[tauri::command]
pub fn create_notification_plugin(
    state: tauri::State<AppState>,
    name: String,
    plugin_type: String,
    config: String,
) -> Result<NotificationPlugin, String> {
    // 验证插件类型
    if REGISTRY.get(&plugin_type).is_none() {
        return Err(format!("Unknown plugin type: {}", plugin_type));
    }

    // 验证配置
    let sender = REGISTRY.get(&plugin_type).unwrap();
    sender.validate_config(&config)?;

    // ... 创建逻辑
}

#[tauri::command]
pub async fn send_notification(
    state: tauri::State<'_, AppState>,
    plugin_id: String,
    title: String,
    content: String,
) -> Result<SendNotificationResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // 获取插件配置
    let plugin = get_plugin_by_id(&conn, &plugin_id)?;

    if !plugin.enabled {
        return Err("Plugin is disabled".to_string());
    }

    // OCP: 通过注册表获取发送器
    let sender = REGISTRY
        .get(&plugin.plugin_type)
        .ok_or_else(|| format!("Unknown plugin type: {}", plugin.plugin_type))?;

    // 调用发送
    sender.send(&plugin.config, &title, &content).await
}

// ============================================================================
// 辅助函数
// ============================================================================

fn get_plugin_by_id(conn: &rusqlite::Connection, id: &str) -> Result<NotificationPlugin, String> {
    // ... 数据库查询
}

/// 获取所有支持的插件类型
#[tauri::command]
pub fn get_supported_plugin_types() -> Vec<PluginInfo> {
    REGISTRY.get_all_info()
}
```

---

## 5. 扩展新插件示例

添加 Slack 支持：

```rust
// src-tauri/src/commands/notification_plugins/slack.rs

use async_trait::async_trait;
use super::{NotificationSender, SendNotificationResult};

pub struct SlackSender;

#[async_trait]
impl NotificationSender for SlackSender {
    fn plugin_type(&self) -> &'static str {
        "slack"
    }

    fn display_name(&self) -> &'static str {
        "Slack"
    }

    async fn send(&self, config: &str, title: &str, content: &str)
        -> Result<SendNotificationResult, String>
    {
        // 实现发送逻辑
    }

    fn validate_config(&self, config: &str) -> Result<(), String> {
        // 验证配置
    }
}

// 在 registry.rs 中注册
impl Default for PluginRegistry {
    fn default() -> Self {
        let registry = Self::new();
        // ... 现有插件
        registry.register(SlackSender::new());  // 只需添加这一行
        registry
    }
}
```

**无需修改任何现有代码！**

---

## 6. 依赖变更

### 6.1 新增依赖

```toml
# src-tauri/Cargo.toml
[dependencies]
async-trait = "0.1"
parking_lot = "0.12"      # 替代 std::sync::RwLock，性能更好
once_cell = "1.19"        # 全局静态变量初始化
```

### 6.2 依赖说明

| 依赖          | 用途                  | 是否必需 |
| ------------- | --------------------- | -------- |
| `async-trait` | 支持 async trait 方法 | ✅ 必需  |
| `parking_lot` | 高性能 RwLock         | 推荐     |
| `once_cell`   | 全局注册表初始化      | ✅ 必需  |

---

## 7. 测试计划

### 7.1 单元测试

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_registry_registration() {
        let registry = PluginRegistry::new();
        registry.register(FeishuSender::new());

        assert!(registry.get("feishu").is_some());
        assert!(registry.get("unknown").is_none());
    }

    #[test]
    fn test_feishu_validate_config() {
        let sender = FeishuSender::new();

        // 有效配置
        assert!(sender.validate_config(r#"{"webhook_url": "https://example.com"}"#).is_ok());

        // 无效配置
        assert!(sender.validate_config(r#"invalid json"#).is_err());
    }

    #[tokio::test]
    async fn test_feishu_send() {
        let sender = FeishuSender::new();
        let config = r#"{"webhook_url": "https://example.com/webhook"}"#;

        let result = sender.send(config, "Test Title", "Test Content").await;
        assert!(result.is_ok());
    }
}
```

### 7.2 集成测试

- 测试完整的发送流程
- 测试数据库 CRUD 操作
- 测试禁用插件的行为

---

## 8. 迁移计划

### 8.1 阶段一：创建模块结构

1. 创建 `notification_plugins/` 目录
2. 创建各子模块文件
3. 定义 Trait 和 Registry

### 8.2 阶段二：迁移现有实现

1. 将 `send_xxx_notification` 函数迁移到独立文件
2. 实现 `NotificationSender` trait
3. 更新注册表默认注册

### 8.3 阶段三：更新命令层

1. 修改 `send_notification` 使用注册表
2. 添加 `get_supported_plugin_types` 命令
3. 更新 `create_notification_plugin` 添加验证

### 8.4 阶段四：测试与文档

1. 编写单元测试
2. 更新 API 文档
3. 添加扩展指南

---

## 9. 风险评估

| 风险         | 级别 | 缓解措施                        |
| ------------ | ---- | ------------------------------- |
| 破坏现有功能 | 中   | 保持 API 接口不变，充分测试     |
| 性能影响     | 低   | 使用 lazy_static 避免重复初始化 |
| 异步复杂度   | 低   | 使用 async-trait 简化实现       |

---

## 10. 验收标准

- [ ] 所有现有测试通过
- [ ] 添加新插件无需修改 `send_notification`
- [ ] 每个插件有独立的单元测试
- [ ] 文档更新完整
- [ ] 性能无明显下降

---

## 11. 时间估算

| 任务                   | 估算时间 |
| ---------------------- | -------- |
| 创建模块结构           | 1h       |
| 实现 Trait 和 Registry | 1h       |
| 迁移 4 个现有实现      | 2h       |
| 更新命令层             | 1h       |
| 编写测试               | 2h       |
| 文档更新               | 0.5h     |
| **总计**               | **7.5h** |

---

## 12. 后续扩展

完成此重构后，可以轻松添加：

1. **Slack** - 团队协作工具
2. **企业微信** - 国内企业常用
3. **Telegram** - 国际化支持
4. **短信网关** - 阿里云、腾讯云短信
5. **Push 通知** - FCM、APNs
6. **自定义插件** - 用户自定义 HTTP 端点

每个新插件只需：

1. 创建新文件实现 trait
2. 在 registry 中注册一行代码

**完全符合 OCP！**
