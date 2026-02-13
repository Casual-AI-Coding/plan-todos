// Target CRUD commands

use crate::models::Target;
use crate::AppState;

pub fn calculate_target_progress(
    conn: &rusqlite::Connection,
    target_id: &str,
) -> Result<i32, String> {
    let mut stmt = conn
        .prepare("SELECT weight, status FROM steps WHERE target_id = ?")
        .map_err(|e| e.to_string())?;

    let step_iter = stmt
        .query_map([target_id], |row| {
            Ok((row.get::<_, i32>(0)?, row.get::<_, String>(1)?))
        })
        .map_err(|e| e.to_string())?;

    let mut total_weight = 0;
    let mut completed_weight = 0;

    for step in step_iter.filter_map(|s| s.ok()) {
        total_weight += step.0;
        if step.1 == "completed" {
            completed_weight += step.0;
        }
    }

    if total_weight == 0 {
        return Ok(0);
    }

    Ok((completed_weight * 100) / total_weight)
}

#[tauri::command]
pub fn get_target(state: tauri::State<AppState>, id: String) -> Result<Target, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, description, due_date, status, created_at, updated_at FROM targets WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let target: Target = stmt
        .query_row([&id], |row| {
            Ok(Target {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                progress: 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    // Calculate progress
    let progress = calculate_target_progress(&conn, &id)?;
    Ok(Target { progress, ..target })
}

#[tauri::command]
pub fn get_targets(state: tauri::State<AppState>) -> Result<Vec<Target>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT id, title, description, due_date, status, created_at, updated_at FROM targets",
        )
        .map_err(|e| e.to_string())?;

    let target_iter = stmt
        .query_map([], |row| {
            Ok(Target {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                progress: 0, // Will be calculated
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut targets: Vec<Target> = target_iter.filter_map(|t| t.ok()).collect();

    // Calculate progress for each target
    for target in &mut targets {
        target.progress = calculate_target_progress(&conn, &target.id)?;
    }

    Ok(targets)
}

#[tauri::command]
pub fn create_target(
    state: tauri::State<AppState>,
    title: String,
    description: Option<String>,
    due_date: Option<String>,
) -> Result<Target, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO targets (id, title, description, due_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', ?, ?)",
        rusqlite::params![id, title, description, due_date, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Target {
        id,
        title,
        description,
        due_date,
        status: "active".to_string(),
        progress: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_target(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    due_date: Option<String>,
    status: Option<String>,
) -> Result<Target, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, title, description, due_date, status, created_at, updated_at FROM targets WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let target: Target = stmt
        .query_row([&id], |row| {
            Ok(Target {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                progress: 0,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(target.title);
    let new_description = description.or(target.description);
    let new_due_date = due_date.or(target.due_date);
    let new_status = status.unwrap_or(target.status);

    conn.execute(
        "UPDATE targets SET title = ?, description = ?, due_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_description, new_due_date, new_status, now, id],
    ).map_err(|e| e.to_string())?;

    let progress = calculate_target_progress(&conn, &id)?;

    Ok(Target {
        id: target.id,
        title: new_title,
        description: new_description,
        due_date: new_due_date,
        status: new_status,
        progress,
        created_at: target.created_at,
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_target(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    // Steps will be cascade deleted
    conn.execute("DELETE FROM targets WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
