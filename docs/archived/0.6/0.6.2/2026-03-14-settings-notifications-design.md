# Settings Notifications 页面详细设计文档

> 创建日期: 2026-03-14
> 版本: v0.6.2
> 状态: 设计阶段

---

## 1. 概述

### 1.1 目标

实现 Settings > Notifications 页面，提供完整的全局通知配置功能，包括：

- 全局通知开关控制
- 默认提醒时间设置
- 按实体类型（Todo/Plan/Target）的默认策略
- 免打扰时段配置
- 通知渠道优先级排序
- 通知历史保留策略

### 1.2 设计原则

- **整体保存**: 所有配置在一个页面，统一保存
- **即时反馈**: 开关切换即时生效，复杂配置需点击保存
- **智能默认**: 新用户开箱即用，无需复杂配置
- **层次分明**: 全局 → 实体类型 → 单个实体 三级配置继承

---

## 2. 页面布局详解

### 2.1 整体结构

```
┌─────────────────────────────────────────────────────────────┐
│  设置 > 通知 > 全局通知设置                                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Card 1: 全局开关 ─────────────────────────────────────┐ │
│  │ [开关] 启用通知通知                                      │ │
│  │    └─ 关闭时显示提示：通知已禁用，您将不再收到任何提醒      │ │
│  │ [开关] 桌面通知 (系统托盘通知)                            │ │
│  │ [开关] 声音提醒                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Card 2: 默认提醒时间 ──────────────────────────────────┐ │
│  │ 为新创建的 Todo/Plan/Target 设置默认提醒时间              │ │
│  │                                                          │ │
│  │  [5分钟] [15分钟] [30分钟] [1小时] [1天] [自定义...]      │ │
│  │                                                          │ │
│  │  已选择: 5分钟、30分钟、1小时                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Card 3: 实体类型默认配置 ──────────────────────────────┐ │
│  │ ┌─ Todo 提醒设置 ──────────────────────────────────────┐ │ │
│  │ │ [开关] 为新的 Todo 启用提醒                            │ │ │
│  │ │ [复选框] 使用全局默认提醒时间                          │ │ │
│  │ │      └─ 未勾选时显示: [5分钟] [15分钟] [自定义...]    │ │ │
│  │ └──────────────────────────────────────────────────────┘ │ │
│  │ ┌─ Plan 提醒设置 ──────────────────────────────────────┐ │ │
│  │ │ [开关] 为新的 Plan 启用提醒                            │ │ │
│  │ │ [复选框] 使用全局默认提醒时间                          │ │ │
│  │ │      └─ 未勾选时显示: [5分钟] [15分钟] [自定义...]    │ │ │
│  │ └──────────────────────────────────────────────────────┘ │ │
│  │ ┌─ Target 提醒设置 ────────────────────────────────────┐ │ │
│  │ │ [开关] 为新的 Target 启用提醒                          │ │ │
│  │ │ [复选框] 使用全局默认提醒时间                          │ │ │
│  │ │      └─ 未勾选时显示: [5分钟] [15分钟] [自定义...]    │ │ │
│  │ └──────────────────────────────────────────────────────┘ │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Card 4: 免打扰时段 ───────────────────────────────────┐ │
│  │ [开关] 启用免打扰模式                                      │ │
│  │                                                            │ │
│  │  在以下时段内将不会发送任何通知：                           │ │
│  │                                                            │ │
│  │  [时间选择] 开始时间: 22:00  ────────  [时间选择] 结束: 08:00│ │
│  │                                                            │ │
│  │  重复: (○) 每天  (○) 工作日  (●) 自定义                     │ │
│  │                                                            │ │
│  │  [复选框] 周一  [复选框] 周二  [复选框] 周三  [复选框] 周四  │ │
│  │  [复选框] 周五  [复选框] 周六  [复选框] 周日                  │ │
│  │                                                            │ │
│  │  提示: 跨天时段已自动处理 (22:00-08:00 视为当天22:00到次日08:00)│ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Card 5: 通知渠道优先级 ───────────────────────────────┐ │
│  │ 拖拽调整发送顺序，优先级高的渠道将优先尝试发送              │ │
│  │                                                          │ │
│  │  ┌─────────────────────────────────────────────────────┐ │ │
│  │  │ 1. 🔔 飞书工作通知 (按住拖拽调整顺序)                  │ │ │
│  │  │ 2. 💬 钉钉机器人                                       │ │ │
│  │  │ 3. 📧 企业邮件                                         │ │ │
│  │  │ 4. 🔗 Webhook 通用接口                                 │ │ │
│  │  └─────────────────────────────────────────────────────┘ │ │
│  │                                                          │ │
│  │  [配置通知渠道] → 跳转至 /settings/channels              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Card 6: 高级设置 ─────────────────────────────────────┐ │
│  │                                                          │ │
│  │  通知历史保留时间                                         │ │
│  │  [滑块] 30 天  ◀════════════════════════════▶  365 天    │ │
│  │  超过此时间的通知历史将被自动清理以节省存储空间            │ │
│  │                                                          │ │
│  │  ─────────────────────────────────────────────────────  │ │
│  │                                                          │ │
│  │  [按钮: 立即清理历史]  [按钮: 导出历史]                   │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                              │
│                    [  保存所有设置  ]                          │
│                    (显示上次保存时间: 2026-03-14 10:30)        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型设计

### 3.1 TypeScript 类型定义

```typescript
// src/lib/types/notifications.ts

