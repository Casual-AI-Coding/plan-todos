use crate::models::Milestone;
use rusqlite::params;

/// Repository for Milestone data access
pub struct MilestoneRepository;

impl MilestoneRepository {
    /// Calculate progress for a milestone based on its linked entity
    pub fn calculate_progress(
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

    /// Get a milestone by ID
    pub fn get_by_id(conn: &rusqlite::Connection, id: &str) -> Result<Milestone, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, target_date, biz_type, biz_id, status, created_at, updated_at FROM milestones WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        stmt.query_row([id], |row| {
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
        .map_err(|e| e.to_string())
    }

    /// Get all milestones
    pub fn get_all(conn: &rusqlite::Connection) -> Result<Vec<Milestone>, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, target_date, biz_type, biz_id, status, created_at, updated_at FROM milestones",
            )
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
                    progress: 0,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        milestone_iter
            .collect::<Result<Vec<Milestone>, _>>()
            .map_err(|e| e.to_string())
    }

    /// Get milestone with calculated progress
    pub fn get_by_id_with_progress(
        conn: &rusqlite::Connection,
        id: &str,
    ) -> Result<Milestone, String> {
        let milestone = Self::get_by_id(conn, id)?;
        let progress = Self::calculate_progress(conn, &milestone)?;
        Ok(Milestone {
            progress,
            ..milestone
        })
    }

    /// Get all milestones with calculated progress (batched to avoid N+1 queries)
    pub fn get_all_with_progress(conn: &rusqlite::Connection) -> Result<Vec<Milestone>, String> {
        let mut milestones = Self::get_all(conn)?;

        if milestones.is_empty() {
            return Ok(milestones);
        }

        // Collect biz_ids grouped by biz_type for batch querying
        let mut plan_ids: Vec<&str> = Vec::new();
        let mut task_ids: Vec<&str> = Vec::new();
        let mut target_ids: Vec<&str> = Vec::new();

        for m in &milestones {
            if let (Some(biz_type), Some(biz_id)) = (&m.biz_type, &m.biz_id) {
                match biz_type.as_str() {
                    "plan" => plan_ids.push(biz_id),
                    "task" => task_ids.push(biz_id),
                    "target" => target_ids.push(biz_id),
                    _ => {}
                }
            }
        }

        // Batch query: plan progress (COUNT + SUM for tasks by plan_id)
        use std::collections::HashMap;
        let mut plan_progress: HashMap<String, i32> = HashMap::new();
        if !plan_ids.is_empty() {
            let placeholders: Vec<&str> = plan_ids.iter().map(|_| "?").collect();
            let sql = format!(
                "SELECT plan_id, COUNT(*), SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) \
                 FROM tasks WHERE plan_id IN ({}) GROUP BY plan_id",
                placeholders.join(",")
            );
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(rusqlite::params_from_iter(plan_ids.iter()), |row| {
                    let plan_id: String = row.get(0)?;
                    let total: i32 = row.get(1)?;
                    let done: i32 = row.get(2)?;
                    Ok((plan_id, if total == 0 { 0 } else { (done * 100) / total }))
                })
                .map_err(|e| e.to_string())?;
            for row in rows {
                let (id, progress) = row.map_err(|e| e.to_string())?;
                plan_progress.insert(id, progress);
            }
        }

        // Batch query: task status
        let mut task_status: HashMap<String, i32> = HashMap::new();
        if !task_ids.is_empty() {
            let placeholders: Vec<&str> = task_ids.iter().map(|_| "?").collect();
            let sql = format!(
                "SELECT id, status FROM tasks WHERE id IN ({})",
                placeholders.join(",")
            );
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(rusqlite::params_from_iter(task_ids.iter()), |row| {
                    let id: String = row.get(0)?;
                    let status: String = row.get(1)?;
                    Ok((id, if status == "done" { 100 } else { 0 }))
                })
                .map_err(|e| e.to_string())?;
            for row in rows {
                let (id, progress) = row.map_err(|e| e.to_string())?;
                task_status.insert(id, progress);
            }
        }

        // Batch query: target progress
        let mut target_progress: HashMap<String, i32> = HashMap::new();
        if !target_ids.is_empty() {
            let placeholders: Vec<&str> = target_ids.iter().map(|_| "?").collect();
            let sql = format!(
                "SELECT id, progress FROM targets WHERE id IN ({})",
                placeholders.join(",")
            );
            let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
            let rows = stmt
                .query_map(rusqlite::params_from_iter(target_ids.iter()), |row| {
                    let id: String = row.get(0)?;
                    let progress: i32 = row.get(1)?;
                    Ok((id, progress))
                })
                .map_err(|e| e.to_string())?;
            for row in rows {
                let (id, progress) = row.map_err(|e| e.to_string())?;
                target_progress.insert(id, progress);
            }
        }

        // Map progress back to milestones
        for milestone in &mut milestones {
            milestone.progress =
                if let (Some(biz_type), Some(biz_id)) = (&milestone.biz_type, &milestone.biz_id) {
                    match biz_type.as_str() {
                        "plan" => plan_progress.get(biz_id).copied().unwrap_or(0),
                        "task" => task_status.get(biz_id).copied().unwrap_or(0),
                        "target" => target_progress.get(biz_id).copied().unwrap_or(0),
                        _ => 0,
                    }
                } else {
                    0
                };
        }

        Ok(milestones)
    }

