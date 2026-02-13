// Database initialization and seed data

use log::info;
use rusqlite::Connection;

pub fn init_db(conn: &Connection) -> Result<(), rusqlite::Error> {
    // Plans table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS plans (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Tasks table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY,
            plan_id TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Targets table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS targets (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            due_date TEXT,
            status TEXT NOT NULL DEFAULT 'active',
            progress INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Steps table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS steps (
            id TEXT PRIMARY KEY,
            target_id TEXT NOT NULL,
            title TEXT NOT NULL,
            weight INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
        )",
        [],
    )?;

    // Todos table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS todos (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT,
            due_date TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Milestones table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS milestones (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            target_date TEXT,
            plan_id TEXT,
            task_id TEXT,
            target_id TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            progress INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL,
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL,
            FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE SET NULL
        )",
        [],
    )?;

    // Notification settings table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS notification_settings (
            id TEXT PRIMARY KEY,
            entity_type TEXT NOT NULL,
            entity_id TEXT NOT NULL,
            reminder_minutes INTEGER NOT NULL DEFAULT 30,
            reminder_sent INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            UNIQUE(entity_type, entity_id)
        )",
        [],
    )?;

    // Daily summary settings
    conn.execute(
        "CREATE TABLE IF NOT EXISTS daily_summary_settings (
            id TEXT PRIMARY KEY,
            enabled INTEGER NOT NULL DEFAULT 1,
            time TEXT NOT NULL DEFAULT '09:00',
            include_pending INTEGER NOT NULL DEFAULT 1,
            include_overdue INTEGER NOT NULL DEFAULT 1,
            include_completed INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )",
        [],
    )?;

    // Seed default daily summary settings
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM daily_summary_settings", [], |row| {
        row.get(0)
    })?;
    if count == 0 {
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "INSERT INTO daily_summary_settings (id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params!["default", 1, "09:00", 1, 1, 1, &now, &now],
        )?;
    }

    // Migration: Add missing columns
    conn.execute(
        "ALTER TABLE targets ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0",
        [],
    )
    .ok();
    conn.execute(
        "ALTER TABLE milestones ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0",
        [],
    )
    .ok();
    conn.execute(
        "ALTER TABLE plans ADD COLUMN IF NOT EXISTS start_date TEXT",
        [],
    )
    .ok();
    conn.execute(
        "ALTER TABLE plans ADD COLUMN IF NOT EXISTS end_date TEXT",
        [],
    )
    .ok();
    conn.execute(
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS start_date TEXT",
        [],
    )
    .ok();
    conn.execute(
        "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS end_date TEXT",
        [],
    )
    .ok();
    conn.execute(
        "ALTER TABLE milestones ADD COLUMN IF NOT EXISTS plan_id TEXT",
        [],
    )
    .ok();
    conn.execute(
        "ALTER TABLE milestones ADD COLUMN IF NOT EXISTS task_id TEXT",
        [],
    )
    .ok();
    conn.execute(
        "ALTER TABLE milestones ADD COLUMN IF NOT EXISTS target_id TEXT",
        [],
    )
    .ok();

    // Create indexes for performance optimization
    create_indexes(conn)?;

    // Seed initial data
    seed_data(conn).ok();

    info!("Database initialized successfully");
    Ok(())
}

fn create_indexes(conn: &Connection) -> Result<(), rusqlite::Error> {
    // Indexes for tasks
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_tasks_plan_id ON tasks(plan_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_tasks_dates ON tasks(start_date, end_date)",
        [],
    )?;

    // Indexes for steps
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_steps_target_id ON steps(target_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_steps_status ON steps(status)",
        [],
    )?;

    // Indexes for todos
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_todos_status_due ON todos(status, due_date)",
        [],
    )?;

    // Indexes for plans
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_plans_status ON plans(status)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_plans_dates ON plans(start_date, end_date)",
        [],
    )?;

    // Indexes for targets
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_targets_status ON targets(status)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_targets_due_date ON targets(due_date)",
        [],
    )?;

    // Indexes for milestones
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_milestones_plan_id ON milestones(plan_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_milestones_task_id ON milestones(task_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_milestones_target_id ON milestones(target_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_milestones_status ON milestones(status)",
        [],
    )?;

    // Indexes for notification settings
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_notification_entity ON notification_settings(entity_type, entity_id)",
        [],
    )?;
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_notification_due ON notification_settings(reminder_sent, reminder_minutes)",
        [],
    )?;

    Ok(())
}

