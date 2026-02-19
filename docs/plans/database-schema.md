# Plan Todos - 数据库设计

> 状态：✅ 已实现（2026-02-14）
> 
> **实际状态**：SQLite 数据库已完全实现，包含自动迁移和种子数据

---

## 一、数据库概述

- **数据库类型**：SQLite
- **存储位置**：本地文件 (`%LOCALAPPDATA%\plan-todos\data.db`)
- **访问方式**：rusqlite (直接 SQL，无 ORM)
- **迁移**：应用启动时自动执行 `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE` 迁移

---

## 二、实体关系图

```sql
┌─────────────┐       ┌─────────────┐
│    Plan    │       │   Target    │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ title       │       │ title       │
│ description │       │ description │
│ start_date  │       │ due_date    │
│ end_date    │       │ status      │
│ status      │       │ created_at  │
│ created_at  │       │ updated_at  │
│ updated_at  │       └──────┬──────┘
└──────┬──────┘              │
       │                     │ 1:N
       │ 1:N                 ▼
       ▼              ┌─────────────┐
┌─────────────┐       │    Step    │
│    Task    │       ├─────────────┤
├─────────────┤       │ id          │
│ id          │       │ target_id  │──► Target
│ plan_id     │       │ title      │
│ title       │       │ weight     │
│ description │       │ status     │
│ start_date  │       │ created_at │
│ end_date    │       │ updated_at │
│ status      │       └─────────────┘
│ created_at  │
│ updated_at  │
└─────────────┘

┌─────────────┐       ┌─────────────┐
│    Todo     │       │ Milestone   │
├─────────────┤       ├─────────────┤
│ id          │       │ id          │
│ title       │       │ title       │
│ content     │       │ target_date │
│ due_date    │       │ plan_id    │────► Plan (可选, 三选一)
│ status      │       │ task_id    │────► Task (可选, 三选一)
│ created_at  │       │ target_id  │────► Target (可选, 三选一)
│ updated_at  │       │ status     │
└─────────────┘       │ created_at  │
                      │ updated_at  │
                      └─────────────┘
```

**关系说明**：
- **Plan → Task**：1对多，一个Plan可以有多个Task
- **Target → Step**：1对多，一个Target可以有多个Step
- **Milestone → Plan/Task/Target**：多选一关联（三个外键但仅能有一个有值）
- **Todo**：独立实体，无关联

---

## 三、表结构

### 3.1 Plan - 长期计划

```sql
CREATE TABLE plans (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  TEXT,
  end_date    TEXT,
  status      TEXT NOT NULL DEFAULT 'active' 
              CHECK(status IN ('active', 'completed', 'archived')),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PK | UUID |
| title | TEXT | NOT NULL | 计划标题 |
| description | TEXT | | 描述 |
| start_date | TEXT | | 开始日期 (ISO 8601) |
| end_date | TEXT | | 结束日期 (ISO 8601) |
| status | TEXT | DEFAULT 'active' | 状态 |
| created_at | TEXT | NOT NULL | 创建时间 |
| updated_at | TEXT | NOT NULL | 更新时间 |

---

### 3.2 Task - 短期任务

```sql
CREATE TABLE tasks (
  id          TEXT PRIMARY KEY,
  plan_id     TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  start_date  TEXT,
  end_date    TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK(status IN ('pending', 'in-progress', 'done')),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);
