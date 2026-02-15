// Milestone CRUD commands

use crate::log_command;
use crate::models::Milestone;
use crate::AppState;

pub fn calculate_milestone_progress(
    conn: &rusqlite::Connection,
    milestone: &Milestone,
) -> Result<i32, String> {
    // If not linked to any entity, return 0
    let (Some(biz_type), Some(biz_id)) = (&milestone.biz_type, &milestone.biz_id) else {
        return Ok(0);
    };

    match biz_type.as_str() {
        // If linked to Plan, calculate from Tasks
        "plan" => {
            let mut stmt = conn
                .prepare("SELECT COUNT(*), SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) FROM tasks WHERE plan_id = ?")
                .map_err(|e| e.to_string())?;

            let (total, done): (i32, i32) = stmt
                .query_row([biz_id], |row| Ok((row.get(0)?, row.get(1)?)))
                .map_err(|e| e.to_string())?;

            if total == 0 {
                return Ok(0);
            }
            Ok((done * 100) / total)
        }
        // If linked to Task, return status as progress (0 or 100)
        "task" => {
            let mut stmt = conn
                .prepare("SELECT status FROM tasks WHERE id = ?")
                .map_err(|e| e.to_string())?;

            let status: String = stmt
                .query_row([biz_id], |row| row.get(0))
                .map_err(|e| e.to_string())?;

            Ok(if status == "done" { 100 } else { 0 })
        }
        // If linked to Target, use target progress
        "target" => {
            let mut stmt = conn
                .prepare("SELECT progress FROM targets WHERE id = ?")
                .map_err(|e| e.to_string())?;

            let progress: i32 = stmt
                .query_row([biz_id], |row| row.get(0))
                .map_err(|e| e.to_string())?;

            Ok(progress)
        }
        // For other types (e.g., circulation), return 0
        _ => Ok(0),
    }
}

#[tauri::command]
pub fn get_milestone(state: tauri::State<AppState>, id: String) -> Result<Milestone, String> {
    log_command!("get_milestone", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id, title, target_date, biz_type, biz_id, status, created_at, updated_at FROM milestones WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let milestone: Milestone = stmt
            .query_row([&id], |row| {
                Ok(Milestone {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    target_date: row.get(2)?,
                    biz_type: row.get(3)?,
                    biz_id: row.get(4)?,
                    status: row.get(5)?,
                    progress: 0,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        // Calculate progress
        let progress = calculate_milestone_progress(&conn, &milestone)?;
        Ok(Milestone {
            progress,
            ..milestone
        })
    })
}

#[tauri::command]
pub fn get_milestones(state: tauri::State<AppState>) -> Result<Vec<Milestone>, String> {
    log_command!("get_milestones", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id, title, target_date, biz_type, biz_id, status, created_at, updated_at FROM milestones")
            .map_err(|e| e.to_string())?;

        let milestone_iter = stmt
            .query_map([], |row| {
                Ok(Milestone {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    target_date: row.get(2)?,
                    biz_type: row.get(3)?,
                    biz_id: row.get(4)?,
                    status: row.get(5)?,
                    progress: 0, // Will be calculated
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut milestones: Vec<Milestone> = milestone_iter.filter_map(|m| m.ok()).collect();

        // Calculate progress for each milestone
        for milestone in &mut milestones {
            milestone.progress = calculate_milestone_progress(&conn, milestone)?;
        }

        Ok(milestones)
    })
}

#[tauri::command]
pub fn create_milestone(
    state: tauri::State<AppState>,
    title: String,
    target_date: Option<String>,
    biz_type: Option<String>,
    biz_id: Option<String>,
) -> Result<Milestone, String> {
    log_command!("create_milestone", {
        // Validate: if biz_type is set, biz_id must also be set (and vice versa)
        let has_biz = biz_type.is_some() || biz_id.is_some();
        if has_biz && (biz_type.is_none() || biz_id.is_none()) {
            return Err("Both biz_type and biz_id must be set together, or neither".to_string());
        }

        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO milestones (id, title, target_date, biz_type, biz_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)",
            rusqlite::params![id, title, target_date, biz_type, biz_id, now, now],
        ).map_err(|e| e.to_string())?;

        Ok(Milestone {
            id,
            title,
            target_date,
            biz_type,
            biz_id,
            status: "pending".to_string(),
            progress: 0,
            created_at: now.clone(),
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn update_milestone(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    target_date: Option<String>,
    biz_type: Option<String>,
    biz_id: Option<String>,
    status: Option<String>,
) -> Result<Milestone, String> {
    log_command!("update_milestone", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        let mut stmt = conn
            .prepare("SELECT id, title, target_date, biz_type, biz_id, status, created_at, updated_at FROM milestones WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let milestone: Milestone = stmt
            .query_row([&id], |row| {
                Ok(Milestone {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    target_date: row.get(2)?,
                    biz_type: row.get(3)?,
                    biz_id: row.get(4)?,
                    status: row.get(5)?,
                    progress: 0,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let new_title = title.unwrap_or(milestone.title.clone());
        let new_target_date = target_date.or(milestone.target_date.clone());
        let new_biz_type = biz_type.or(milestone.biz_type.clone());
        let new_biz_id = biz_id.or(milestone.biz_id.clone());
        let new_status = status.unwrap_or(milestone.status.clone());

        conn.execute(
            "UPDATE milestones SET title = ?, target_date = ?, biz_type = ?, biz_id = ?, status = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![new_title, new_target_date, new_biz_type, new_biz_id, new_status, now, id],
        )
        .map_err(|e| e.to_string())?;

        // Clone for calculate function
        let milestone_for_calc = Milestone {
            id: milestone.id.clone(),
            title: milestone.title.clone(),
            target_date: milestone.target_date.clone(),
            biz_type: new_biz_type.clone(),
            biz_id: new_biz_id.clone(),
            status: milestone.status.clone(),
            progress: milestone.progress,
            created_at: milestone.created_at.clone(),
            updated_at: milestone.updated_at.clone(),
        };
        let progress = calculate_milestone_progress(&conn, &milestone_for_calc)?;

        Ok(Milestone {
            id: milestone.id,
            title: new_title,
            target_date: new_target_date,
            biz_type: new_biz_type,
            biz_id: new_biz_id,
            status: new_status,
            progress,
            created_at: milestone.created_at,
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn delete_milestone(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_milestone", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM milestones WHERE id = ?", [&id])
            .map_err(|e| e.to_string())?;
        Ok(())
    })
}
