// Batch operations commands

use crate::commands::todo_status;
use crate::log_command;
use crate::AppState;
use serde::Deserialize;
use serde::Serialize;

// Valid values for status and priority
const VALID_PLAN_STATUSES: &[&str] = &["draft", "active", "completed", "archived"];
const VALID_TARGET_STATUSES: &[&str] = &["active", "completed", "abandoned", "archived"];
const VALID_PRIORITIES: &[&str] = &["P0", "P1", "P2", "P3"];

fn validate_plan_status(status: &str) -> Result<(), String> {
    if !VALID_PLAN_STATUSES.contains(&status) {
        Err(format!(
            "Invalid plan status: '{}'. Valid values: {:?}",
            status, VALID_PLAN_STATUSES
        ))
    } else {
        Ok(())
    }
}

fn validate_target_status(status: &str) -> Result<(), String> {
    if !VALID_TARGET_STATUSES.contains(&status) {
        Err(format!(
            "Invalid target status: '{}'. Valid values: {:?}",
            status, VALID_TARGET_STATUSES
        ))
    } else {
        Ok(())
    }
}

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
    // Validate status
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
pub fn bulk_update_task_status(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: String,
) -> Result<BatchUpdateResult, String> {
    log_command!("bulk_update_task_status", {
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
    })
}

#[tauri::command]
pub fn bulk_update_step_status(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: String,
) -> Result<BatchUpdateResult, String> {
    log_command!("bulk_update_step_status", {
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

#[tauri::command]
pub fn bulk_delete_tasks(
    state: tauri::State<AppState>,
    ids: Vec<String>,
) -> Result<BatchUpdateResult, String> {
    log_command!("bulk_delete_tasks", {
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
    // Validate inputs
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
            // Build dynamic SET clause
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

#[tauri::command]
pub fn bulk_update_plans(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: Option<String>,
    archived: Option<bool>,
) -> Result<BatchUpdateResult, String> {
    // Validate status if provided
    if let Some(ref s) = status {
        validate_plan_status(s)?;
    }

    log_command!("bulk_update_plans", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        let mut updated = 0;
        let mut failed: Vec<BatchFailedItem> = Vec::new();

        for id in ids {
            let final_status = if let Some(true) = archived {
                "archived".to_string()
            } else {
                status.clone().unwrap_or_else(|| "active".to_string())
            };

            let result = conn.execute(
                "UPDATE plans SET status = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![final_status, now, id],
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
pub fn bulk_delete_plans(
    state: tauri::State<AppState>,
    ids: Vec<String>,
) -> Result<BatchUpdateResult, String> {
    log_command!("bulk_delete_plans", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut deleted = 0;
        let mut failed: Vec<BatchFailedItem> = Vec::new();

        for id in ids {
            // Delete tasks first (cascade should handle this, but being explicit)
            let _ = conn.execute("DELETE FROM tasks WHERE plan_id = ?", [&id]);
            let result = conn.execute("DELETE FROM plans WHERE id = ?", [&id]);

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

#[tauri::command]
pub fn bulk_update_targets(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: Option<String>,
    archived: Option<bool>,
) -> Result<BatchUpdateResult, String> {
    // Validate status if provided
    if let Some(ref s) = status {
        validate_target_status(s)?;
    }

    log_command!("bulk_update_targets", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        let mut updated = 0;
        let mut failed: Vec<BatchFailedItem> = Vec::new();

        for id in ids {
            let final_status = if let Some(true) = archived {
                "archived".to_string()
            } else {
                status.clone().unwrap_or_else(|| "active".to_string())
            };

            let result = conn.execute(
                "UPDATE targets SET status = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![final_status, now, id],
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
pub fn bulk_delete_targets(
    state: tauri::State<AppState>,
    ids: Vec<String>,
) -> Result<BatchUpdateResult, String> {
    log_command!("bulk_delete_targets", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut deleted = 0;
        let mut failed: Vec<BatchFailedItem> = Vec::new();

        for id in ids {
            // Steps will be cascade deleted
            let result = conn.execute("DELETE FROM targets WHERE id = ?", [&id]);

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