```

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PK | UUID |
| plan_id | TEXT | FK → plans(id) | 所属计划 |
| title | TEXT | NOT NULL | 任务标题 |
| description | TEXT | | 描述 |
| start_date | TEXT | | 开始日期 |
| end_date | TEXT | | 结束日期 |
| status | TEXT | DEFAULT 'pending' | 状态 |
| created_at | TEXT | NOT NULL | 创建时间 |
| updated_at | TEXT | NOT NULL | 更新时间 |

---

### 3.3 Target - 长期目标

```sql
CREATE TABLE targets (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  due_date    TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK(status IN ('active', 'completed', 'archived')),
  progress    INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PK | UUID |
| title | TEXT | NOT NULL | 目标标题 |
| description | TEXT | | 描述 |
| due_date | TEXT | | 截止日期 |
| status | TEXT | DEFAULT 'active' | 状态 |
| progress | INTEGER | DEFAULT 0 | 进度 (0-100，从 Steps 自动计算) |
| created_at | TEXT | NOT NULL | 创建时间 |
| updated_at | TEXT | NOT NULL | 更新时间 |

---

### 3.4 Step - 步骤

```sql
CREATE TABLE steps (
  id          TEXT PRIMARY KEY,
  target_id   TEXT NOT NULL,
  title       TEXT NOT NULL,
  weight      INTEGER NOT NULL DEFAULT 0
              CHECK(weight >= 0 AND weight <= 100),
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK(status IN ('pending', 'completed')),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
);
```

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PK | UUID |
| target_id | TEXT | FK → targets(id) | 所属目标 |
| title | TEXT | NOT NULL | 步骤标题 |
| weight | INTEGER | 0-100 | 权重 |
| status | TEXT | DEFAULT 'pending' | 状态 |
| created_at | TEXT | NOT NULL | 创建时间 |
| updated_at | TEXT | NOT NULL | 更新时间 |

---

### 3.5 Todo - 短期事项

```sql
CREATE TABLE todos (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,
  due_date    TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK(status IN ('pending', 'in-progress', 'done')),
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);
```

---

### 3.6 Milestone - 里程碑

```sql
CREATE TABLE milestones (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  target_date  TEXT,
  plan_id      TEXT,
  task_id      TEXT,
  target_id    TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK(status IN ('pending', 'completed')),
  progress     INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
  FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE SET NULL
);
```

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PK | UUID |
| title | TEXT | NOT NULL | 里程碑标题 |
| target_date | TEXT | | 目标日期 |
| plan_id | TEXT | FK → plans | 关联计划 (可选) |
| task_id | TEXT | FK → tasks | 关联任务 (可选) |
| target_id | TEXT | FK → targets | 关联目标 (可选) |
| status | TEXT | DEFAULT 'pending' | 状态 |
| progress | INTEGER | DEFAULT 0 | 进度 (0-100，从关联实体自动计算) |
| created_at | TEXT | NOT NULL | 创建时间 |
| updated_at | TEXT | NOT NULL | 更新时间 |

**关联说明**：plan_id、task_id、target_id 三选一关联（仅能有一个有值）

---

## 四、索引设计
- `chk_milestone_target`：确保三选一关联（plan_id/task_id/target_id 必须且仅能有一个）

---

## 四、索引设计 (已实现)

### 4.1 索引列表

| 表 | 索引名 | 字段 | 用途 |
|----|--------|------|------|
| tasks | idx_tasks_plan_id | plan_id | 按计划查询任务 |
| tasks | idx_tasks_status | status | 状态筛选 |
| tasks | idx_tasks_dates | start_date, end_date | 日期范围查询 |
| steps | idx_steps_target_id | target_id | 按目标查询步骤 |
| steps | idx_steps_status | status | 状态筛选 |
| todos | idx_todos_due_date | due_date | 今日/即将到期查询 |
| todos | idx_todos_status | status | 状态筛选 |
| todos | idx_todos_status_due | status, due_date | Dashboard综合查询 |
| plans | idx_plans_status | status | 状态筛选 |
| plans | idx_plans_dates | start_date, end_date | 日期范围查询 |
| targets | idx_targets_status | status | 状态筛选 |
| targets | idx_targets_due_date | due_date | 截止日期查询 |
| milestones | idx_milestones_plan_id | plan_id | 进度计算 |
| milestones | idx_milestones_task_id | task_id | 进度计算 |
| milestones | idx_milestones_target_id | target_id | 进度计算 |
| milestones | idx_milestones_status | status | 状态筛选 |

### 4.2 性能提升预期

- **按 Plan 加载 Task**: ~10x 提升
- **Dashboard 查询**: ~5x 提升 (复合索引)
- **日历视图**: ~3x 提升 (日期索引)
- **状态筛选**: ~5x 提升

### 4.3 实现代码

```sql
-- 任务表索引
CREATE INDEX IF NOT EXISTS idx_tasks_plan_id ON tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_dates ON tasks(start_date, end_date);

-- 步骤表索引
CREATE INDEX IF NOT EXISTS idx_steps_target_id ON steps(target_id);
CREATE INDEX IF NOT EXISTS idx_steps_status ON steps(status);

-- 待办表索引
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_status_due ON todos(status, due_date);

-- 计划表索引
CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status);
CREATE INDEX IF NOT EXISTS idx_plans_dates ON plans(start_date, end_date);

-- 目标表索引
CREATE INDEX IF NOT EXISTS idx_targets_status ON targets(status);
CREATE INDEX IF NOT EXISTS idx_targets_due_date ON targets(due_date);

-- 里程碑表索引
CREATE INDEX IF NOT EXISTS idx_milestones_plan_id ON milestones(plan_id);
CREATE INDEX IF NOT EXISTS idx_milestones_task_id ON milestones(task_id);
CREATE INDEX IF NOT EXISTS idx_milestones_target_id ON milestones(target_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status);
```

> **注意**: 所有索引使用 `CREATE INDEX IF NOT EXISTS`，确保在已有数据库上安全迁移

---

## 五、触发器

### 5.1 Plan 进度自动更新

```sql
CREATE TRIGGER update_plan_progress
AFTER UPDATE ON tasks
BEGIN
  UPDATE plans 
  SET updated_at = datetime('now')
  WHERE id = NEW.plan_id;
END;
```

---

## 六、迁移策略

应用启动时自动执行迁移（`init_db` 函数）：
1. `CREATE TABLE IF NOT EXISTS` - 创建表（仅在表不存在时）
2. `ALTER TABLE ADD COLUMN IF NOT EXISTS` - 添加新列（向后兼容）
3. 种子数据初始化（仅在表为空时）

```rust
// 迁移示例
conn.execute("ALTER TABLE plans ADD COLUMN IF NOT EXISTS start_date TEXT", []).ok();
conn.execute("ALTER TABLE targets ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0", []).ok();
```

---

## 八、Circulation 打卡

### 8.1 circulations 表

```sql
CREATE TABLE circulations (
  id                    TEXT PRIMARY KEY,
  title                 TEXT NOT NULL,
  content               TEXT,
  circulation_type      TEXT NOT NULL DEFAULT 'periodic'
                        CHECK(circulation_type IN ('periodic', 'count')),
  frequency             TEXT,
  frequency_config      TEXT,
  target_count          INTEGER,
  current_count         INTEGER NOT NULL DEFAULT 0,
  streak_count          INTEGER NOT NULL DEFAULT 0,
  best_streak           INTEGER NOT NULL DEFAULT 0,
  last_completed_at     TEXT,
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK(status IN ('active', 'archived')),
  created_at            TEXT NOT NULL,
  updated_at            TEXT NOT NULL
);
```

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PK | UUID |
| title | TEXT | NOT NULL | 打卡项标题 |
| content | TEXT | | 描述/备注 |
| circulation_type | TEXT | NOT NULL | `periodic` 或 `count` |
| frequency | TEXT | | `daily`/`weekly`/`monthly` (周期打卡) |
| frequency_config | TEXT | | JSON 配置 |
| target_count | INTEGER | | 目标次数 (计数打卡) |
| current_count | INTEGER | DEFAULT 0 | 当前进度 (计数打卡) |
| streak_count | INTEGER | DEFAULT 0 | 当前连续天数 (周期打卡) |
| best_streak | INTEGER | DEFAULT 0 | 最佳连续记录 (周期打卡) |
| last_completed_at | TEXT | | 上次完成时间 |
| status | TEXT | DEFAULT 'active' | 状态 |
| created_at | TEXT | NOT NULL | 创建时间 |
| updated_at | TEXT | NOT NULL | 更新时间 |

### 8.2 circulation_logs 表

```sql
CREATE TABLE circulation_logs (
  id                TEXT PRIMARY KEY,
  circulation_id   TEXT NOT NULL,
  completed_at      TEXT NOT NULL,
  note              TEXT,
  period            TEXT,
  FOREIGN KEY (circulation_id) REFERENCES circulations(id) ON DELETE CASCADE
);
```

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | TEXT | PK | UUID |
| circulation_id | TEXT | FK → circulations | 关联打卡项 |
| completed_at | TEXT | NOT NULL | 打卡时间 |
| note | TEXT | | 打卡备注 |
| period | TEXT | | 周期标识 (如 `2024-W05`, `2024-02`) |

### 8.3 索引

```sql
CREATE INDEX IF NOT EXISTS idx_circulations_type ON circulations(circulation_type);
CREATE INDEX IF NOT EXISTS idx_circulations_status ON circulations(status);
CREATE INDEX IF NOT EXISTS idx_circulation_logs_cid ON circulation_logs(circulation_id);
```

---

## 九、Milestone 重构 (biz_type/biz_id)

为了支持 Milestone 关联 Circulation，对 Milestone 表进行重构：

```sql
ALTER TABLE milestones ADD COLUMN biz_type TEXT;
ALTER TABLE milestones ADD COLUMN biz_id TEXT;

CREATE INDEX IF NOT EXISTS idx_milestones_biz_type ON milestones(biz_type);
CREATE INDEX IF NOT EXISTS idx_milestones_biz_id ON milestones(biz_id);
CREATE INDEX IF NOT EXISTS idx_milestones_biz_type_id ON milestones(biz_type, biz_id);
```

biz_type 可选值：`plan` | `task` | `target` | `circulation`

---

## 十、后续设计

- [ ] API接口设计 → `api-design.md`
- [ ] 组件设计 → `component-design.md`
