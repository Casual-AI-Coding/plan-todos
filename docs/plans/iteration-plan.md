# Plan Todos - 迭代计划

> 创建日期：2026-02-14
> 状态：**全部完成** ✅
> 完成日期：2026-03-18

---

## 概述

本文档记录 Plan Todos 应用的迭代计划，分为六个阶段：

- **第一阶段**：让数据可用
- **第二阶段**：增强功能
- **第三阶段**：新概念 - Circulation (打卡)
- **第四阶段**：通知系统 (统一通知 + 打卡通知)
- **第五阶段**：移动端适配
- **第六阶段**：数据同步与备份

---

## 第一阶段：让数据可用

> **状态**: ✅ 已完成 (2026-02-14)

### 目标

让应用能够正常存储和显示数据，不再是内存数据。

### 功能列表

| 序号 | 功能                   | 说明                                         | 状态      |
| ---- | ---------------------- | -------------------------------------------- | --------- |
| 1.1  | Dashboard 连接真实数据 | Dashboard 组件调用单一 API，显示完整统计数据 | ✅ 已完成 |
| 1.2  | 数据持久化             | SQLite 数据持久化到本地文件，重启不丢失      | ✅ 已完成 |

### 1.1 Dashboard 连接真实数据

**设计原则**：

- 所有数据通过 **一个** `get_dashboard` 接口返回
- 后端聚合所有数据，前端只需调用一次

**API 设计**：

```typescript
// 单一接口
getDashboard(): Promise<Dashboard>

// 返回结构
interface Dashboard {
  // 今日概览
  overview: {
    today_todos_count: number;      // 今日待办数
    upcoming_3days_count: number;  // 3天内到期
    completed_today_count: number; // 今日完成
    overdue_count: number;         // 过期数
    streak_days: number;           // 连续打卡
    productivity_score: number;    // 效率评分 0-100
  };

  // 本周统计
  week: {
    completed_count: number;      // 本周完成数
  };

  // 实体数量
  counts: {
    todo: number;
    plan: number;
    task: number;
    target: number;
    step: number;
    milestone: number;
  };

  // 今日待办列表
  today_todos: TodoSummary[];

  // 过期待办
  overdue_todos: TodoSummary[];

  // 今日完成
  completed_today: TodoSummary[];

  // 进行中的计划 (Top 5)
  active_plans: PlanWithProgress[];

  // 进行中的目标 (Top 5)
  active_targets: TargetWithProgress[];

  // 进行中的里程碑 (Top 3)
  active_milestones: MilestoneWithProgress[];
}
```

**数据来源聚合**：

| 字段              | 后端查询                                        |
| ----------------- | ----------------------------------------------- |
| overview.\*       | SQL 聚合统计                                    |
| week.\*           | SQL 本周统计                                    |
| counts.\*         | 各表 COUNT                                      |
| today_todos       | todos WHERE due_date = today                    |
| overdue_todos     | todos WHERE due_date < today AND status != done |
| completed_today   | todos WHERE status = done AND updated today     |
| active_plans      | plans WHERE status = active (带进度计算)        |
| active_targets    | targets WHERE status = active (带进度计算)      |
| active_milestones | milestones WHERE status = pending (带进度)      |

**前端调用**：

```typescript
// 之前 (2个接口)
// const [dashboard, stats] = await Promise.all([getDashboard(), getStatistics()]);

// 之后 (1个接口)
const dashboard = await getDashboard(); // 包含所有数据
```

### 1.2 数据持久化

**问题**：

- 当前数据库操作在内存中，重启应用数据丢失
- 需要持久化到本地 SQLite 文件

**实现**：

- 修改 `src-tauri/src/db.rs`，数据库文件路径改为本地文件
- 路径：`%LOCALAPPDATA%/plan-todos/data.db` (Windows)
- 应用启动时自动创建目录和数据库文件

---

## 第二阶段：增强功能

> **状态**: ✅ 已完成 (2026-02-14)
> ⚠️ **重要提醒**：本阶段开始前，需与产品方确认具体需求和设计细节。

### 目标

增加实用功能，提升用户体验。

### 功能列表