    /// Create a new milestone
    pub fn create(
        conn: &rusqlite::Connection,
        id: &str,
        title: &str,
        target_date: Option<&str>,
        biz_type: Option<&str>,
        biz_id: Option<&str>,
    ) -> Result<Milestone, String> {
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO milestones (id, title, target_date, biz_type, biz_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)",
            params![id, title, target_date, biz_type, biz_id, now, now],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    /// Update an existing milestone
    pub fn update(
        conn: &rusqlite::Connection,
        id: &str,
        title: Option<&str>,
        target_date: Option<&str>,
        biz_type: Option<&str>,
        biz_id: Option<&str>,
        status: Option<&str>,
    ) -> Result<Milestone, String> {
        let existing = Self::get_by_id(conn, id)?;
        let now = chrono::Utc::now().to_rfc3339();

        let new_title = title.unwrap_or(&existing.title);
        let new_target_date = target_date.or(existing.target_date.as_deref());
        let new_biz_type = biz_type.or(existing.biz_type.as_deref());
        let new_biz_id = biz_id.or(existing.biz_id.as_deref());
        let new_status = status.unwrap_or(&existing.status);

        conn.execute(
            "UPDATE milestones SET title = ?, target_date = ?, biz_type = ?, biz_id = ?, status = ?, updated_at = ? WHERE id = ?",
            params![new_title, new_target_date, new_biz_type, new_biz_id, new_status, now, id],
        )
        .map_err(|e| e.to_string())?;

        // Build milestone for progress calculation
        let milestone_for_calc = Milestone {
            id: existing.id.clone(),
            title: existing.title.clone(),
            target_date: existing.target_date.clone(),
            biz_type: new_biz_type.map(|s| s.to_string()),
            biz_id: new_biz_id.map(|s| s.to_string()),
            status: existing.status.clone(),
            progress: 0,
            created_at: existing.created_at.clone(),
            updated_at: existing.updated_at.clone(),
        };

        let progress = Self::calculate_progress(conn, &milestone_for_calc)?;

        Ok(Milestone {
            id: existing.id,
            title: new_title.to_string(),
            target_date: new_target_date.map(|s| s.to_string()),
            biz_type: new_biz_type.map(|s| s.to_string()),
            biz_id: new_biz_id.map(|s| s.to_string()),
            status: new_status.to_string(),
            progress,
            created_at: existing.created_at,
            updated_at: now,
        })
    }

    /// Delete a milestone
    pub fn delete(conn: &rusqlite::Connection, id: &str) -> Result<(), String> {
        conn.execute("DELETE FROM milestones WHERE id = ?", [id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
