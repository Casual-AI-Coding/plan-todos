# Plan Todos - 数据库设计

> 状态：已完成

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

## 四、索引设计

```sql
-- 加速查询
CREATE INDEX idx_tasks_plan_id ON tasks(plan_id);
CREATE INDEX idx_steps_target_id ON steps(target_id);
CREATE INDEX idx_todos_status ON todos(status);
CREATE INDEX idx_todos_due_date ON todos(due_date);
CREATE INDEX idx_milestones_status ON milestones(status);

-- 时间范围查询
CREATE INDEX idx_plans_date ON plans(start_date, end_date);
CREATE INDEX idx_tasks_date ON tasks(start_date, end_date);
```

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

## 七、后续设计

- [ ] API接口设计 → `api-design.md`
- [ ] 组件设计 → `component-design.md`
