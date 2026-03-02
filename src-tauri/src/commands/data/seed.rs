// Seed test data command

use crate::AppState;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct SeedResult {
    pub todos: i32,
    pub plans: i32,
    pub tasks: i32,
    pub targets: i32,
    pub steps: i32,
    pub milestones: i32,
    pub circulations: i32,
    pub circulation_logs: i32,
    pub tags: i32,
}

#[tauri::command]
pub fn seed_test_data(state: tauri::State<AppState>) -> Result<SeedResult, String> {
    crate::log_command!("seed_test_data", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        let mut result = SeedResult {
            todos: 0,
            plans: 0,
            tasks: 0,
            targets: 0,
            steps: 0,
            milestones: 0,
            circulations: 0,
            circulation_logs: 0,
            tags: 0,
        };

        // Seed Tags (6 tags)
        let tags = vec![
            ("tag-1", "工作", "#EF4444"),
            ("tag-2", "生活", "#3B82F6"),
            ("tag-3", "学习", "#10B981"),
            ("tag-4", "健康", "#F59E0B"),
            ("tag-5", "娱乐", "#8B5CF6"),
            ("tag-6", "财务", "#06B6D4"),
        ];
        for (id, name, color) in tags {
            conn.execute(
                "INSERT OR IGNORE INTO tags (id, name, color, created_at) VALUES (?, ?, ?, ?)",
                rusqlite::params![id, name, color, &now],
            )
            .map_err(|e| e.to_string())?;
            result.tags += 1;
        }

        // Seed Todos (10 todos)
        let todos = vec![
            (
                "todo-seed-1",
                "完成项目提案",
                "撰写项目提案文档",
                "2026-03-01",
                "pending",
                "P0",
            ),
            (
                "todo-seed-2",
                "代码审查",
                "Review PR #125",
                "2026-02-25",
                "pending",
                "P1",
            ),
            (
                "todo-seed-3",
                "准备演示文稿",
                "准备产品演示",
                "2026-02-28",
                "pending",
                "P1",
            ),
            (
                "todo-seed-4",
                "回复用户反馈",
                "处理用户邮件",
                "2026-02-24",
                "in-progress",
                "P2",
            ),
            (
                "todo-seed-5",
                "更新文档",
                "更新API文档",
                "2026-03-05",
                "pending",
                "P2",
            ),
            (
                "todo-seed-6",
                "优化性能",
                "优化查询性能",
                "2026-03-10",
                "pending",
                "P2",
            ),
            (
                "todo-seed-7",
                "修复Bug",
                "修复登录问题",
                "2026-02-23",
                "done",
                "P0",
            ),
            (
                "todo-seed-8",
                "写测试用例",
                "编写单元测试",
                "2026-03-15",
                "pending",
                "P3",
            ),
            (
                "todo-seed-9",
                "整理文件",
                "整理项目文件",
                "2026-03-20",
                "pending",
                "P3",
            ),
            (
                "todo-seed-10",
                "备份数据",
                "定期备份数据库",
                "2026-04-01",
                "pending",
                "P3",
            ),
        ];
        for (id, title, content, due_date, status, priority) in todos {
            conn.execute(
                "INSERT OR IGNORE INTO todos (id, title, content, due_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![id, title, content, due_date, status, priority, &now, &now],
            ).map_err(|e| e.to_string())?;
            result.todos += 1;
        }

        // Seed Plans (3 plans)
        let plans = vec![
            (
                "plan-seed-1",
                "完成产品发布",
                "准备V2.0版本的发布工作",
                "2026-02-01",
                "2026-03-31",
                "active",
            ),
            (
                "plan-seed-2",
                "技术重构",
                "优化代码结构和性能",
                "2026-01-15",
                "2026-02-28",
                "active",
            ),
            (
                "plan-seed-3",
                "用户调研",
                "收集用户反馈",
                "2025-12-01",
                "2026-01-31",
                "completed",
            ),
        ];
        for (id, title, description, start_date, end_date, status) in plans {
            conn.execute(
                "INSERT OR IGNORE INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![id, title, description, start_date, end_date, status, &now, &now],
            ).map_err(|e| e.to_string())?;
            result.plans += 1;
        }

        // Seed Tasks (15 tasks)
        let tasks = vec![
            (
                "task-seed-1",
                "plan-seed-1",
                "准备发布文档",
                "撰写V2.0功能说明",
                "2026-02-10",
                "2026-02-20",
                "in-progress",
                "P1",
            ),
            (
                "task-seed-2",
                "plan-seed-1",
                "测试回归",
                "执行完整测试套件",
                "2026-02-25",
                "2026-03-10",
                "pending",
                "P2",
            ),
            (
                "task-seed-3",
                "plan-seed-1",
                "更新版本说明",
                "编写版本更新日志",
                "2026-03-15",
                "2026-03-20",
                "pending",
                "P2",
            ),
            (
                "task-seed-4",
                "plan-seed-2",
                "重构数据库层",
                "优化SQL查询",
                "2026-01-20",
                "2026-02-10",
                "done",
                "P1",
            ),
            (
                "task-seed-5",
                "plan-seed-2",
                "优化前端构建",
                "减少打包体积",
                "2026-02-15",
                "2026-02-25",
                "pending",
                "P3",
            ),
            (
                "task-seed-6",
                "plan-seed-2",
                "代码审查流程",
                "建立代码审查规范",
                "2026-02-01",
                "2026-02-15",
                "done",
                "P2",
            ),
            (
                "task-seed-7",
                "plan-seed-3",
                "用户访谈",
                "与10位用户进行访谈",
                "2025-12-15",
                "2026-01-10",
                "done",
                "P1",
            ),
            (
                "task-seed-8",
                "plan-seed-3",
                "数据分析",
                "分析用户行为数据",
                "2026-01-15",
                "2026-01-25",
                "done",
                "P2",
            ),
            (
                "task-seed-9",
                "plan-seed-1",
                "市场推广",
                "制定推广计划",
                "2026-03-01",
                "2026-03-15",
                "pending",
                "P2",
            ),
            (
                "task-seed-10",
                "plan-seed-1",
                "客服培训",
                "培训客服团队",
                "2026-03-20",
                "2026-03-25",
                "pending",
                "P3",
            ),
            (
                "task-seed-11",
                "plan-seed-2",
                "性能监控",
                "添加性能监控",
                "2026-02-20",
                "2026-03-05",
                "pending",
                "P2",
            ),
            (
                "task-seed-12",
                "plan-seed-2",
                "安全审计",
                "进行安全检查",
                "2026-03-10",
                "2026-03-20",
                "pending",
                "P1",
            ),
            (
                "task-seed-13",
                "plan-seed-3",
                "竞品分析",
                "分析竞争对手",
                "2025-12-05",
                "2025-12-20",
                "done",
                "P2",
            ),
            (
                "task-seed-14",
                "plan-seed-3",
                "需求收集",
                "收集新需求",
                "2025-12-01",
                "2025-12-15",
                "done",
                "P1",
            ),
            (
                "task-seed-15",
                "plan-seed-3",
                "产品规划",
                "规划下一版本",
                "2026-01-20",
                "2026-01-31",
                "done",
                "P1",
            ),
        ];
        for (id, plan_id, title, description, start_date, end_date, status, priority) in tasks {
            conn.execute(
                "INSERT OR IGNORE INTO tasks (id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![id, plan_id, title, description, start_date, end_date, status, priority, &now, &now],
            ).map_err(|e| e.to_string())?;
            result.tasks += 1;
        }

        // Seed Targets (5 targets)
        let targets = vec![
            (
                "target-seed-1",
                "提升代码质量",
                "重构遗留代码，提高可维护性",
                "2026-06-30",
                "active",
                35,
            ),
            (
                "target-seed-2",
                "月活用户达10万",
                "通过运营活动提升活跃度",
                "2026-12-31",
                "active",
                15,
            ),
            (
                "target-seed-3",
                "完成技术文档",
                "整理API文档和开发指南",
                "2026-03-15",
                "active",
                60,
            ),
            (
                "target-seed-4",
                "提高用户满意度",
                "收集并响应用户反馈",
                "2026-09-30",
                "active",
                40,
            ),
            (
                "target-seed-5",
                "降低服务器成本",
                "优化资源使用",
                "2026-08-31",
                "active",
                25,
            ),
        ];
        for (id, title, description, due_date, status, progress) in targets {
            conn.execute(
                "INSERT OR IGNORE INTO targets (id, title, description, due_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![id, title, description, due_date, status, progress, &now, &now],
            ).map_err(|e| e.to_string())?;
            result.targets += 1;
        }

        // Seed Steps (10 steps)
        let steps = vec![
            (
                "step-seed-1",
                "target-seed-1",
                "代码审查流程",
                25,
                "completed",
                "P1",
            ),
            (
                "step-seed-2",
                "target-seed-1",
                "单元测试覆盖",
                25,
                "completed",
                "P2",
            ),
            (
                "step-seed-3",
                "target-seed-1",
                "重构核心模块",
                30,
                "in-progress",
                "P0",
            ),
            (
                "step-seed-4",
                "target-seed-1",
                "性能优化",
                20,
                "pending",
                "P3",
            ),
            (
                "step-seed-5",
                "target-seed-3",
                "API文档",
                30,
                "completed",
                "P1",
            ),
            (
                "step-seed-6",
                "target-seed-3",
                "开发指南",
                30,
                "completed",
                "P2",
            ),
            (
                "step-seed-7",
                "target-seed-3",
                "部署文档",
                40,
                "pending",
                "P2",
            ),
            (
                "step-seed-8",
                "target-seed-2",
                "用户增长策略",
                33,
                "pending",
                "P1",
            ),
            (
                "step-seed-9",
                "target-seed-2",
                "活动策划",
                33,
                "pending",
                "P2",
            ),
            (
                "step-seed-10",
                "target-seed-2",
                "数据分析和优化",
                34,
                "pending",
                "P2",
            ),
        ];
        for (id, target_id, title, weight, status, priority) in steps {
            conn.execute(
                "INSERT OR IGNORE INTO steps (id, target_id, title, weight, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![id, target_id, title, weight, status, priority, &now, &now],
            ).map_err(|e| e.to_string())?;
            result.steps += 1;
        }

        // Seed Milestones (5 milestones)
        let milestones = vec![
            (
                "milestone-seed-1",
                "Beta版本发布",
                "2026-02-28",
                "plan",
                "plan-seed-1",
                "pending",
                30,
            ),
            (
                "milestone-seed-2",
                "V2.0正式发布",
                "2026-03-31",
                "plan",
                "plan-seed-1",
                "pending",
                0,
            ),
            (
                "milestone-seed-3",
                "代码质量达标",
                "2026-06-30",
                "target",
                "target-seed-1",
                "in-progress",
                35,
            ),
            (
                "milestone-seed-4",
                "文档完成",
                "2026-03-15",
                "target",
                "target-seed-3",
                "in-progress",
                60,
            ),
            (
                "milestone-seed-5",
                "用户满意度提升",
                "2026-09-30",
                "target",
                "target-seed-4",
                "pending",
                40,
            ),
        ];
        for (id, title, target_date, biz_type, biz_id, status, progress) in milestones {
            conn.execute(
                "INSERT OR IGNORE INTO milestones (id, title, target_date, biz_type, biz_id, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![id, title, target_date, biz_type, biz_id, status, progress, &now, &now],
            ).map_err(|e| e.to_string())?;
            result.milestones += 1;
        }

        // Seed Circulations - Periodic type (6 circulations)
        let periodic_circulations = vec![
            (
                "circ-seed-1",
                "晨跑",
                "每天早上跑步",
                "daily",
                5,
                15,
                "active",
            ),
            (
                "circ-seed-2",
                "读书",
                "每天阅读 30 分钟",
                "daily",
                12,
                30,
                "active",
            ),
            (
                "circ-seed-3",
                "喝水",
                "每天喝足够的水",
                "daily",
                20,
                45,
                "active",
            ),
            (
                "circ-seed-4",
                "冥想",
                "每天冥想 10 分钟",
                "daily",
                8,
                20,
                "active",
            ),
            (
                "circ-seed-5",
                "周报",
                "每周完成周报",
                "weekly",
                3,
                8,
                "active",
            ),
            (
                "circ-seed-6",
                "周复盘",
                "每周进行复盘",
                "weekly",
                2,
                6,
                "active",
            ),
        ];
        for (id, title, content, freq, streak, best_streak, status) in periodic_circulations {
            conn.execute(
                "INSERT OR IGNORE INTO circulations (id, title, content, circulation_type, frequency, streak_count, best_streak, status, created_at, updated_at) VALUES (?, ?, ?, 'periodic', ?, ?, ?, ?, ?, ?)",
                rusqlite::params![id, title, content, freq, streak, best_streak, status, &now, &now],
            ).map_err(|e| e.to_string())?;
            result.circulations += 1;
        }

        // Seed Circulations - Count type (2 circulations)
        let count_circulations = vec![
            ("circ-seed-7", "喝水目标", "每天喝 8 杯水", 8, 5, "active"),
            (
                "circ-seed-8",
                "每日步数",
                "每天走 10000 步",
                10000,
                6500,
                "active",
            ),
        ];
        for (id, title, content, target_count, current_count, status) in count_circulations {
            conn.execute(
                "INSERT OR IGNORE INTO circulations (id, title, content, circulation_type, target_count, current_count, status, created_at, updated_at) VALUES (?, ?, ?, 'count', ?, ?, ?, ?, ?)",
                rusqlite::params![id, title, content, target_count, current_count, status, &now, &now],
            ).map_err(|e| e.to_string())?;
            result.circulations += 1;
        }

        // Seed Circulation Logs (30 logs)
        for i in 0..30 {
            let log_id = format!("circ-log-seed-{}", i + 1);
            let circ_id = format!("circ-seed-{}", (i % 8) + 1);
            let days_ago = 30 - i;
            let completed_at = chrono::Utc::now() - chrono::Duration::days(days_ago as i64);
            let completed_at = completed_at.to_rfc3339();

            conn.execute(
                "INSERT OR IGNORE INTO circulation_logs (id, circulation_id, completed_at, count) VALUES (?, ?, ?, ?)",
                rusqlite::params![log_id, circ_id, completed_at, 1],
            ).map_err(|e| e.to_string())?;

            result.circulation_logs += 1;
        }

        log::info!("Seed data inserted: {:?}", result);
        Ok(result)
    })
}
