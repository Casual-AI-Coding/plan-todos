use crate::commands::batch::{BatchFailedItem, BatchUpdateResult};
use crate::log_command;
use crate::AppState;

const VALID_TARGET_STATUSES: &[&str] = &["active", "completed", "abandoned", "archived"];

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

#[tauri::command]
pub fn bulk_update_targets(
    state: tauri::State<AppState>,
    ids: Vec<String>,
    status: Option<String>,
    archived: Option<bool>,
) -> Result<BatchUpdateResult, String> {
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
