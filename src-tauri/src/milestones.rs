// Milestone CRUD commands

use crate::models::Milestone;
use crate::targets::calculate_target_progress;
use crate::AppState;

pub fn calculate_milestone_progress(
    conn: &rusqlite::Connection,
    milestone: &Milestone,
) -> Result<i32, String> {
    // If linked to Plan, calculate from Tasks
    if let Some(ref plan_id) = milestone.plan_id {
        let mut stmt = conn
            .prepare("SELECT COUNT(*), SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) FROM tasks WHERE plan_id = ?")
            .map_err(|e| e.to_string())?;

        let (total, done): (i32, i32) = stmt
            .query_row([plan_id], |row| Ok((row.get(0)?, row.get(1)?)))
            .map_err(|e| e.to_string())?;

        if total == 0 {
            return Ok(0);
        }
        return Ok((done * 100) / total);
    }

    // If linked to Task, return status as progress (0 or 100)
    if let Some(ref task_id) = milestone.task_id {
        let mut stmt = conn
            .prepare("SELECT status FROM tasks WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let status: String = stmt
            .query_row([task_id], |row| row.get(0))
            .map_err(|e| e.to_string())?;

        return Ok(if status == "done" { 100 } else { 0 });
    }

    // If linked to Target, use target progress
    if let Some(ref target_id) = milestone.target_id {
        return calculate_target_progress(conn, target_id);
    }

    Ok(0)
}

#[tauri::command]
pub fn get_milestone(state: tauri::State<AppState>, id: String) -> Result<Milestone, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at FROM milestones WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let milestone: Milestone = stmt
        .query_row([&id], |row| {
            Ok(Milestone {
                id: row.get(0)?,
                title: row.get(1)?,
                target_date: row.get(2)?,
                plan_id: row.get(3)?,
                task_id: row.get(4)?,
                target_id: row.get(5)?,
                status: row.get(6)?,
                progress: 0,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    // Calculate progress
    let progress = calculate_milestone_progress(&conn, &milestone)?;
    Ok(Milestone {
        progress,
        ..milestone
    })
}

#[tauri::command]
pub fn get_milestones(state: tauri::State<AppState>) -> Result<Vec<Milestone>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at FROM milestones")
        .map_err(|e| e.to_string())?;

    let milestone_iter = stmt
        .query_map([], |row| {
            Ok(Milestone {
                id: row.get(0)?,
                title: row.get(1)?,
                target_date: row.get(2)?,
                plan_id: row.get(3)?,
                task_id: row.get(4)?,
                target_id: row.get(5)?,
                status: row.get(6)?,
                progress: 0, // Will be calculated
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut milestones: Vec<Milestone> = milestone_iter.filter_map(|m| m.ok()).collect();

    // Calculate progress for each milestone
    for milestone in &mut milestones {
        milestone.progress = calculate_milestone_progress(&conn, milestone)?;
    }

    Ok(milestones)
}

#[tauri::command]
pub fn create_milestone(
    state: tauri::State<AppState>,
    title: String,
    target_date: Option<String>,
    plan_id: Option<String>,
    task_id: Option<String>,
    target_id: Option<String>,
) -> Result<Milestone, String> {
    // Validate that exactly one of plan_id, task_id, target_id is set
    let link_count = [plan_id.is_some(), task_id.is_some(), target_id.is_some()]
        .iter()
        .filter(|&&x| x)
        .count();

    if link_count != 1 {
        return Err("Must specify exactly one of plan_id, task_id, or target_id".to_string());
    }

    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)",
        rusqlite::params![id, title, target_date, plan_id, task_id, target_id, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Milestone {
        id,
        title,
        target_date,
        plan_id,
        task_id,
        target_id,
        status: "pending".to_string(),
        progress: 0,
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_milestone(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    target_date: Option<String>,
    status: Option<String>,
) -> Result<Milestone, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at FROM milestones WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let milestone: Milestone = stmt
        .query_row([&id], |row| {
            Ok(Milestone {
                id: row.get(0)?,
                title: row.get(1)?,
                target_date: row.get(2)?,
                plan_id: row.get(3)?,
                task_id: row.get(4)?,
                target_id: row.get(5)?,
                status: row.get(6)?,
                progress: 0,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(milestone.title.clone());
    let new_target_date = target_date.or(milestone.target_date.clone());
    let new_status = status.unwrap_or(milestone.status.clone());

    conn.execute(
        "UPDATE milestones SET title = ?, target_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_target_date, new_status, now, id],
    )
    .map_err(|e| e.to_string())?;

    // Clone again for calculate function
    let milestone_for_calc = Milestone {
        id: milestone.id.clone(),
        title: milestone.title.clone(),
        target_date: milestone.target_date.clone(),
        plan_id: milestone.plan_id.clone(),
        task_id: milestone.task_id.clone(),
        target_id: milestone.target_id.clone(),
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
        plan_id: milestone.plan_id,
        task_id: milestone.task_id,
        target_id: milestone.target_id,
        status: new_status,
        progress,
        created_at: milestone.created_at,
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_milestone(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM milestones WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;
    Ok(())
}
