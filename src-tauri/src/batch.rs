// Batch operations commands

use crate::AppState;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct BatchUpdateResult {
    pub updated: i32,
    pub failed: Vec<BatchFailedItem>,
}

#[derive(Debug, Serialize)]
pub struct BatchFailedItem {
    pub id: String,
    pub error: String,
}

#[tauri::command]
pub fn bulk_update_todo_status(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: String,
) -> Result<BatchUpdateResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut updated = 0;
    let mut failed: Vec<BatchFailedItem> = Vec::new();

    for id in ids {
        let result = conn.execute(
            "UPDATE todos SET status = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![status, now, id],
        );

        match result {
            Ok(rows) if rows > 0 => updated += 1,
            Ok(_) => failed.push(BatchFailedItem {
                id,
                error: "Not found".to_string(),
            }),
            Err(e) => failed.push(BatchFailedItem {
                id,
                error: e.to_string(),
            }),
        }
    }

    Ok(BatchUpdateResult { updated, failed })
}

#[tauri::command]
pub fn bulk_update_task_status(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: String,
) -> Result<BatchUpdateResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut updated = 0;
    let mut failed: Vec<BatchFailedItem> = Vec::new();

    for id in ids {
        let result = conn.execute(
            "UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![status, now, id],
        );

        match result {
            Ok(rows) if rows > 0 => updated += 1,
            Ok(_) => failed.push(BatchFailedItem {
                id,
                error: "Not found".to_string(),
            }),
            Err(e) => failed.push(BatchFailedItem {
                id,
                error: e.to_string(),
            }),
        }
    }

    Ok(BatchUpdateResult { updated, failed })
}

#[tauri::command]
pub fn bulk_update_step_status(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: String,
) -> Result<BatchUpdateResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut updated = 0;
    let mut failed: Vec<BatchFailedItem> = Vec::new();

    for id in ids {
        let result = conn.execute(
            "UPDATE steps SET status = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![status, now, id],
        );

        match result {
            Ok(rows) if rows > 0 => updated += 1,
            Ok(_) => failed.push(BatchFailedItem {
                id,
                error: "Not found".to_string(),
            }),
            Err(e) => failed.push(BatchFailedItem {
                id,
                error: e.to_string(),
            }),
        }
    }

    Ok(BatchUpdateResult { updated, failed })
}

#[tauri::command]
pub fn bulk_delete_todos(
    state: tauri::State<AppState>,
    ids: Vec<String>,
) -> Result<BatchUpdateResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut deleted = 0;
    let mut failed: Vec<BatchFailedItem> = Vec::new();

    for id in ids {
        let result = conn.execute("DELETE FROM todos WHERE id = ?", [&id]);

        match result {
            Ok(rows) if rows > 0 => deleted += 1,
            Ok(_) => failed.push(BatchFailedItem {
                id,
                error: "Not found".to_string(),
            }),
            Err(e) => failed.push(BatchFailedItem {
                id,
                error: e.to_string(),
            }),
        }
    }

    Ok(BatchUpdateResult {
        updated: deleted,
        failed,
    })
}

#[tauri::command]
pub fn bulk_delete_tasks(
    state: tauri::State<AppState>,
    ids: Vec<String>,
) -> Result<BatchUpdateResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut deleted = 0;
    let mut failed: Vec<BatchFailedItem> = Vec::new();

    for id in ids {
        let result = conn.execute("DELETE FROM tasks WHERE id = ?", [&id]);

        match result {
            Ok(rows) if rows > 0 => deleted += 1,
            Ok(_) => failed.push(BatchFailedItem {
                id,
                error: "Not found".to_string(),
            }),
            Err(e) => failed.push(BatchFailedItem {
                id,
                error: e.to_string(),
            }),
        }
    }

    Ok(BatchUpdateResult {
        updated: deleted,
        failed,
    })
}
