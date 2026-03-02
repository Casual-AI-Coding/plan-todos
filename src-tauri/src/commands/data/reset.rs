// Reset data command

use crate::AppState;
use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct ResetOptions {
    pub keep_tags: Option<bool>,
    pub keep_settings: Option<bool>,
}

impl Default for ResetOptions {
    fn default() -> Self {
        Self {
            keep_tags: Some(true),
            keep_settings: Some(true),
        }
    }
}

#[tauri::command]
pub fn reset_data(
    state: tauri::State<AppState>,
    options: Option<ResetOptions>,
) -> Result<(), String> {
    crate::log_command!("reset_data", {
        let opts = options.unwrap_or_default();
        let keep_tags = opts.keep_tags.unwrap_or(true);
        let keep_settings = opts.keep_settings.unwrap_or(true);

        let mut conn = state.db.lock().map_err(|e| e.to_string())?;

        // Wrap all database operations in a transaction
        let mut tx = conn.transaction().map_err(|e| e.to_string())?;

        // Clear all business data (in reverse order due to foreign keys)
        tx.execute("DELETE FROM circulation_logs", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM circulations", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM entity_tags", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM steps", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM tasks", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM targets", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM milestones", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM plans", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM todos", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM notification_settings", [])
            .map_err(|e| e.to_string())?;
        tx.execute("DELETE FROM schema_migrations", [])
            .map_err(|e| e.to_string())?;

        // Optionally keep tags
        if !keep_tags {
            tx.execute("DELETE FROM tags", [])
                .map_err(|e| e.to_string())?;
        }

        // Optionally keep settings (daily_summary_settings, notification_plugins)
        if !keep_settings {
            tx.execute("DELETE FROM daily_summary_settings", [])
                .map_err(|e| e.to_string())?;
            tx.execute("DELETE FROM notification_plugins", [])
                .map_err(|e| e.to_string())?;
        }

        // Re-seed default settings if they were kept
        if keep_settings {
            let count: i32 = tx
                .query_row("SELECT COUNT(*) FROM daily_summary_settings", [], |row| {
                    row.get(0)
                })
                .unwrap_or(0);
            if count == 0 {
                let now = chrono::Utc::now().to_rfc3339();
                tx.execute(
                    "INSERT INTO daily_summary_settings (id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    rusqlite::params!["default", 1, "09:00", 1, 1, 1, &now, &now],
                ).ok();
            }
        }

        // Commit the transaction
        tx.commit().map_err(|e| e.to_string())?;

        log::info!(
            "Data reset completed: keep_tags={}, keep_settings={}",
            keep_tags,
            keep_settings
        );
        Ok(())
    })
}
