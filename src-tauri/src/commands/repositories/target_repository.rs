use crate::models::Target;
use rusqlite::params;

pub struct TargetRepository;

impl TargetRepository {
    pub fn calculate_progress(conn: &rusqlite::Connection, target_id: &str) -> Result<i32, String> {
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

    pub fn get_by_id(conn: &rusqlite::Connection, id: &str) -> Result<Target, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, description, due_date, status, sort_order, created_at, updated_at FROM targets WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        let mut target: Target = stmt
            .query_row([id], |row| {
                Ok(Target {
                    id: row.get(0)?,
                    title: row.get(1)?,
                    description: row.get(2)?,
                    due_date: row.get(3)?,
                    status: row.get(4)?,
                    progress: 0,
                    sort_order: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        // Calculate progress from steps
        target.progress = Self::calculate_progress(conn, id)?;
        Ok(target)
    }

    pub fn get_all(conn: &rusqlite::Connection) -> Result<Vec<Target>, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, description, due_date, status, sort_order, created_at, updated_at FROM targets ORDER BY sort_order ASC, created_at DESC",
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
                    progress: 0,
                    sort_order: row.get(5)?,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let mut targets: Result<Vec<Target>, String> =
            Ok(target_iter.filter_map(|t| t.ok()).collect());

        // Calculate progress for each target
        if let Ok(ref mut targets) = targets {
            for target in targets.iter_mut() {
                target.progress = Self::calculate_progress(conn, &target.id)?;
            }
        }

        targets
    }

    pub fn create(
        conn: &rusqlite::Connection,
        id: &str,
        title: &str,
        description: Option<&str>,
        due_date: Option<&str>,
    ) -> Result<Target, String> {
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO targets (id, title, description, due_date, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', 0, ?, ?)",
            params![id, title, description, due_date, now, now],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn update(
        conn: &rusqlite::Connection,
        id: &str,
        title: Option<&str>,
        description: Option<&str>,
        due_date: Option<&str>,
        status: Option<&str>,
    ) -> Result<Target, String> {
        let existing = Self::get_by_id(conn, id)?;
        let now = chrono::Utc::now().to_rfc3339();

        let new_title = title.unwrap_or(&existing.title);
        let new_description = description.or(existing.description.as_deref());
        let new_due_date = due_date.or(existing.due_date.as_deref());
        let new_status = status.unwrap_or(&existing.status);

        conn.execute(
            "UPDATE targets SET title = ?, description = ?, due_date = ?, status = ?, updated_at = ? WHERE id = ?",
            params![new_title, new_description, new_due_date, new_status, now, id],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn delete(conn: &rusqlite::Connection, id: &str) -> Result<(), String> {
        conn.execute("DELETE FROM targets WHERE id = ?", [id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn update_sort_order(
        conn: &rusqlite::Connection,
        id: &str,
        sort_order: i32,
    ) -> Result<(), String> {
        let now = chrono::Utc::now().to_rfc3339();
        conn.execute(
            "UPDATE targets SET sort_order = ?, updated_at = ? WHERE id = ?",
            params![sort_order, now, id],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn reorder(conn: &rusqlite::Connection, orders: &[(String, i32)]) -> Result<usize, String> {
        let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;
        let mut count = 0;

        for (id, sort_order) in orders {
            tx.execute(
                "UPDATE targets SET sort_order = ?, updated_at = ? WHERE id = ?",
                params![sort_order, chrono::Utc::now().to_rfc3339(), id],
            )
            .map_err(|e| e.to_string())?;
            count += 1;
        }

        tx.commit().map_err(|e| e.to_string())?;
        Ok(count)
    }
}
