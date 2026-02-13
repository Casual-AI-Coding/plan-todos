// Plan CRUD commands

use crate::models::Plan;
use crate::AppState;

#[tauri::command]
pub fn get_plans(state: tauri::State<AppState>) -> Result<Vec<Plan>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare("SELECT id, title, description, start_date, end_date, status, created_at, updated_at FROM plans")
        .map_err(|e| e.to_string())?;

    let plan_iter = stmt
        .query_map([], |row| {
            Ok(Plan {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_date: row.get(3)?,
                end_date: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(plan_iter.filter_map(|p| p.ok()).collect())
}

#[tauri::command]
pub fn create_plan(
    state: tauri::State<AppState>,
    title: String,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
) -> Result<Plan, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let id = uuid::Uuid::new_v4().to_string();
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)",
        rusqlite::params![id, title, description, start_date, end_date, now, now],
    ).map_err(|e| e.to_string())?;

    Ok(Plan {
        id,
        title,
        description,
        start_date,
        end_date,
        status: "active".to_string(),
        created_at: now.clone(),
        updated_at: now,
    })
}

#[tauri::command]
pub fn update_plan(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    description: Option<String>,
    start_date: Option<String>,
    end_date: Option<String>,
    status: Option<String>,
) -> Result<Plan, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    let now = chrono::Utc::now().to_rfc3339();

    let mut stmt = conn
        .prepare("SELECT id, title, description, start_date, end_date, status, created_at, updated_at FROM plans WHERE id = ?")
        .map_err(|e| e.to_string())?;

    let plan: Plan = stmt
        .query_row([&id], |row| {
            Ok(Plan {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_date: row.get(3)?,
                end_date: row.get(4)?,
                status: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let new_title = title.unwrap_or(plan.title);
    let new_description = description.or(plan.description);
    let new_start_date = start_date.or(plan.start_date);
    let new_end_date = end_date.or(plan.end_date);
    let new_status = status.unwrap_or(plan.status);

    conn.execute(
        "UPDATE plans SET title = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = ? WHERE id = ?",
        rusqlite::params![new_title, new_description, new_start_date, new_end_date, new_status, now, id],
    ).map_err(|e| e.to_string())?;

    Ok(Plan {
        id: plan.id,
        title: new_title,
        description: new_description,
        start_date: new_start_date,
        end_date: new_end_date,
        status: new_status,
        created_at: plan.created_at,
        updated_at: now,
    })
}

#[tauri::command]
pub fn delete_plan(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.execute("DELETE FROM tasks WHERE plan_id = ?", [&id])
        .map_err(|e| e.to_string())?;
    conn.execute("DELETE FROM plans WHERE id = ?", [&id])
        .map_err(|e| e.to_string())?;

    Ok(())
}
