#[cfg(test)]
mod tests {
    use crate::db::init_db;
    use crate::models::{Milestone, Plan, Step, Target, Task, Todo};
    use rusqlite::Connection;

    #[test]
    fn test_plan_model() {
        let plan = Plan {
            id: "test-1".to_string(),
            title: "Test".to_string(),
            description: None,
            start_date: None,
            end_date: None,
            status: "active".to_string(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
        };
        assert_eq!(plan.status, "active");
    }

    #[test]
    fn test_todo_model() {
        let todo = Todo {
            id: "t1".to_string(),
            title: "Test".to_string(),
            content: None,
            due_date: None,
            status: "pending".to_string(),
            priority: "P2".to_string(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
        };
        assert_eq!(todo.status, "pending");
    }

    #[test]
    fn test_task_model() {
        let task = Task {
            id: "t1".to_string(),
            plan_id: "p1".to_string(),
            title: "Test".to_string(),
            description: None,
            start_date: None,
            end_date: None,
            status: "pending".to_string(),
            priority: "P2".to_string(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
        };
        assert_eq!(task.plan_id, "p1");
    }

    #[test]
    fn test_target_model() {
        let target = Target {
            id: "t1".to_string(),
            title: "Test".to_string(),
            description: None,
            due_date: None,
            status: "active".to_string(),
            progress: 0,
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
        };
        assert_eq!(target.progress, 0);
    }

    #[test]
    fn test_step_model() {
        let step = Step {
            id: "s1".to_string(),
            target_id: "t1".to_string(),
            title: "Test".to_string(),
            weight: 25,
            status: "pending".to_string(),
            priority: "P2".to_string(),
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
        };
        assert_eq!(step.weight, 25);
    }

    #[test]
    fn test_milestone_model() {
        let m = Milestone {
            id: "m1".to_string(),
            title: "Test".to_string(),
            target_date: None,
            biz_type: Some("plan".to_string()),
            biz_id: Some("p1".to_string()),
            status: "pending".to_string(),
            progress: 0,
            created_at: "2026-01-01T00:00:00Z".to_string(),
            updated_at: "2026-01-01T00:00:00Z".to_string(),
        };
        assert_eq!(m.biz_type, Some("plan".to_string()));
        assert_eq!(m.biz_id, Some("p1".to_string()));
    }

    #[test]
    fn test_init_db() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
    }

    #[test]
    fn test_tables_exist() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();

        let tables = [
            "plans",
            "todos",
            "tasks",
            "targets",
            "steps",
            "milestones",
            "notification_settings",
            "daily_summary_settings",
            "notification_plugins",
        ];

        for table in tables {
            let sql = format!(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='{}'",
                table
            );
            conn.query_row(&sql, [], |_| Ok(())).unwrap();
        }
    }

    #[test]
    fn test_todo_crud() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            ["test-todo-1", "Test", "pending", &now, &now],
        )
        .unwrap();

        let title: String = conn
            .query_row(
                "SELECT title FROM todos WHERE id = 'test-todo-1'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(title, "Test");

        conn.execute(
            "UPDATE todos SET status = 'done' WHERE id = 'test-todo-1'",
            [],
        )
        .unwrap();

        let status: String = conn
            .query_row(
                "SELECT status FROM todos WHERE id = 'test-todo-1'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(status, "done");

        conn.execute("DELETE FROM todos WHERE id = 'test-todo-1'", [])
            .unwrap();

        let cnt: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM todos WHERE id = 'test-todo-1'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(cnt, 0);
    }

    #[test]
    fn test_plan_with_tasks() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO plans (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            ["test-plan-1", "Plan", "active", &now, &now],
        )
        .unwrap();
        conn.execute("INSERT INTO tasks (id, plan_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", ["test-task-1", "test-plan-1", "Task", "pending", &now, &now]).unwrap();

        let cnt: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks WHERE plan_id = 'test-plan-1'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(cnt, 1);
    }

    #[test]
    fn test_target_steps() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute("INSERT INTO targets (id, title, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)", rusqlite::params!["test-target-1", "Target", "active", 0, &now, &now]).unwrap();
        conn.execute("INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", rusqlite::params!["test-step-1", "test-target-1", "Step1", 30, "completed", &now, &now]).unwrap();
        conn.execute("INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", rusqlite::params!["test-step-2", "test-target-1", "Step2", 70, "pending", &now, &now]).unwrap();