fn seed_data(conn: &Connection) -> Result<(), rusqlite::Error> {
    let count: i32 = conn.query_row("SELECT COUNT(*) FROM todos", [], |row| row.get(0))?;
    if count > 0 {
        return Ok(());
    }

    info!("Seeding initial data...");
    let now = chrono::Utc::now().to_rfc3339();

    // Seed Todos
    conn.execute(
        "INSERT INTO todos (id, title, content, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["todo-1", "完成项目设计稿", "需要给UI设计稿添加注释", "2026-02-15", "pending", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO todos (id, title, content, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["todo-2", "准备周报", "总结本周工作进展", "2026-02-14", "in-progress", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO todos (id, title, content, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["todo-3", "团队会议", "讨论Q1目标", "2026-02-13", "done", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO todos (id, title, content, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["todo-4", "代码审查", "Review PR #123", "2026-02-20", "pending", &now, &now],
    )?;

    // Seed Plans
    conn.execute(
        "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["plan-1", "完成产品发布", "准备V2.0版本的发布工作", "2026-02-01", "2026-03-31", "active", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["plan-2", "技术重构", "优化代码结构和性能", "2026-01-15", "2026-02-28", "active", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["plan-3", "用户调研", "收集用户反馈", "2025-12-01", "2026-01-31", "completed", &now, &now],
    )?;

    // Seed Tasks
    conn.execute(
        "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["task-1", "plan-1", "准备发布文档", "撰写V2.0功能说明", "2026-02-10", "2026-02-20", "in-progress", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["task-2", "plan-1", "测试回归", "执行完整测试套件", "2026-02-25", "2026-03-10", "pending", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["task-3", "plan-2", "重构数据库层", "优化SQL查询", "2026-01-20", "2026-02-10", "done", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["task-4", "plan-2", "优化前端构建", "减少打包体积", "2026-02-15", "2026-02-25", "pending", &now, &now],
    )?;

    // Seed Targets
    conn.execute(
        "INSERT INTO targets (id, title, description, due_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["target-1", "提升代码质量", "重构遗留代码，提高可维护性", "2026-06-30", "active", 35, &now, &now],
    )?;
    conn.execute(
        "INSERT INTO targets (id, title, description, due_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["target-2", "月活用户达10万", "通过运营活动提升活跃度", "2026-12-31", "active", 15, &now, &now],
    )?;
    conn.execute(
        "INSERT INTO targets (id, title, description, due_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["target-3", "完成技术文档", "整理API文档和开发指南", "2026-03-15", "active", 60, &now, &now],
    )?;

    // Seed Steps
    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["step-1", "target-1", "代码审查流程", 25, "completed", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["step-2", "target-1", "单元测试覆盖", 25, "completed", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["step-3", "target-1", "重构核心模块", 30, "in-progress", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["step-4", "target-1", "性能优化", 20, "pending", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["step-5", "target-3", "API文档", 30, "completed", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["step-6", "target-3", "开发指南", 30, "completed", &now, &now],
    )?;
    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["step-7", "target-3", "部署文档", 40, "pending", &now, &now],
    )?;

    // Seed Milestones
    conn.execute(
        "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["milestone-1", "Beta版本发布", "2026-02-28", "plan-1", Option::<&str>::None, Option::<&str>::None, "pending", 30, &now, &now],
    )?;
    conn.execute(
        "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["milestone-2", "V2.0正式发布", "2026-03-31", "plan-1", Option::<&str>::None, Option::<&str>::None, "pending", 0, &now, &now],
    )?;
    conn.execute(
        "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        rusqlite::params!["milestone-3", "代码质量达标", "2026-06-30", Option::<&str>::None, Option::<&str>::None, "target-1", "in-progress", 35, &now, &now],
    )?;

    info!("Seed data inserted successfully");
    Ok(())
}
