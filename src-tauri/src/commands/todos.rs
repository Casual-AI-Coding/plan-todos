// Todo CRUD commands

use crate::log_command;
use crate::models::Todo;
use crate::AppState;

#[tauri::command]
pub fn get_todo(state: tauri::State<AppState>, id: String) -> Result<Todo, String> {
    log_command!("get_todo", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id, title, content, due_date, status, priority, recurrence, recurrence_from, recurrence_index, sort_order, created_at, updated_at FROM todos WHERE id = ?")
            .map_err(|e| e.to_string())?;

        stmt.query_row([&id], |row| {
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
    })
}

#[tauri::command]
pub fn get_todos(state: tauri::State<AppState>) -> Result<Vec<Todo>, String> {
    log_command!("get_todos", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

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

        todo_iter
            .collect::<Result<Vec<Todo>, _>>()
            .map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn create_todo(
    state: tauri::State<AppState>,
    title: String,
    content: Option<String>,
    due_date: Option<String>,
    priority: Option<String>,
    recurrence: Option<String>,
    recurrence_from: Option<String>,
    recurrence_index: Option<i32>,
) -> Result<Todo, String> {
    log_command!("create_todo", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();
        let priority = priority.unwrap_or_else(|| "P2".to_string());
        let recurrence_index = recurrence_index.unwrap_or(0);

        conn.execute(
            "INSERT INTO todos (id, title, content, due_date, status, priority, recurrence, recurrence_from, recurrence_index, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, 0, ?, ?)",
            rusqlite::params![id, title, content, due_date, priority, recurrence, recurrence_from, recurrence_index, now, now],
        ).map_err(|e| e.to_string())?;

        Ok(Todo {
            id,
            title,
            content,
            due_date,
            status: "pending".to_string(),
            priority,
            recurrence,
            recurrence_from,
            recurrence_index: Some(recurrence_index),
            sort_order: 0,
            created_at: now.clone(),
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn update_todo(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    content: Option<String>,
    due_date: Option<String>,
    status: Option<String>,
    priority: Option<String>,
    recurrence: Option<String>,
    recurrence_from: Option<String>,
    recurrence_index: Option<i32>,
) -> Result<Todo, String> {
    log_command!("update_todo", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        let mut stmt = conn
            .prepare("SELECT id, title, content, due_date, status, priority, recurrence, recurrence_from, recurrence_index, sort_order, created_at, updated_at FROM todos WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let todo: Todo = stmt
            .query_row([&id], |row| {
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

        let new_title = title.unwrap_or(todo.title);
        let new_content = content.or(todo.content);
        let new_due_date = due_date.or(todo.due_date);
        let new_status = status.unwrap_or(todo.status);
        let new_priority = priority.unwrap_or(todo.priority);
        let new_recurrence = recurrence.or(todo.recurrence);
        let new_recurrence_from = recurrence_from.or(todo.recurrence_from);
        let new_recurrence_index = recurrence_index.or(todo.recurrence_index);

        conn.execute(
            "UPDATE todos SET title = ?, content = ?, due_date = ?, status = ?, priority = ?, recurrence = ?, recurrence_from = ?, recurrence_index = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![new_title, new_content, new_due_date, new_status, new_priority, new_recurrence, new_recurrence_from, new_recurrence_index, now, id],
        ).map_err(|e| e.to_string())?;

        Ok(Todo {
            id: todo.id,
            title: new_title,
            content: new_content,
            due_date: new_due_date,
            status: new_status,
            priority: new_priority,
            recurrence: new_recurrence,
            recurrence_from: new_recurrence_from,
            recurrence_index: new_recurrence_index,
            sort_order: todo.sort_order,
            created_at: todo.created_at,
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn delete_todo(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_todo", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM todos WHERE id = ?", [&id])
            .map_err(|e| e.to_string())?;
        Ok(())
    })
}

#[tauri::command]
pub fn update_todo_sort_order(
    state: tauri::State<AppState>,
    id: String,
    sort_order: i32,
) -> Result<(), String> {
    log_command!("update_todo_sort_order", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "UPDATE todos SET sort_order = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![sort_order, now, id],
        )
        .map_err(|e| e.to_string())?;

        Ok(())
    })
}

#[tauri::command]
pub fn reorder_todos(
    state: tauri::State<AppState>,
    orders: Vec<(String, i32)>, // (id, sort_order) pairs
) -> Result<usize, String> {
    log_command!("reorder_todos", {
        let mut conn = state.db.lock().map_err(|e| e.to_string())?;
        let tx = conn.transaction().map_err(|e| e.to_string())?;
        let mut count = 0;

        for (id, sort_order) in orders {
            tx.execute(
                "UPDATE todos SET sort_order = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![sort_order, chrono::Utc::now().to_rfc3339(), id],
            )
            .map_err(|e| e.to_string())?;
            count += 1;
        }

        tx.commit().map_err(|e| e.to_string())?;
        Ok(count)
    })
}
