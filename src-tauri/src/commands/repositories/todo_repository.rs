use crate::models::Todo;
use crate::AppState;
use rusqlite::params;

pub struct TodoRepository;

impl TodoRepository {
    pub fn get_by_id(conn: &rusqlite::Connection, id: &str) -> Result<Todo, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, due_date, status, priority, recurrence, recurrence_from, recurrence_index, sort_order, created_at, updated_at FROM todos WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        stmt.query_row([id], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                priority: row.get(5)?,
                recurrence: row.get(6)?,
                recurrence_from: row.get(7)?,
                recurrence_index: row.get(8)?,
                sort_order: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())
    }

    pub fn get_all(conn: &rusqlite::Connection) -> Result<Vec<Todo>, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, due_date, status, priority, recurrence, recurrence_from, recurrence_index, sort_order, created_at, updated_at FROM todos ORDER BY sort_order ASC, created_at DESC",
            )
            .map_err(|e| e.to_string())?;

        let todo_iter = stmt
            .query_map([], |row| {
                Ok(Todo {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    due_date: row.get(3)?,
                    status: row.get(4)?,
                    priority: row.get(5)?,
                    recurrence: row.get(6)?,
                    recurrence_from: row.get(7)?,
                    recurrence_index: row.get(8)?,
                    sort_order: row.get(9)?,
                    created_at: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let todos: Result<Vec<Todo>, String> = Ok(todo_iter.filter_map(|t| t.ok()).collect());
        todos
    }

    pub fn create(
        conn: &rusqlite::Connection,
        id: &str,
        title: &str,
        content: Option<&str>,
        due_date: Option<&str>,
        priority: Option<&str>,
    ) -> Result<Todo, String> {
        let now = chrono::Utc::now().to_rfc3339();
        let priority = priority.unwrap_or("P2");

        conn.execute(
            "INSERT INTO todos (id, title, content, due_date, status, priority, recurrence, recurrence_from, recurrence_index, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, NULL, NULL, 0, 0, ?, ?)",
            params![id, title, content, due_date, priority, now, now],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn update(
        conn: &rusqlite::Connection,
        id: &str,
        title: Option<&str>,
        content: Option<&str>,
        due_date: Option<&str>,
        status: Option<&str>,
        priority: Option<&str>,
        recurrence: Option<&str>,
    ) -> Result<Todo, String> {
        let existing = Self::get_by_id(conn, id)?;
        let now = chrono::Utc::now().to_rfc3339();

        let new_title = title.unwrap_or(&existing.title);
        let new_content = content.or(existing.content.as_deref());
        let new_due_date = due_date.or(existing.due_date.as_deref());
        let new_status = status.unwrap_or(&existing.status);
        let new_priority = priority.unwrap_or(&existing.priority);
        let new_recurrence = recurrence.or(existing.recurrence.as_deref());

        conn.execute(
            "UPDATE todos SET title = ?, content = ?, due_date = ?, status = ?, priority = ?, recurrence = ?, updated_at = ? WHERE id = ?",
            params![new_title, new_content, new_due_date, new_status, new_priority, new_recurrence, now, id],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn delete(conn: &rusqlite::Connection, id: &str) -> Result<(), String> {
        conn.execute("DELETE FROM todos WHERE id = ?", [id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_by_ids(conn: &rusqlite::Connection, ids: &[String]) -> Result<Vec<Todo>, String> {
        if ids.is_empty() {
            return Ok(vec![]);
        }

        let placeholders: Vec<&str> = ids.iter().map(|_| "?").collect();
        let sql = format!(
            "SELECT id, title, content, due_date, status, priority, recurrence, recurrence_from, recurrence_index, sort_order, created_at, updated_at FROM todos WHERE id IN ({}) ORDER BY sort_order ASC",
            placeholders.join(",")
        );

        let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
        let todo_iter = stmt
            .query_map(rusqlite::params_from_iter(ids), |row| {
                Ok(Todo {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    due_date: row.get(3)?,
                    status: row.get(4)?,
                    priority: row.get(5)?,
                    recurrence: row.get(6)?,
                    recurrence_from: row.get(7)?,
                    recurrence_index: row.get(8)?,
                    sort_order: row.get(9)?,
                    created_at: row.get(10)?,
                    updated_at: row.get(11)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let todos: Result<Vec<Todo>, String> = Ok(todo_iter.filter_map(|t| t.ok()).collect());
        todos
    }
}
