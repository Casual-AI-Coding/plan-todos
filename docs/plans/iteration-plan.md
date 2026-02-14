# Plan Todos - 迭代计划

> 创建日期：2026-02-14
> 状态：规划中

---

## 概述

本文档记录 Plan Todos 应用的迭代计划，分为三个阶段：
- **第一阶段**：让数据可用
- **第二阶段**：增强功能
- **第三阶段**：新概念 - Circulation (打卡)

---

## 第一阶段：让数据可用

### 目标
让应用能够正常存储和显示数据，不再是内存数据。

### 功能列表

| 序号 | 功能 | 说明 | 状态 |
|------|------|------|------|
| 1.1 | Dashboard 连接真实数据 | Dashboard 组件调用单一 API，显示完整统计数据 | 待实现 |
| 1.2 | 数据持久化 | SQLite 数据持久化到本地文件，重启不丢失 | 待实现 |

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

| 字段 | 后端查询 |
|------|----------|
| overview.* | SQL 聚合统计 |
| week.* | SQL 本周统计 |
| counts.* | 各表 COUNT |
| today_todos | todos WHERE due_date = today |
| overdue_todos | todos WHERE due_date < today AND status != done |
| completed_today | todos WHERE status = done AND updated today |
| active_plans | plans WHERE status = active (带进度计算) |
| active_targets | targets WHERE status = active (带进度计算) |
| active_milestones | milestones WHERE status = pending (带进度) |

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

> ⚠️ **重要提醒**：本阶段开始前，需与产品方确认具体需求和设计细节。

### 目标
增加实用功能，提升用户体验。

### 功能列表

| 序号 | 功能 | 说明 | 状态 |
|------|------|------|------|
| 2.1 | 导入/导出 | JSON 格式导入导出所有数据 | 待讨论 |
| 2.2 | 标签系统 | 给 Todo/Task 添加标签，支持筛选 | 待讨论 |
| 2.3 | 优先级 | 高/中/低优先级 | 待讨论 |

### 2.1 导入/导出

**需求**：
- 导出：所有数据导出为 JSON 文件
- 导入：从 JSON 文件导入数据（可选择合并或替换）

**数据结构**：
```json
{
  "version": "1.0",
  "exported_at": "2026-02-14T12:00:00Z",
  "data": {
    "todos": [...],
    "plans": [...],
    "tasks": [...],
    "targets": [...],
    "steps": [...],
    "milestones": [...]
  }
}
```

### 2.2 标签系统

**需求**：
- 给 Todo 和 Task 添加标签
- 支持多标签
- 支持按标签筛选

**数据库扩展**：
```sql
-- 标签表
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at TEXT NOT NULL
);

-- Todo 标签关联
CREATE TABLE todo_tags (
  todo_id TEXT REFERENCES todos(id) ON DELETE CASCADE,
  tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (todo_id, tag_id)
);
```

### 2.3 优先级

**需求**：
- Todo 和 Task 支持优先级设置
- 优先级：high / medium / low
- 支持按优先级排序和筛选

**数据库扩展**：
```sql
ALTER TABLE todos ADD COLUMN priority TEXT DEFAULT 'medium';
ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium';
```

---

## 第三阶段：新概念 - Circulation (打卡)

> ⚠️ **重要提醒**：本阶段开始前，必须与产品方沟通确认相关功能和设计后方可实施。

### 目标
新增循环任务概念，类似于每日打卡、每周打卡。

### 概念设计

**Circulation** 是独立的实体，类似 Todo 但会循环：
- 可设置循环频率：每日、每周、每月、特定日期
- 完成后自动重置到下一周期
- 支持 streak（连续打卡）统计

### 导航更新

```
🔄 CIRCULATIONS (新增)
├── 今日打卡 (Today's)
├── 每周打卡 (Weekly)
└── 每月打卡 (Monthly)
```

### 实体设计

```sql
CREATE TABLE circulations (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  frequency TEXT NOT NULL,  -- 'daily', 'weekly', 'monthly', 'custom'
  frequency_config TEXT,    -- JSON: { "days": [1,2,3] } for weekly
  streak_count INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_completed_at TEXT,
  status TEXT DEFAULT 'active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 打卡记录
CREATE TABLE circulation_logs (
  id TEXT PRIMARY KEY,
  circulation_id TEXT REFERENCES circulations(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL,
  period TEXT NOT NULL  -- 记录是哪一期完成的
);
```

### 循环逻辑

| 频率 | 重置时机 | 示例 |
|------|----------|------|
| daily | 每天 00:00 | 每日晨跑 |
| weekly | 每周一 00:00 | 每周总结 |
| monthly | 每月1日 00:00 | 每月复盘 |
| custom | 自定义日期 | 每月15日 |

### 打卡统计

- **当前连续**：streak_count，连续完成的天数/周数/月数
- **最佳连续**：best_streak，历史最高连续记录
- **今日状态**：是否已完成今日打卡

---

## 文档更新历史

| 日期 | 操作 |
|------|------|
| 2026-02-14 | 创建文档 |