/**
 * GlobalNotificationSettings - 全局通知设置
 * 存储在数据库中的完整配置
 */
export interface GlobalNotificationSettings {
  id: string;

  // 全局开关
  enabled: boolean; // 总开关
  desktop_notifications: boolean; // 桌面通知
  sound_enabled: boolean; // 声音提醒

  // 默认提醒时间 (分钟数组)
  default_reminder_times: number[]; // 如 [5, 30, 60]

  // 免打扰设置
  do_not_disturb: {
    enabled: boolean;
    start_time: string; // "HH:MM" 格式, 如 "22:00"
    end_time: string; // "HH:MM" 格式, 如 "08:00"
    repeat: DoNotDisturbRepeat;
    custom_days?: number[]; // 0=周日, 1=周一, ... 6=周六
  };

  // 实体类型默认配置
  entity_defaults: {
    todo: EntityNotificationDefaults;
    plan: EntityNotificationDefaults;
    target: EntityNotificationDefaults;
  };

  // 渠道优先级 (plugin ID 数组)
  channel_priority: string[];

  // 历史保留天数
  history_retention_days: number;

  created_at: string;
  updated_at: string;
}

/**
 * 免打扰重复模式
 */
export type DoNotDisturbRepeat =
  | "daily" // 每天
  | "weekdays" // 工作日 (周一到周五)
  | "weekends" // 周末 (周六周日)
  | "custom"; // 自定义

/**
 * 实体类型默认通知配置
 */
export interface EntityNotificationDefaults {
  enabled: boolean; // 是否为新实体启用提醒
  use_global_default: boolean; // 是否使用全局默认时间
  custom_reminder_times?: number[]; // 自定义提醒时间 (use_global_default=false 时使用)
}

/**
 * 提醒时间预设选项
 */
export const REMINDER_TIME_OPTIONS = [
  { value: 5, label: "5分钟", description: "截止前5分钟" },
  { value: 15, label: "15分钟", description: "截止前15分钟" },
  { value: 30, label: "30分钟", description: "截止前30分钟" },
  { value: 60, label: "1小时", description: "截止前1小时" },
  { value: 1440, label: "1天", description: "截止前1天" },
];

/**
 * 页面表单状态 (用于前端表单)
 */
export interface NotificationSettingsFormState {
  enabled: boolean;
  desktop_notifications: boolean;
  sound_enabled: boolean;
  default_reminder_times: number[];
  do_not_disturb: {
    enabled: boolean;
    start_time: string;
    end_time: string;
    repeat: DoNotDisturbRepeat;
    custom_days: number[];
  };
  entity_defaults: {
    todo: EntityNotificationFormDefaults;
    plan: EntityNotificationFormDefaults;
    target: EntityNotificationFormDefaults;
  };
  channel_priority: string[];
  history_retention_days: number;
}

