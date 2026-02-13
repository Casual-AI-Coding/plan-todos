// Step CRUD commands

use crate::log_command;
use crate::models::Step;
use crate::AppState;

#[tauri::command]
pub fn get_steps(state: tauri::State<AppState>, target_id: String) -> Result<Vec<Step>, String> {
    log_command!("get_steps", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id, target_id, title, weight, status, created_at, updated_at FROM steps WHERE target_id = ?")
            .map_err(|e| e.to_string())?;

        let step_iter = stmt
            .query_map([&target_id], |row| {
                Ok(Step {
                    id: row.get(0)?,
                    target_id: row.get(1)?,
                    title: row.get(2)?,
                    weight: row.get(3)?,
                    status: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            })
            .map_err(|e| e.to_string())?;

        Ok(step_iter.filter_map(|s| s.ok()).collect())
    })
}

#[tauri::command]
pub fn create_step(
    state: tauri::State<AppState>,
    target_id: String,
    title: String,
    weight: i32,
) -> Result<Step, String> {
    log_command!("create_step", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        // Validate weight sum (existing + new <= 100)
        let mut stmt = conn
            .prepare("SELECT COALESCE(SUM(weight), 0) FROM steps WHERE target_id = ?")
            .map_err(|e| e.to_string())?;

        let current_weight: i32 = stmt
            .query_row([&target_id], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        if current_weight + weight > 100 {
            return Err(format!(
                "Step weights would exceed 100%. Current: {}%, New: {}%",
                current_weight, weight
            ));
        }

        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO steps (id, target_id, title, weight, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'pending', ?, ?)",
            rusqlite::params![id, target_id, title, weight, now, now],
        ).map_err(|e| e.to_string())?;

        Ok(Step {
            id,
            target_id,
            title,
            weight,
            status: "pending".to_string(),
            created_at: now.clone(),
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn update_step(
    state: tauri::State<AppState>,
    id: String,
    _target_id: String,
    title: Option<String>,
    weight: Option<i32>,
    status: Option<String>,
) -> Result<Step, String> {
    log_command!("update_step", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        let mut stmt = conn
            .prepare("SELECT id, target_id, title, weight, status, created_at, updated_at FROM steps WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let step: Step = stmt
            .query_row([&id], |row| {
                Ok(Step {
                    id: row.get(0)?,
                    target_id: row.get(1)?,
                    title: row.get(2)?,
                    weight: row.get(3)?,
                    status: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let new_title = title.unwrap_or(step.title);
        let new_weight = weight.unwrap_or(step.weight);
        let new_status = status.unwrap_or(step.status);

        // Validate weight sum if weight is being changed
        if let Some(w) = weight {
            let mut check_stmt = conn
                .prepare(
                    "SELECT COALESCE(SUM(weight), 0) FROM steps WHERE target_id = ? AND id != ?",
                )
                .map_err(|e| e.to_string())?;

            let other_weight: i32 = check_stmt
                .query_row(rusqlite::params![step.target_id, id], |row| row.get(0))
                .map_err(|e| e.to_string())?;

            if other_weight + w > 100 {
                return Err(format!(
                    "Step weights would exceed 100%. Other steps: {}%, New: {}%",
                    other_weight, w
                ));
            }
        }

        conn.execute(
            "UPDATE steps SET title = ?, weight = ?, status = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![new_title, new_weight, new_status, now, id],
        )
        .map_err(|e| e.to_string())?;

        Ok(Step {
            id: step.id,
            target_id: step.target_id,
            title: new_title,
            weight: new_weight,
            status: new_status,
            created_at: step.created_at,
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn delete_step(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_step", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM steps WHERE id = ?", [&id])
            .map_err(|e| e.to_string())?;
        Ok(())
    })
}
