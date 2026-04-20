use crate::models::Plan;
use rusqlite::params;

pub struct PlanRepository;

impl PlanRepository {
    pub fn get_by_id(conn: &rusqlite::Connection, id: &str) -> Result<Plan, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, description, start_date, end_date, status, sort_order, created_at, updated_at FROM plans WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        stmt.query_row([id], |row| {
            Ok(Plan {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                start_date: row.get(3)?,
                end_date: row.get(4)?,
                status: row.get(5)?,
                sort_order: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())
    }

    pub fn get_all(conn: &rusqlite::Connection) -> Result<Vec<Plan>, String> {
        let mut stmt = conn
            .prepare(
                "SELECT id, title, description, start_date, end_date, status, sort_order, created_at, updated_at FROM plans ORDER BY sort_order ASC, created_at DESC",
            )
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
                    sort_order: row.get(6)?,
                    created_at: row.get(7)?,
                    updated_at: row.get(8)?,
                })
            })
            .map_err(|e| e.to_string())?;

        let plans: Result<Vec<Plan>, String> = plan_iter.collect();
        plans
    }

    pub fn create(
        conn: &rusqlite::Connection,
        id: &str,
        title: &str,
        description: Option<&str>,
        start_date: Option<&str>,
        end_date: Option<&str>,
    ) -> Result<Plan, String> {
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO plans (id, title, description, start_date, end_date, status, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 'active', 0, ?, ?)",
            params![id, title, description, start_date, end_date, now, now],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn update(
        conn: &rusqlite::Connection,
        id: &str,
        title: Option<&str>,
        description: Option<&str>,
        start_date: Option<&str>,
        end_date: Option<&str>,
        status: Option<&str>,
    ) -> Result<Plan, String> {
        let existing = Self::get_by_id(conn, id)?;
        let now = chrono::Utc::now().to_rfc3339();

        let new_title = title.unwrap_or(&existing.title);
        let new_description = description.or(existing.description.as_deref());
        let new_start_date = start_date.or(existing.start_date.as_deref());
        let new_end_date = end_date.or(existing.end_date.as_deref());
        let new_status = status.unwrap_or(&existing.status);

        conn.execute(
            "UPDATE plans SET title = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = ? WHERE id = ?",
            params![new_title, new_description, new_start_date, new_end_date, new_status, now, id],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn delete(conn: &rusqlite::Connection, id: &str) -> Result<(), String> {
        conn.execute("DELETE FROM plans WHERE id = ?", [id])
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
            "UPDATE plans SET sort_order = ?, updated_at = ? WHERE id = ?",
            params![sort_order, now, id],
        )
        .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn reorder(conn: &rusqlite::Connection, orders: &[(String, i32)]) -> Result<usize, String> {
        let tx = conn.transaction().map_err(|e| e.to_string())?;
        let mut count = 0;

        for (id, sort_order) in orders {
            tx.execute(
                "UPDATE plans SET sort_order = ?, updated_at = ? WHERE id = ?",
                params![sort_order, chrono::Utc::now().to_rfc3339(), id],
            )
            .map_err(|e| e.to_string())?;
            count += 1;
        }

        tx.commit().map_err(|e| e.to_string())?;
        Ok(count)
    }
}
