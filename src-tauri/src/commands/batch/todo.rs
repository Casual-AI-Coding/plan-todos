use crate::commands::batch::{BatchFailedItem, BatchUpdateResult};
use crate::commands::todo_status;
use crate::log_command;
use crate::AppState;
use serde::Deserialize;

const VALID_PRIORITIES: &[&str] = &["P0", "P1", "P2", "P3"];

fn validate_priority(priority: &str) -> Result<(), String> {
    if !VALID_PRIORITIES.contains(&priority) {
        Err(format!(
            "Invalid priority: '{}'. Valid values: {:?}",
            priority, VALID_PRIORITIES
        ))
    } else {
        Ok(())
    }
}

#[tauri::command]
pub fn bulk_update_todo_status(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: String,
) -> Result<BatchUpdateResult, String> {
    todo_status::validate_todo_status(&status)?;

    log_command!("bulk_update_todo_status", {
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
    })
}

#[tauri::command]
pub fn bulk_delete_todos(
    state: tauri::State<AppState>,
    ids: Vec<String>,
) -> Result<BatchUpdateResult, String> {
    log_command!("bulk_delete_todos", {
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
    })
}

#[derive(Debug, Deserialize)]
pub struct BulkTodoUpdates {
    pub status: Option<String>,
    pub priority: Option<String>,
    pub due_date: Option<String>,
}

#[tauri::command]
pub fn bulk_update_todos(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    updates: BulkTodoUpdates,
) -> Result<BatchUpdateResult, String> {
    if let Some(ref status) = updates.status {
        todo_status::validate_todo_status(status)?;
    }
    if let Some(ref priority) = updates.priority {
        validate_priority(priority)?;
    }

    log_command!("bulk_update_todos", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        let mut updated = 0;
        let mut failed: Vec<BatchFailedItem> = Vec::new();

        for id in ids {
            let mut set_clauses: Vec<&str> = vec!["updated_at = ?"];
            let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now.clone())];

            if let Some(ref status) = updates.status {
                set_clauses.push("status = ?");
                params.push(Box::new(status.clone()));
            }

            if let Some(ref priority) = updates.priority {
                set_clauses.push("priority = ?");
                params.push(Box::new(priority.clone()));
            }

            if let Some(ref due_date) = updates.due_date {
                set_clauses.push("due_date = ?");
                params.push(Box::new(due_date.clone()));
            }

            let sql = format!("UPDATE todos SET {} WHERE id = ?", set_clauses.join(", "));
            params.push(Box::new(id.clone()));

            let result = conn.execute(
                &sql,
                rusqlite::params_from_iter(params.iter().map(|p| p.as_ref())),
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
    })
}
