use crate::models::Task;
use rusqlite::params;

pub struct TaskRepository;

impl TaskRepository {
    pub fn get_by_id(conn: &rusqlite::Connection, id: &str) -> Result<Task, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at FROM tasks WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        stmt.query_row([id], |row| {
            Ok(Task {
                id: row.get(0)?,
                plan_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                start_date: row.get(4)?,
                end_date: row.get(5)?,
                status: row.get(6)?,
                priority: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())
    }

    pub fn get_all(conn: &rusqlite::Connection) -> Result<Vec<Task>, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at FROM tasks",
            )
            .map_err(|e| e.to_string())?;

        let task_iter = stmt
            .query_map([], |row| {
                Ok(Task {
                    id: row.get(0)?,
                    plan_id: row.get(1)?,
                    title: row.get(2)?,
                    description: row.get(3)?,
                    start_date: row.get(4)?,
                    end_date: row.get(5)?,
                    status: row.get(6)?,
                    priority: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let tasks: Result<Vec<Task>, String> = Ok(task_iter.filter_map(|t| t.ok()).collect());
        tasks
    }

    pub fn get_by_plan(conn: &rusqlite::Connection, plan_id: &str) -> Result<Vec<Task>, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at FROM tasks WHERE plan_id = ?",
            )
            .map_err(|e| e.to_string())?;

        let task_iter = stmt
            .query_map([plan_id], |row| {
                Ok(Task {
                    id: row.get(0)?,
                    plan_id: row.get(1)?,
                    title: row.get(2)?,
                    description: row.get(3)?,
                    start_date: row.get(4)?,
                    end_date: row.get(5)?,
                    status: row.get(6)?,
                    priority: row.get(7)?,
                    created_at: row.get(8)?,
                    updated_at: row.get(9)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let tasks: Result<Vec<Task>, String> = Ok(task_iter.filter_map(|t| t.ok()).collect());
        tasks
    }

    pub fn create(
        conn: &rusqlite::Connection,
        id: &str,
        plan_id: &str,
        title: &str,
        description: Option<&str>,
        start_date: Option<&str>,
        end_date: Option<&str>,
        priority: Option<&str>,
    ) -> Result<Task, String> {
        let now = chrono::Utc::now().to_rfc3339();
        let priority = priority.unwrap_or("P2");

        conn.execute(
            "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)",
            params![id, plan_id, title, description, start_date, end_date, priority, now, now],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn update(
        conn: &rusqlite::Connection,
        id: &str,
        title: Option<&str>,
        description: Option<&str>,
        start_date: Option<&str>,
        end_date: Option<&str>,
        status: Option<&str>,
        priority: Option<&str>,
    ) -> Result<Task, String> {
        let existing = Self::get_by_id(conn, id)?;
        let now = chrono::Utc::now().to_rfc3339();

        let new_title = title.unwrap_or(&existing.title);
        let new_description = description.or(existing.description.as_deref());
        let new_start_date = start_date.or(existing.start_date.as_deref());
        let new_end_date = end_date.or(existing.end_date.as_deref());
        let new_status = status.unwrap_or(&existing.status);
        let new_priority = priority.unwrap_or(&existing.priority);

        conn.execute(
            "UPDATE tasks SET title = ?, description = ?, start_date = ?, end_date = ?, status = ?, priority = ?, updated_at = ? WHERE id = ?",
            params![new_title, new_description, new_start_date, new_end_date, new_status, new_priority, now, id],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn delete(conn: &rusqlite::Connection, id: &str) -> Result<(), String> {
        conn.execute("DELETE FROM tasks WHERE id = ?", [id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