        let w: i32 = conn
            .query_row(
                "SELECT COALESCE(SUM(weight), 0) FROM steps WHERE target_id = 'test-target-1'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(w, 100);
    }

    #[test]
    fn test_milestone() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO plans (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            ["test-ms-plan", "Plan", "active", &now, &now],
        )
        .unwrap();
        conn.execute("INSERT INTO milestones (id, title, biz_type, biz_id, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", rusqlite::params!["test-ms-1", "Milestone", "plan", "test-ms-plan", "pending", 0, &now, &now]).unwrap();

        let biz_type: String = conn
            .query_row(
                "SELECT biz_type FROM milestones WHERE id = 'test-ms-1'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(biz_type, "plan");
    }

    #[test]
    fn test_notification_settings() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute("INSERT INTO notification_settings (id, entity_type, entity_id, reminder_minutes, reminder_sent, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", rusqlite::params!["test-ns-1", "todo", "t1", 30, 0, &now, &now]).unwrap();

        let cnt: i32 = conn
            .query_row("SELECT COUNT(*) FROM notification_settings", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(cnt, 1);
    }

    #[test]
    fn test_daily_summary() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute("INSERT INTO daily_summary_settings (id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", rusqlite::params!["test-dss-1", 1, "09:00", 1, 1, 1, &now, &now]).unwrap();

        let en: i32 = conn
            .query_row("SELECT enabled FROM daily_summary_settings", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(en, 1);
    }

    #[test]
    fn test_plugins() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute("INSERT INTO notification_plugins (id, name, plugin_type, enabled, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)", rusqlite::params!["test-np-1", "飞书", "feishu", 1, "{}", &now, &now]).unwrap();