| 序号 | 功能              | 说明                                    | 状态      |
| ---- | ----------------- | --------------------------------------- | --------- |
| 2.1  | 优先级 (Priority) | 给 Todo/Task/Step 添加 P0-P3 优先级     | ✅ 已完成 |
| 2.2  | 标签系统 (Tags)   | 给 Todo/Plan/Target 添加标签，支持筛选  | ✅ 已完成 |
| 2.3  | 导入/导出         | JSON 格式导入导出所有数据 (含 settings) | ✅ 已完成 |

### 实现顺序

1. **Priority** (优先级) - 最简单，收益明显
2. **Tags** (标签系统) - 中等复杂度
3. **Import/Export** (导入导出) - 最后实现

---

### 2.1 优先级 (Priority)

**设计决策**：

- 优先级加在最细节的事项上：**Todo、Task、Step**
- 枚举值：**P0、P1、P2、P3** (P0 最高)
- 默认值：**P2**

**枚举说明**：

| 优先级 | 说明        | 颜色         |
| ------ | ----------- | ------------ |
| P0     | 紧急重要    | 红色 #EF4444 |
| P1     | 重要        | 橙色 #F59E0B |
| P2     | 普通 (默认) | 灰色 #6B7280 |
| P3     | 低优先级    | 蓝色 #3B82F6 |

**数据库扩展**：

```sql
ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'P2';
ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'P2';
ALTER TABLE steps ADD COLUMN priority TEXT DEFAULT 'P2';
```

**前端展示**：

- Todo/Task/Step 列表显示优先级图标
- 筛选器支持按优先级筛选
- 排序可选: 优先级靠前

---

### 2.2 标签系统 (Tags)

**设计决策**：

- 标签加在上层概念：**Todo、Plan、Target**
- Todo 支持优先级 + 标签筛选
- Plan 和 Target 支持标签筛选

**数据库扩展**：