export interface EntityNotificationFormDefaults {
  enabled: boolean;
  use_global_default: boolean;
  custom_reminder_times: number[];
}
```

### 3.2 Rust 数据结构

```rust
// src-tauri/src/models/notification.rs

use serde::{Deserialize, Serialize};
use sqlx::FromRow;

/// 全局通知设置
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct GlobalNotificationSettings {
    pub id: String,
    pub enabled: bool,
    pub desktop_notifications: bool,
    pub sound_enabled: bool,
    pub default_reminder_times: String, // JSON 数组存储
    pub do_not_disturb_enabled: bool,
    pub do_not_disturb_start_time: String, // "HH:MM"
    pub do_not_disturb_end_time: String,   // "HH:MM"
    pub do_not_disturb_repeat: String,     // "daily" | "weekdays" | "weekends" | "custom"
    pub do_not_disturb_custom_days: Option<String>, // JSON 数组 [0,1,2,3,4,5,6]
    pub entity_defaults: String,           // JSON 对象
    pub channel_priority: String,          // JSON 数组
    pub history_retention_days: i32,
    pub created_at: String,
    pub updated_at: String,
}

/// 免打扰设置 (嵌套结构)
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DoNotDisturbSettings {
    pub enabled: bool,
    pub start_time: String,
    pub end_time: String,
    pub repeat: DoNotDisturbRepeat,
    pub custom_days: Option<Vec<i32>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DoNotDisturbRepeat {
    Daily,
    Weekdays,
    Weekends,
    Custom,
}

/// 实体类型默认配置
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityDefaultsConfig {
    pub todo: EntityDefaultSettings,
    pub plan: EntityDefaultSettings,
    pub target: EntityDefaultSettings,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityDefaultSettings {
    pub enabled: bool,
    pub use_global_default: bool,
    pub custom_reminder_times: Option<Vec<i32>>,
}

/// API 请求/响应结构
#[derive(Debug, Clone, Deserialize)]
pub struct UpdateGlobalNotificationSettingsRequest {
    pub enabled: bool,
    pub desktop_notifications: bool,
    pub sound_enabled: bool,
    pub default_reminder_times: Vec<i32>,
    pub do_not_disturb: DoNotDisturbSettings,
    pub entity_defaults: EntityDefaultsConfig,
    pub channel_priority: Vec<String>,
    pub history_retention_days: i32,
}
```

### 3.3 数据库表结构

```sql
-- 全局通知设置表
CREATE TABLE global_notification_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    enabled BOOLEAN NOT NULL DEFAULT true,
    desktop_notifications BOOLEAN NOT NULL DEFAULT true,
    sound_enabled BOOLEAN NOT NULL DEFAULT false,
    default_reminder_times TEXT NOT NULL DEFAULT '[5, 30, 60]',
    do_not_disturb_enabled BOOLEAN NOT NULL DEFAULT false,
    do_not_disturb_start_time TEXT NOT NULL DEFAULT '22:00',
    do_not_disturb_end_time TEXT NOT NULL DEFAULT '08:00',
    do_not_disturb_repeat TEXT NOT NULL DEFAULT 'daily',
    do_not_disturb_custom_days TEXT,
    entity_defaults TEXT NOT NULL DEFAULT '{
        "todo": {"enabled": true, "use_global_default": true},
        "plan": {"enabled": true, "use_global_default": true},
        "target": {"enabled": true, "use_global_default": true}
    }',
    channel_priority TEXT NOT NULL DEFAULT '[]',
    history_retention_days INTEGER NOT NULL DEFAULT 30,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 插入默认记录
INSERT INTO global_notification_settings (id) VALUES ('global');

-- 索引
CREATE INDEX idx_global_settings_updated ON global_notification_settings(updated_at);
```

---

## 4. API 设计

### 4.1 获取全局通知设置

```rust
#[tauri::command]
pub async fn get_global_notification_settings(
    state: State<'_, AppState>,
) -> Result<GlobalNotificationSettingsResponse, String> {
    // 如果不存在则创建默认设置
    // 返回完整设置 + 可用渠道列表
}
```

**响应结构:**

```json
{
  "settings": {
    "id": "global",
    "enabled": true,
    "desktop_notifications": true,
    "sound_enabled": false,
    "default_reminder_times": [5, 30, 60],
    "do_not_disturb": {
      "enabled": false,
      "start_time": "22:00",
      "end_time": "08:00",
      "repeat": "daily",
      "custom_days": null
    },
    "entity_defaults": {
      "todo": {
        "enabled": true,
        "use_global_default": true,
        "custom_reminder_times": null
      },
      "plan": {
        "enabled": true,
        "use_global_default": true,
        "custom_reminder_times": null
      },
      "target": {
        "enabled": true,
        "use_global_default": true,
        "custom_reminder_times": null
      }
    },
    "channel_priority": ["plugin_1", "plugin_2"],
    "history_retention_days": 30,
    "created_at": "2026-03-14T10:00:00Z",
    "updated_at": "2026-03-14T10:00:00Z"
  },
  "available_channels": [
    { "id": "plugin_1", "name": "飞书", "type": "feishu", "enabled": true },
    { "id": "plugin_2", "name": "钉钉", "type": "dingtalk", "enabled": true }
  ]
}
```

### 4.2 更新全局通知设置

```rust
#[tauri::command]
pub async fn update_global_notification_settings(
    state: State<'_, AppState>,
    request: UpdateGlobalNotificationSettingsRequest,
) -> Result<GlobalNotificationSettingsResponse, String> {
    // 验证数据有效性
    // 检查渠道优先级中的 ID 是否有效
    // 更新数据库
    // 返回更新后的设置
}
```

### 4.3 清理通知历史

```rust
#[tauri::command]
pub async fn cleanup_notification_history(
    state: State<'_, AppState>,
    retention_days: i32,
) -> Result<CleanupResult, String> {
    // 删除超过 retention_days 的历史记录
    // 返回清理的数量
}
```

**响应:**

```json
{
  "deleted_count": 156,
  "remaining_count": 42
}
```

---

## 5. 前端组件设计

### 5.1 组件清单

| 组件                      | 文件路径                                            | 职责                   |
| ------------------------- | --------------------------------------------------- | ---------------------- |
| SettingsNotificationsView | `src/app/views/SettingsNotificationsView.tsx`       | 页面容器，整体状态管理 |
| GlobalTogglesSection      | `src/components/settings/GlobalTogglesSection.tsx`  | 全局开关组             |
| ReminderTimeSelector      | `src/components/settings/ReminderTimeSelector.tsx`  | 多选时间按钮组         |
| EntityDefaultsCard        | `src/components/settings/EntityDefaultsCard.tsx`    | 实体类型默认配置       |
| DoNotDisturbSection       | `src/components/settings/DoNotDisturbSection.tsx`   | 免打扰时段配置         |
| ChannelPrioritySorter     | `src/components/settings/ChannelPrioritySorter.tsx` | 拖拽排序渠道列表       |
| RetentionSettings         | `src/components/settings/RetentionSettings.tsx`     | 历史保留设置           |

### 5.2 SettingsNotificationsView Props

```typescript
interface SettingsNotificationsViewProps {
  // 无需 props，使用 React Query 获取数据
}

// 内部状态
interface ViewState {
  formData: NotificationSettingsFormState;
  availableChannels: NotificationPlugin[];
  isLoading: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  hasChanges: boolean;
  errors: Record<string, string>;
}
```

### 5.3 GlobalTogglesSection Props

```typescript
interface GlobalTogglesSectionProps {
  enabled: boolean;
  desktopNotifications: boolean;
  soundEnabled: boolean;
  onChange: (field: string, value: boolean) => void;
  disabled?: boolean;
}
```

### 5.4 ReminderTimeSelector Props

```typescript
interface ReminderTimeSelectorProps {
  selectedTimes: number[];
  onChange: (times: number[]) => void;
  disabled?: boolean;

  // 支持自定义时间输入
  allowCustomTime?: boolean;
  minTime?: number; // 最小分钟数
  maxTime?: number; // 最大分钟数 (如 10080 = 7天)
}

// 预设选项
const PRESET_TIMES = [
  { value: 5, label: "5分钟", icon: "⚡" },
  { value: 15, label: "15分钟", icon: "⏱️" },
  { value: 30, label: "30分钟", icon: "🕐" },
  { value: 60, label: "1小时", icon: "🕑" },
  { value: 1440, label: "1天", icon: "📅" },
  { value: 10080, label: "1周", icon: "📆" },
];
```

### 5.5 EntityDefaultsCard Props

```typescript
interface EntityDefaultsCardProps {
  entityType: "todo" | "plan" | "target";
  entityLabel: string;
  entityIcon: React.ReactNode;
  config: EntityNotificationFormDefaults;
  globalReminderTimes: number[];
  onChange: (config: EntityNotificationFormDefaults) => void;
  disabled?: boolean;
}
```

### 5.6 DoNotDisturbSection Props

```typescript
interface DoNotDisturbSectionProps {
  enabled: boolean;
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  repeat: DoNotDisturbRepeat;
  customDays: number[];
  onChange: (settings: DoNotDisturbSettings) => void;
  disabled?: boolean;
}

// 星期选项
const WEEKDAY_OPTIONS = [
  { value: 1, label: "周一", short: "一" },
  { value: 2, label: "周二", short: "二" },
  { value: 3, label: "周三", short: "三" },
  { value: 4, label: "周四", short: "四" },
  { value: 5, label: "周五", short: "五" },
  { value: 6, label: "周六", short: "六" },
  { value: 0, label: "周日", short: "日" },
];

const REPEAT_OPTIONS = [
  { value: "daily", label: "每天" },
  { value: "weekdays", label: "工作日" },
  { value: "weekends", label: "周末" },
  { value: "custom", label: "自定义" },
];
```

### 5.7 ChannelPrioritySorter Props

```typescript
interface ChannelPrioritySorterProps {
  channels: NotificationPlugin[];
  priority: string[]; // plugin ID 数组
  onChange: (priority: string[]) => void;
  disabled?: boolean;
}

// 使用 @dnd-kit/sortable 实现拖拽排序
```

### 5.8 RetentionSettings Props

```typescript
interface RetentionSettingsProps {
  days: number;
  onChange: (days: number) => void;
  onCleanup?: () => void;
  onExport?: () => void;
  disabled?: boolean;

  // 可选范围
  minDays?: number; // 默认 7
  maxDays?: number; // 默认 365
}
```

---

## 6. React Hooks 设计

### 6.1 useGlobalNotificationSettings

```typescript
// src/hooks/useGlobalNotificationSettings.ts

export function useGlobalNotificationSettings() {
  return useQuery({
    queryKey: ["settings", "notifications", "global"],
    queryFn: async () => {
      const response = await invoke<GlobalNotificationSettingsResponse>(
        "get_global_notification_settings",
      );
      return response;
    },
    staleTime: 5 * 60 * 1000, // 5 分钟
  });
}

export function useUpdateGlobalNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UpdateGlobalNotificationSettingsRequest) => {
      return await invoke<GlobalNotificationSettingsResponse>(
        "update_global_notification_settings",
        { settings },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["settings", "notifications", "global"],
      });
    },
  });
}
```

### 6.2 useNotificationHistoryCleanup

```typescript
export function useNotificationHistoryCleanup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (retentionDays: number) => {
      return await invoke<CleanupResult>("cleanup_notification_history", {
        retention_days: retentionDays,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", "history"],
      });
    },
  });
}
```

---

## 7. 与现有系统集成

### 7.1 与通知发送流程的集成

```rust
// 在发送通知前检查全局设置
pub async fn should_send_notification(
    settings: &GlobalNotificationSettings,
    now: DateTime<Local>,
) -> bool {
    // 1. 检查总开关
    if !settings.enabled {
        return false;
    }

    // 2. 检查免打扰时段
    if settings.do_not_disturb.enabled {
        if is_in_do_not_disturb(settings, now) {
            return false;
        }
    }

    true
}

