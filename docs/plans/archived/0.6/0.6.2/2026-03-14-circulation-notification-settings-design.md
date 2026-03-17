# 打卡通知配置设计

> 创建日期：2026-03-14
> 状态：规划中

---

## 概述

为打卡 (Circulation) 功能添加通知配置，支持固定时间提醒、提前提醒、成就通知和模板配置。

---

## 数据库设计

```sql
-- 打卡通知设置表
CREATE TABLE IF NOT EXISTS circulation_notification_settings (
  id TEXT PRIMARY KEY,
  circulation_id TEXT REFERENCES circulations(id) ON DELETE CASCADE,

  -- 提醒开关
  enabled INTEGER DEFAULT 1,

  -- 提醒类型: 'fixed' | 'before' | 'achievement'
  reminder_type TEXT NOT NULL DEFAULT 'fixed',

  -- 固定时间提醒 (HH:MM)
  fixed_time TEXT,

  -- 提前提醒分钟数 (before 类型)
  before_minutes INTEGER DEFAULT 15,

  -- 成就类型: 'streak' | 'count' | 'best_streak'
  achievement_type TEXT,
  -- 成就阈值 (如连续 7 天, 100 次等)
  achievement_threshold INTEGER,

  -- 通知渠道 (JSON array)
  channels TEXT DEFAULT '["desktop"]',

  -- 模板消息 (可选)
  message_template TEXT,

  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 全局打卡通知设置 (默认配置)
CREATE TABLE IF NOT EXISTS global_circulation_notification_settings (
  id TEXT PRIMARY KEY DEFAULT 'global',

  -- 全局开关
  master_enabled INTEGER DEFAULT 1,

  -- 默认提醒类型
  default_reminder_type TEXT DEFAULT 'fixed',
  default_fixed_time TEXT DEFAULT '09:00',
  default_before_minutes INTEGER DEFAULT 15,

  -- 成就通知开关
  achievement_notifications INTEGER DEFAULT 1,
  streak_milestones TEXT DEFAULT '[7, 14, 30, 60, 100, 365]',
  count_milestones TEXT DEFAULT '[10, 50, 100, 500, 1000]',

  -- 默认渠道
  default_channels TEXT DEFAULT '["desktop"]',

  -- 免打扰模式
  dnd_enabled INTEGER DEFAULT 0,
  dnd_start_time TEXT DEFAULT '22:00',
  dnd_end_time TEXT DEFAULT '08:00',

  updated_at TEXT NOT NULL
);
```

---

## API 设计

### 1. 获取单个打卡的通知设置

```typescript
GET /circulation_notification_settings/:circulation_id
```

### 2. 更新打卡的通知设置

```typescript
PUT /circulation_notification_settings/:circulation_id
{
  enabled: boolean,
  reminder_type: 'fixed' | 'before' | 'achievement',
  fixed_time?: string,      // HH:MM
  before_minutes?: number,  // 5, 15, 30, 60
  achievement_type?: 'streak' | 'count' | 'best_streak',
  achievement_threshold?: number,
  channels?: string[],
  message_template?: string
}
```

### 3. 删除打卡的通知设置

```typescript
DELETE /circulation_notification_settings/:circulation_id
```

### 4. 获取全局打卡通知设置

```typescript
GET / global_circulation_notification_settings;
```

### 5. 更新全局打卡通知设置

```typescript
PUT /global_circulation_notification_settings
{
  master_enabled: boolean,
  default_reminder_type: string,
  default_fixed_time: string,
  default_before_minutes: number,
  achievement_notifications: boolean,
  streak_milestones: number[],
  count_milestones: number[],
  default_channels: string[],
  dnd_enabled: boolean,
  dnd_start_time: string,
  dnd_end_time: string
}
```

---

## 前端设计

### Settings 页面新增标签页

```
Settings
├── General
├── Tags Management
├── Notifications
├── Channels
├── Daily Summary
├── Circulation Notifications  ← 新增
├── Import/Export
└── About
```

### 打卡通知配置页面

```tsx
// src/app/views/SettingsCirculationNotificationsView.tsx

// 组件结构
<SettingsCirculationNotificationsView>
  <GlobalSettingsCard>
    {" "}
    // 全局设置
    <MasterToggle /> // 总开关
    <DefaultReminderType /> // 默认提醒类型选择
    <FixedTimePicker /> // 固定时间选择
    <BeforeMinutesPicker /> // 提前分钟数选择
    <AchievementSettings /> // 成就通知设置
    <DNDSettings /> // 免打扰设置
  </GlobalSettingsCard>

  <PerCirculationSettings>
    {" "}
    // 每个打卡的设置
    <CirculationList>
      <CirculationItem>
        <CirculationName />
        <ReminderToggle />
        <ReminderTypeSelect />
        <ReminderConfig />
      </CirculationItem>
    </CirculationList>
  </PerCirculationSettings>
</SettingsCirculationNotificationsView>
```

---

## 实现顺序

1. 数据库表创建
2. Rust 后端 CRUD API
3. 前端 TypeScript types
4. 前端 API functions
5. 前端 React Query hooks
6. 前端 SettingsCirculationNotificationsView 组件
7. 集成到 Settings 页面

---

## 成就里程碑默认值

| 类型     | 里程碑                     |
| -------- | -------------------------- |
| 连续打卡 | 7, 14, 30, 60, 100, 365 天 |
| 计数打卡 | 10, 50, 100, 500, 1000 次  |