```sql
-- 标签表
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TEXT NOT NULL
);

-- 实体标签关联表 (多对多)
CREATE TABLE entity_tags (
  entity_type TEXT NOT NULL,  -- 'todo' | 'plan' | 'target'
  entity_id TEXT NOT NULL,
  tag_id TEXT NOT NULL,
  PRIMARY KEY (entity_type, entity_id, tag_id),
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

**UI 设计**：

- 位置：**Settings > Tags Management** (通用和通知之间)
- 功能：创建/编辑/删除标签 (名称 + 颜色)
- 筛选：Todo/Plan/Target 列表页支持按标签筛选 (多选 = OR 关系)

---

### 2.3 导入/导出

**设计决策**：

- 导出包含 **settings** (notification_settings, daily_summary_settings, notification_plugins)

**导出数据格式**：

```json
{
  "version": "1.0",
  "exported_at": "2026-02-14T12:00:00Z",
  "data": {
    "todos": [...],
    "tasks": [...],
    "plans": [...],
    "targets": [...],
    "steps": [...],
    "milestones": [...],
    "tags": [...],
    "entity_tags": [...],
    "settings": {
      "notification_settings": [...],
      "daily_summary_settings": [...],
      "notification_plugins": [...]
    }
  }
}
```

**导入策略**：

| 模式    | 说明                 | 场景     |
| ------- | -------------------- | -------- |
| merge   | 合并 (id 冲突则跳过) | 增量导入 |
| replace | 替换 (清空后导入)    | 完全覆盖 |
| update  | 更新 (id 相同则更新) | 同步更新 |

**前端 UI**：

- 位置：Settings 新增 **Import/Export** 标签页
- 导出：点击按钮 → 下载 JSON 文件
- 导入：选择文件 + 模式选择 → 上传解析 → 导入结果

---

### 2.4 Settings 页面结构更新

```
Settings
├── General          (通用)
├── Tags Management  (标签管理) ← 新增
├── Notifications    (通知)
├── Channels         (渠道)
└── Daily Summary   (每日汇总)
├── Import/Export   (导入导出) ← 新增
└── About           (关于)
```

---

## 第三阶段：新概念 - Circulation (打卡)

> ⚠️ **重要提醒**：本阶段开始前，必须与产品方沟通确认相关功能和设计后方可实施。
> **状态**: ✅ 已完成 (2026-02-19)

### 目标

新增循环任务概念，类似于每日打卡、每周打卡。

### 概念设计

**Circulation** 是独立的实体，类似 Todo 但会循环：

- 可设置循环频率：每日、每周、每月、特定日期
- 完成后自动重置到下一周期
- 支持 streak（连续打卡）统计

### 导航更新 (已实现)

```
📋 TODOS → 🔄 CIRCLUATIONS → 🚀 PLANS
```

**注意**: 打卡菜单位于 TODOS 和 PLANS 中间，不使用子菜单，而是通过页面内 Tab 切换：

- 今日打卡 (Tab)
- 打卡设置 (Tab)
  - 周期打卡 / 计数打卡 (二级 Tab)
  - 每日 / 每周 / 每月 (周期打卡子 Tab)

### 实体设计 (已实现)

```sql
CREATE TABLE circulations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  circulation_type TEXT NOT NULL DEFAULT 'periodic',  -- 'periodic' | 'count'
  frequency TEXT,                                     -- 'daily' | 'weekly' | 'monthly'
  frequency_config TEXT,                              -- JSON: { "days": [1,2,3] } for weekly
  target_count INTEGER,                              -- count only
  current_count INTEGER DEFAULT 0,                    -- count only
  streak_count INTEGER DEFAULT 0,                    -- periodic only
  best_streak INTEGER DEFAULT 0,                      -- periodic only
  last_completed_at TEXT,
  status TEXT DEFAULT 'active',                       -- 'active' | 'archived'
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 打卡记录
CREATE TABLE circulation_logs (
  id TEXT PRIMARY KEY,
  circulation_id TEXT REFERENCES circulations(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL,
  note TEXT,
  period TEXT  -- 记录是哪一期完成的 (e.g., "2024-W05", "2024-02")
);
```

### 循环逻辑

| 频率    | 重置时机         | 示例      |
| ------- | ---------------- | --------- |
| daily   | 每天 00:00       | 每日晨跑  |
| weekly  | 每周一 00:00     | 每周总结  |
| monthly | 每月1日 00:00    | 每月复盘  |
| count   | 无重置，持续累加 | 喝水 8 杯 |

### 打卡统计

- **当前连续**：streak_count，连续完成的天数/周数/月数
- **最佳连续**：best_streak，历史最高连续记录
- **今日状态**：是否已完成今日打卡

### 打卡主页 UI (已实现)

```
┌─────────────────────────────────────────────┐
│  打卡                            [今日打卡] [打卡设置]    [+ 新建]  │
├─────────────────────────────────────────────┤
│  Tab: [周期打卡] [计数打卡]                                    │
│  ┌─────────────────────────────────────┐   │
│  │ 🔥 连续 5 天      ✨ 最佳 15 天     │   │
│  │ 晨跑                        [打卡]   │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Dashboard 集成 (已实现)

- 今日待打卡数量
- 今日已完成数量
- 当前最长连续天数

### Statistics 集成 (已实现)

- 总打卡项数量
- 活跃打卡项数量
- 平均连续天数

### 种子数据 (已实现)

创建以下示例打卡：
| 类型 | 名称 | 频率/目标 |
|------|------|----------|
| 每日 | 晨跑 | daily |
| 每日 | 读书 | daily |
| 每日 | 喝水 | daily |
| 每周 | 周报 | weekly |
| 每周 | 周复盘 | weekly |
| 每月 | 月总结 | monthly |
| 计数 | 喝水 | target: 8 |
| 计数 | 每日10000步 | target: 10000 |

---

## 第四阶段：通知系统

> **状态**: ✅ 已完成 (2026-03-15)

### 目标

统一通知系统，整合通用通知与打卡通知，提供灵活的提醒策略配置。

### 功能列表

| 序号 | 功能         | 说明                                | 状态      |
| ---- | ------------ | ----------------------------------- | --------- |
| 4.1  | 通知核心架构 | 事件中心、插件接口                  | ✅ 已完成 |
| 4.2  | 通知后端 API | reminders、daily_summary、设置 CRUD | ✅ 已完成 |
| 4.3  | 通知渠道插件 | 飞书/钉钉/邮件/Webhook              | ✅ 已完成 |
| 4.4  | 通知 UI 界面 | Settings 页面通知配置 UI            | ✅ 已完成 |
| 4.5  | 打卡通知配置 | 打卡提醒策略                        | ✅ 已完成 |

---

### 4.1 通知核心架构

```
┌─────────────────────────────────────────────┐
│              Notification Core              │
│  ┌─────────────────────────────────────────┐ │
│  │ Event Bus - 事件中心                     │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│              Plugin Interface               │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐  │
│  │飞书  │ │钉钉  │ │ 邮件 │ │ Webhook  │  │
│  │插件  │ │插件  │ │ 插件 │ │   插件   │  │
│  └──────┘ └──────┘ └──────┘ └──────────┘  │
└─────────────────────────────────────────────┘
```

---

### 4.2 通知后端 API (已完成)

| API                             | 说明             |
| ------------------------------- | ---------------- |
| `get_due_reminders`             | 获取到期提醒     |
| `get_daily_summary`             | 获取每日汇总     |
| `get_notification_settings`     | 获取通知设置     |
| `set_notification_settings`     | 设置通知         |
| `delete_notification_settings`  | 删除设置         |
| `get_daily_summary_settings`    | 获取每日汇总设置 |
| `update_daily_summary_settings` | 更新每日汇总设置 |
| `notification_plugins` CRUD     | 插件管理         |
| `send_notification`             | 发送通知         |

---

### 4.3 通知 UI 界面

**Settings 页面结构**：

```
Settings
├── General              (通用)
├── Tags Management     (标签管理)
├── Notifications      (通知)      ← 需要 UI
├── Channels           (渠道)      ← 需要 UI
├── Daily Summary      (每日汇总)  ← 需要 UI
├── Import/Export      (导入导出)
└── About              (关于)
```

**通知设置内容**：

- 全局开关 (启用/禁用通知)
- 通知时间配置
- 渠道配置 (飞书/钉钉/邮件/Webhook)
- 测试通知按钮
- 每日汇总开关和时间

---

### 4.5 打卡通知配置

| 功能         | 说明                             |
| ------------ | -------------------------------- |
| 固定时间提醒 | 每天固定时间提醒打卡             |
| 提前提醒     | 打卡时间前 N 分钟提醒            |
| 成就通知     | 连续打卡达到里程碑时通知         |
| 模板配置     | 支持为不同打卡项设置不同提醒策略 |

---

## 第五阶段：移动端适配

> **状态**: ✅ 已完成 (Android), iOS 已跳过 (2026-03-18)

### 目标

完善移动端体验，支持 iOS 和 Android。

### 功能列表

| 序号 | 功能           | 说明               | 状态      |
| ---- | -------------- | ------------------ | --------- |
| 5.1  | 响应式布局     | 桌面/平板/手机适配 | ✅ 已完成 |
| 5.2  | 移动端 UI 优化 | 安全区域、底部导航 | ✅ 已完成 |
| 5.3  | Android 构建   | APK/AAB 构建       | ✅ 已完成 |
| 5.4  | iOS 构建       | iOS 构建与测试     | ⏭️ 已跳过 |

---

## 第六阶段：数据同步与备份

> **状态**: ✅ 已完成 (2026-03-18)

### 目标

支持数据备份与多设备同步。

### 功能列表

| 序号 | 功能        | 说明                             | 状态      |
| ---- | ----------- | -------------------------------- | --------- |
| 6.1  | 本地导出    | JSON/SQLite 文件导出             | ✅ 已完成 |
| 6.2  | 本地导入    | JSON 导入 (merge/replace/update) | ✅ 已完成 |
| 6.3  | 云同步      | WebDAV 同步实现                  | ✅ 已完成 |
| 6.4  | 冲突解决    | 4种策略 + 手动解决UI             | ✅ 已完成 |
| 6.5  | WebDAV 支持 | 自托管 NAS 支持                  | ✅ 已完成 |

### 已实现功能详情

**本地导出 (6.1)**:

- 位置: `src-tauri/src/commands/export.rs`, `src/lib/api/export.ts`
- UI: `src/app/views/ImportExportView.tsx`
- 支持 JSON 格式导出，包含所有数据

**本地导入 (6.2)**:

- 位置: `src-tauri/src/commands/import.rs`
- 支持三种导入模式: merge (合并), replace (替换), update (更新)
