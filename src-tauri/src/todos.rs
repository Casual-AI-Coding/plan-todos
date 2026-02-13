// Todo CRUD commands

use crate::models::Todo;
use crate::AppState;

#[tauri::command]
pub fn get_todos(state: tauri::State<AppState>) -> Result<Vec<Todo>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, content, due_date, status, created_at, updated_at FROM todos")
        .map_err(|e| e.to_string())?;

    let todo_iter = stmt
        .query_map([], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(todo_iter.filter_map(|t| t.ok()).collect())
}

#[tauri::command]
pub fn create_todo(
    state: tauri::State<AppState>,
    title: String,
    content: Option<String>,
    due_date: Option<String>,
) -> Result<Todo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO todos (id, title, content, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?)",
        rusqlite::params![id, title, content, due_date, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Todo {
        id,
        title,
        content,
        due_date,
        status: "pending".to_string(),
        created_at: now.clone(),
        updated_at: now,
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
) -> Result<Todo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, title, content, due_date, status, created_at, updated_at FROM todos WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let todo: Todo = stmt
        .query_row([&id], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(todo.title);
    let new_content = content.or(todo.content);
    let new_due_date = due_date.or(todo.due_date);
    let new_status = status.unwrap_or(todo.status);

    conn.execute(
        "UPDATE todos SET title = ?, content = ?, due_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_content, new_due_date, new_status, now, id],
    ).map_err(|e| e.to_string())?;

    Ok(Todo {
        id: todo.id,
        title: new_title,
        content: new_content,
        due_date: new_due_date,
        status: new_status,
        created_at: todo.created_at,
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_todo(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM todos WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