fn is_in_do_not_disturb(
    settings: &GlobalNotificationSettings,
    now: DateTime<Local>,
) -> bool {
    let current_time = now.time();
    let start = NaiveTime::parse_from_str(&settings.do_not_disturb_start_time, "%H:%M").unwrap();
    let end = NaiveTime::parse_from_str(&settings.do_not_disturb_end_time, "%H:%M").unwrap();

    // 检查是否在免打扰日期
    if !should_apply_do_not_disturb_today(settings, now) {
        return false;
    }

    // 处理跨天情况
    if start > end {
        // 跨天，如 22:00 - 08:00
        current_time >= start || current_time <= end
    } else {
        // 不跨天，如 14:00 - 16:00
        current_time >= start && current_time <= end
    }
}
```

### 7.2 与实体创建的集成

```rust
// 创建 Todo/Plan/Target 时应用默认设置
pub async fn create_entity_with_default_notifications(
    db: &Database,
    entity_type: &str,
    entity_data: &CreateEntityRequest,
) -> Result<Entity, String> {
    // 1. 创建实体
    let entity = create_entity(db, entity_data).await?;

    // 2. 获取全局设置
    let global_settings = get_global_notification_settings(db).await?;
    let entity_defaults = &global_settings.entity_defaults;

    // 3. 根据实体类型获取默认配置
    let defaults = match entity_type {
        "todo" => &entity_defaults.todo,
        "plan" => &entity_defaults.plan,
        "target" => &entity_defaults.target,
        _ => return Ok(entity),
    };

    // 4. 如果启用提醒，创建 notification_settings
    if defaults.enabled {
        let reminder_times = if defaults.use_global_default {
            global_settings.default_reminder_times.clone()
        } else {
            defaults.custom_reminder_times.clone().unwrap_or_default()
        };

        if !reminder_times.is_empty() {
            create_notification_settings(
                db,
                entity_type,
                &entity.id,
                reminder_times,
            ).await?;
        }
    }

    Ok(entity)
}
```

---

## 8. 错误处理策略

### 8.1 表单验证

```typescript
function validateFormData(
  data: NotificationSettingsFormState,
): Record<string, string> {
  const errors: Record<string, string> = {};

  // 验证提醒时间
  if (data.default_reminder_times.length === 0) {
    errors.default_reminder_times = "至少选择一个提醒时间";
  }

  // 验证免打扰时间
  if (data.do_not_disturb.enabled) {
    if (!data.do_not_disturb.start_time || !data.do_not_disturb.end_time) {
      errors.do_not_disturb = "请设置完整的免打扰时间";
    }

    if (
      data.do_not_disturb.repeat === "custom" &&
      data.do_not_disturb.custom_days.length === 0
    ) {
      errors.do_not_disturb_repeat = "请至少选择一天";
    }
  }

  // 验证渠道优先级
  if (data.channel_priority.length === 0) {
    errors.channel_priority = "至少配置一个通知渠道";
  }

  // 验证保留天数
  if (data.history_retention_days < 7 || data.history_retention_days > 365) {
    errors.history_retention_days = "保留天数必须在 7-365 之间";
  }

  return errors;
}
```

### 8.2 API 错误处理

```typescript
async function handleSaveSettings(settings: NotificationSettingsFormState) {
  try {
    setIsSaving(true);
    await updateSettings.mutateAsync(settings);
    showToast({ type: "success", message: "设置已保存" });
  } catch (error) {
    if (error.code === "VALIDATION_ERROR") {
      setErrors(error.fields);
    } else if (error.code === "CHANNEL_NOT_FOUND") {
      showToast({ type: "error", message: "部分通知渠道已失效，请重新配置" });
    } else {
      showToast({ type: "error", message: "保存失败，请重试" });
    }
  } finally {
    setIsSaving(false);
  }
}
```

---

## 9. 测试策略

### 9.1 单元测试

```typescript
// src/components/settings/__tests__/ReminderTimeSelector.test.tsx
describe("ReminderTimeSelector", () => {
  it("should render all preset time options", () => {
    // 测试预设选项渲染
  });

  it("should call onChange when selecting time", () => {
    // 测试选择事件
  });

  it("should support custom time input", () => {
    // 测试自定义时间
  });
});

