use crate::models::Circulation;
use rusqlite::{params, Connection, Result as SqliteResult};

pub struct CirculationRepository;

impl CirculationRepository {
    const COLUMNS: &'static str =
        "id, title, content, circulation_type, frequency, frequency_config,
         target_count, current_count, streak_count, best_streak,
         last_completed_at, status, created_at, updated_at";

    pub fn get_by_id(conn: &Connection, id: &str) -> Result<Circulation, String> {
        let mut stmt = conn
            .prepare(&format!(
                "SELECT {} FROM circulations WHERE id = ?",
                Self::COLUMNS
            ))
            .map_err(|e| e.to_string())?;

        stmt.query_row([id], |row| Self::row_to_circulation(row))
            .map_err(|e| e.to_string())
    }

    pub fn get_all(conn: &Connection) -> Result<Vec<Circulation>, String> {
        let mut stmt = conn
            .prepare(&format!(
                "SELECT {} FROM circulations ORDER BY created_at DESC",
                Self::COLUMNS
            ))
            .map_err(|e| e.to_string())?;

        let circ_iter = stmt
            .query_map([], |row| Self::row_to_circulation(row))
            .map_err(|e| e.to_string())?;

        circ_iter
            .collect::<Result<Vec<Circulation>, _>>()
            .map_err(|e| e.to_string())
    }

    pub fn get_by_type(
        conn: &Connection,
        circulation_type: &str,
        frequency: Option<&str>,
    ) -> Result<Vec<Circulation>, String> {
        let (query, params): (&str, Vec<String>) = if frequency.is_some() {
            (
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations
                 WHERE circulation_type = ?1 AND frequency = ?2 AND status = 'active'
                 ORDER BY created_at DESC",
                vec![circulation_type.to_string(), frequency.unwrap().to_string()],
            )
        } else {
            (
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations
                 WHERE circulation_type = ?1 AND status = 'active'
                 ORDER BY created_at DESC",
                vec![circulation_type.to_string()],
            )
        };

        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let params_ref: Vec<&dyn rusqlite::ToSql> =
            params.iter().map(|p| p as &dyn rusqlite::ToSql).collect();

        let rows = stmt
            .query_map(params_ref.as_slice(), |row| Self::row_to_circulation(row))
            .map_err(|e| e.to_string())?;

        rows.collect::<Result<Vec<Circulation>, _>>()
            .map_err(|e| e.to_string())
    }

    pub fn create(
        conn: &Connection,
        id: &str,
        title: &str,
        circulation_type: &str,
        frequency: Option<&str>,
        frequency_config: Option<&str>,
        target_count: Option<i32>,
    ) -> Result<Circulation, String> {
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO circulations (id, title, content, circulation_type, frequency, frequency_config, target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at)
             VALUES (?, ?, NULL, ?, ?, ?, ?, 0, 0, 0, NULL, 'active', ?, ?)",
            params![id, title, circulation_type, frequency, frequency_config, target_count, now, now],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn update(
        conn: &Connection,
        id: &str,
        title: Option<&str>,
        circulation_type: Option<&str>,
        frequency: Option<&str>,
        frequency_config: Option<&str>,
        target_count: Option<i32>,
        status: Option<&str>,
    ) -> Result<Circulation, String> {
        let existing = Self::get_by_id(conn, id)?;
        let now = chrono::Utc::now().to_rfc3339();

        let new_title = title.unwrap_or(&existing.title);
        let new_type = circulation_type.unwrap_or(&existing.circulation_type);
        let new_freq = frequency.or(existing.frequency.as_deref());
        let new_config = frequency_config.or(existing.frequency_config.as_deref());
        let new_target = target_count.or(existing.target_count);
        let new_status = status.unwrap_or(&existing.status);

        conn.execute(
            "UPDATE circulations SET title = ?, circulation_type = ?, frequency = ?, frequency_config = ?, target_count = ?, status = ?, updated_at = ? WHERE id = ?",
            params![new_title, new_type, new_freq, new_config, new_target, new_status, now, id],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn delete(conn: &Connection, id: &str) -> Result<(), String> {
        conn.execute("DELETE FROM circulations WHERE id = ?", [id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    fn row_to_circulation(row: &rusqlite::Row) -> SqliteResult<Circulation> {
        Ok(Circulation {
            id: row.get(0)?,
            title: row.get(1)?,
            content: row.get(2)?,
            circulation_type: row.get(3)?,
            frequency: row.get(4)?,
            frequency_config: row.get(5)?,
            target_count: row.get(6)?,
            current_count: row.get(7)?,
            streak_count: row.get(8)?,
            best_streak: row.get(9)?,
            last_completed_at: row.get(10)?,
            status: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
        })
    }
}