        let cnt: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM notification_plugins WHERE enabled = 1",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(cnt, 1);
    }

    // Search tests
    #[test]
    fn test_search_todos_by_title() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO todos (id, title, content, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params!["s1", "Buy milk", "Get 2 liters", "pending", &now, &now],
        ).unwrap();

        let mut stmt = conn
            .prepare("SELECT id, title FROM todos WHERE title LIKE ?")
            .unwrap();
        let pattern = "%Buy%";
        let results: Vec<(String, String)> = stmt
            .query_map([pattern], |row| Ok((row.get(0)?, row.get(1)?)))
            .unwrap()
            .filter_map(|r| r.ok())
            .collect();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].1, "Buy milk");
    }

    #[test]
    fn test_search_todos_by_content() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO todos (id, title, content, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params!["s2", "Shopping", "Buy milk and eggs", "pending", &now, &now],
        ).unwrap();

        let mut stmt = conn
            .prepare("SELECT id, title FROM todos WHERE content LIKE ?")
            .unwrap();
        let pattern = "%milk%";
        let results: Vec<(String, String)> = stmt
            .query_map([pattern], |row| Ok((row.get(0)?, row.get(1)?)))
            .unwrap()
            .filter_map(|r| r.ok())
            .collect();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].1, "Shopping");
    }

    #[test]
    fn test_search_plans() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO plans (id, title, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params!["p1", "Learn Rust", "Master Rust programming", "active", &now, &now],
        ).unwrap();

        let mut stmt = conn
            .prepare("SELECT id, title FROM plans WHERE title LIKE ? OR description LIKE ?")
            .unwrap();
        let pattern = "%Rust%";
        let results: Vec<(String, String)> = stmt
            .query_map(rusqlite::params![pattern, pattern], |row| {
                Ok((row.get(0)?, row.get(1)?))
            })
            .unwrap()
            .filter_map(|r| r.ok())
            .collect();
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_search_tasks() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO plans (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["p-search", "Plan", "active", &now, &now],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO tasks (id, plan_id, title, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params!["t1", "p-search", "Write code", "Implement features", "pending", &now, &now],
        ).unwrap();

        let mut stmt = conn
            .prepare("SELECT id, title FROM tasks WHERE title LIKE ? OR description LIKE ?")
            .unwrap();
        let pattern = "%Write%";
        let results: Vec<(String, String)> = stmt
            .query_map(rusqlite::params![pattern, pattern], |row| {
                Ok((row.get(0)?, row.get(1)?))
            })
            .unwrap()
            .filter_map(|r| r.ok())
            .collect();
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_search_targets() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO targets (id, title, description, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params!["tgt1", "Get fit", "Exercise daily", "active", 0, &now, &now],
        ).unwrap();

        let mut stmt = conn
            .prepare("SELECT id, title FROM targets WHERE title LIKE ? OR description LIKE ?")
            .unwrap();
        let pattern = "%fit%";
        let results: Vec<(String, String)> = stmt
            .query_map(rusqlite::params![pattern, pattern], |row| {
                Ok((row.get(0)?, row.get(1)?))
            })
            .unwrap()
            .filter_map(|r| r.ok())
            .collect();
        assert_eq!(results.len(), 1);
    }

    #[test]
    fn test_search_milestones() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO milestones (id, title, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params!["m1", "First Release", "pending", 0, &now, &now],
        ).unwrap();

        let mut stmt = conn
            .prepare("SELECT id, title FROM milestones WHERE title LIKE ?")
            .unwrap();
        let pattern = "%Release%";
        let results: Vec<(String, String)> = stmt
            .query_map([pattern], |row| Ok((row.get(0)?, row.get(1)?)))
            .unwrap()
            .filter_map(|r| r.ok())
            .collect();
        assert_eq!(results.len(), 1);
    }

    // Statistics tests
    #[test]
    fn test_statistics_todo_counts() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["stat-t1", "Task 1", "pending", &now, &now],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["stat-t2", "Task 2", "done", &now, &now],
        )
        .unwrap();

        let total: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM todos WHERE id LIKE 'stat-%'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let done: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM todos WHERE id LIKE 'stat-%' AND status = 'done'",
                [],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(total, 2);
        assert_eq!(done, 1);
    }

    #[test]
    fn test_statistics_task_counts() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO plans (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["stat-p1", "Plan", "active", &now, &now],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO tasks (id, plan_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params!["stat-task1", "stat-p1", "Task 1", "pending", &now, &now],
        ).unwrap();
        conn.execute(
            "INSERT INTO tasks (id, plan_id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            rusqlite::params!["stat-task2", "stat-p1", "Task 2", "done", &now, &now],
        ).unwrap();

        let total: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks WHERE id LIKE 'stat-%'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        let done: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM tasks WHERE id LIKE 'stat-%' AND status = 'done'",
                [],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(total, 2);
        assert_eq!(done, 1);
    }

    // Batch operations tests
    #[test]
    fn test_batch_update_todos() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["batch-b1", "Task 1", "pending", &now, &now],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["batch-b2", "Task 2", "pending", &now, &now],
        )
        .unwrap();

        // Batch update
        conn.execute(
            "UPDATE todos SET status = 'done' WHERE id IN ('batch-b1', 'batch-b2')",
            [],
        )
        .unwrap();

        let done_count: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM todos WHERE id LIKE 'batch-%' AND status = 'done'",
                [],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(done_count, 2);
    }

    #[test]
    fn test_batch_delete_todos() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["batch-d1", "Task 1", "pending", &now, &now],
        )
        .unwrap();
        conn.execute(
            "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["batch-d2", "Task 2", "pending", &now, &now],
        )
        .unwrap();

        // Batch delete
        conn.execute("DELETE FROM todos WHERE id IN ('batch-d1', 'batch-d2')", [])
            .unwrap();

        let remaining: i32 = conn
            .query_row(
                "SELECT COUNT(*) FROM todos WHERE id LIKE 'batch-%'",
                [],
                |row| row.get(0),
            )
            .unwrap();

        assert_eq!(remaining, 0);
    }

    // Edge case tests
    #[test]
    fn test_null_handling() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        // Insert with null fields
        conn.execute(
            "INSERT INTO todos (id, title, content, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params!["null1", "No content todo", None::<String>, None::<String>, "pending", &now, &now],
        ).unwrap();

        let title: String = conn
            .query_row("SELECT title FROM todos WHERE id = 'null1'", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(title, "No content todo");
    }

    #[test]
    fn test_status_transitions() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO todos (id, title, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params!["trans1", "Task", "pending", &now, &now],
        )
        .unwrap();

        // pending -> in-progress
        conn.execute(
            "UPDATE todos SET status = 'in-progress', updated_at = ? WHERE id = 'trans1'",
            [&now],
        )
        .unwrap();
        let status: String = conn
            .query_row("SELECT status FROM todos WHERE id = 'trans1'", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(status, "in-progress");

        // in-progress -> done
        conn.execute(
            "UPDATE todos SET status = 'done', updated_at = ? WHERE id = 'trans1'",
            [&now],
        )
        .unwrap();
        let status: String = conn
            .query_row("SELECT status FROM todos WHERE id = 'trans1'", [], |row| {
                row.get(0)
            })
            .unwrap();
        assert_eq!(status, "done");
    }
}