// src/components/settings/__tests__/DoNotDisturbSection.test.tsx
describe("DoNotDisturbSection", () => {
  it("should handle cross-day time range correctly", () => {
    // 测试跨天时段 (22:00 - 08:00)
  });

  it("should show weekday checkboxes when repeat is custom", () => {
    // 测试自定义重复模式
  });
});
```

### 9.2 集成测试

```typescript
// src/app/views/__tests__/SettingsNotificationsView.test.tsx
describe("SettingsNotificationsView", () => {
  it("should load and display current settings", async () => {
    // 测试数据加载
  });

  it("should save settings on form submit", async () => {
    // 测试保存流程
  });

  it("should show validation errors before saving", async () => {
    // 测试表单验证
  });
});
```

### 9.3 E2E 测试

```typescript
// 测试完整用户流程
describe("Notification Settings E2E", () => {
  it("should configure notification settings end-to-end", async () => {
    // 1. 访问设置页面
    // 2. 修改各项配置
    // 3. 保存设置
    // 4. 验证设置生效
    // 5. 创建新 Todo，验证默认提醒已应用
  });
});
```

---

## 10. 实现计划

### Phase 1: 后端实现 (预计 1 天)

| 任务           | 优先级 | 文件                                      |
| -------------- | ------ | ----------------------------------------- |
| 创建数据库表   | P0     | migration                                 |
| Rust 数据模型  | P0     | `src-tauri/src/models/notification.rs`    |
| API 实现       | P0     | `src-tauri/src/commands/notifications.rs` |
| 与实体创建集成 | P0     | `src-tauri/src/commands/todos.rs` 等      |
| 免打扰检查逻辑 | P1     | `src-tauri/src/background/mod.rs`         |

### Phase 2: 前端组件 (预计 1.5 天)

| 任务                      | 优先级 | 文件                                                |
| ------------------------- | ------ | --------------------------------------------------- |
| Hooks 实现                | P0     | `src/hooks/useGlobalNotificationSettings.ts`        |
| GlobalTogglesSection      | P0     | `src/components/settings/GlobalTogglesSection.tsx`  |
| ReminderTimeSelector      | P0     | `src/components/settings/ReminderTimeSelector.tsx`  |
| EntityDefaultsCard        | P0     | `src/components/settings/EntityDefaultsCard.tsx`    |
| DoNotDisturbSection       | P0     | `src/components/settings/DoNotDisturbSection.tsx`   |
| ChannelPrioritySorter     | P1     | `src/components/settings/ChannelPrioritySorter.tsx` |
| RetentionSettings         | P1     | `src/components/settings/RetentionSettings.tsx`     |
| SettingsNotificationsView | P0     | `src/app/views/SettingsNotificationsView.tsx`       |

### Phase 3: 测试 (预计 0.5 天)

| 任务     | 优先级 |
| -------- | ------ |
| 单元测试 | P0     |
| 集成测试 | P0     |
| 手动验证 | P0     |

---

## 11. 验收标准

### 11.1 功能验收

- [ ] 全局开关可以正常启用/禁用通知
- [ ] 默认提醒时间可以配置多个选项
- [ ] Todo/Plan/Target 各自有独立的默认配置
- [ ] 免打扰时段支持跨天设置
- [ ] 渠道优先级可以通过拖拽调整
- [ ] 历史保留天数可配置
- [ ] 整体保存后配置即时生效
- [ ] 创建新实体时自动应用默认配置

### 11.2 技术验收

- [ ] 测试覆盖率 >= 90%
- [ ] TypeScript 类型检查通过
- [ ] ESLint 检查通过
- [ ] 构建成功
- [ ] 与现有通知系统无缝集成

---

## 12. 附录

### 12.1 路由配置

```typescript
// src/app/settings/notifications/page.tsx
export default function SettingsNotificationsPage() {
  return <SettingsNotificationsView />;
}
```

### 12.2 侧边栏菜单

```typescript
// 添加到设置菜单
{
  label: "全局通知",
  path: "/settings/notifications",
  icon: "🔔",
  description: "配置通知行为和默认策略"
}
```

### 12.3 依赖库

```json
{
  "@dnd-kit/core": "^6.1.0",
  "@dnd-kit/sortable": "^8.0.0",
  "@dnd-kit/utilities": "^3.2.2"
}
```

---

## 变更记录

| 日期       | 版本 | 变更         |
| ---------- | ---- | ------------ |
| 2026-03-14 | v1.0 | 初始设计文档 |
