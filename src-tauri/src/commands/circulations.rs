// Circulation CRUD commands

use crate::log_command;
use crate::models::{Circulation, CirculationLog};
use crate::AppState;

// ============================================================================
// CRUD Commands
// ============================================================================

#[tauri::command]
pub fn get_circulation(state: tauri::State<AppState>, id: String) -> Result<Circulation, String> {
    log_command!("get_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        stmt.query_row([&id], |row| {
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
        })
        .map_err(|e| e.to_string())
    })
}

#[tauri::command]
pub fn get_circulations(state: tauri::State<AppState>) -> Result<Vec<Circulation>, String> {
    log_command!("get_circulations", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations ORDER BY created_at DESC",
            )
            .map_err(|e| e.to_string())?;

        let circ_iter = stmt
            .query_map([], |row| {
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
            })
            .map_err(|e| e.to_string())?;

        Ok(circ_iter.filter_map(|c| c.ok()).collect())
    })
}

#[tauri::command]
pub fn get_circulations_by_type(
    state: tauri::State<AppState>,
    circulation_type: String,
    frequency: Option<String>,
) -> Result<Vec<Circulation>, String> {
    log_command!("get_circulations_by_type", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let (query, params): (&str, Vec<String>) = if frequency.is_some() {
            ("SELECT id, title, content, circulation_type, frequency, frequency_config, target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at FROM circulations WHERE circulation_type = ?1 AND frequency = ?2 AND status = 'active' ORDER BY created_at DESC",
             vec![circulation_type, frequency.unwrap()])
        } else {
            ("SELECT id, title, content, circulation_type, frequency, frequency_config, target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at FROM circulations WHERE circulation_type = ?1 AND status = 'active' ORDER BY created_at DESC",
             vec![circulation_type])
        };

        let mut stmt = conn.prepare(query).map_err(|e| e.to_string())?;

        let params_ref: Vec<&dyn rusqlite::ToSql> =
            params.iter().map(|p| p as &dyn rusqlite::ToSql).collect();

        let rows = stmt
            .query_map(params_ref.as_slice(), |row| {
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
            })
            .map_err(|e| e.to_string())?;

        Ok(rows.filter_map(|c| c.ok()).collect())
    })
}

#[tauri::command]
pub fn create_circulation(
    state: tauri::State<AppState>,
    title: String,
    circulation_type: String,
    frequency: Option<String>,
    frequency_config: Option<String>,
    target_count: Option<i32>,
) -> Result<Circulation, String> {
    log_command!("create_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        // Validate
        if title.trim().is_empty() {
            return Err("Title cannot be empty".to_string());
        }
        if circulation_type != "periodic" && circulation_type != "count" {
            return Err("Invalid circulation_type. Use 'periodic' or 'count'".to_string());
        }
        if circulation_type == "periodic" && frequency.is_none() {
            return Err("frequency is required for periodic circulation".to_string());
        }

        conn.execute(
            "INSERT INTO circulations (id, title, content, circulation_type, frequency, frequency_config, target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at)
             VALUES (?, ?, NULL, ?, ?, ?, ?, 0, 0, 0, NULL, 'active', ?, ?)",
            rusqlite::params![id, title, circulation_type, frequency, frequency_config, target_count, now, now],
        ).map_err(|e| e.to_string())?;

        Ok(Circulation {
            id,
            title,
            content: None,
            circulation_type,
            frequency,
            frequency_config,
            target_count,
            current_count: 0,
            streak_count: 0,
            best_streak: 0,
            last_completed_at: None,
            status: "active".to_string(),
            created_at: now.clone(),
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn update_circulation(
    state: tauri::State<AppState>,
    id: String,
    title: Option<String>,
    circulation_type: Option<String>,
    frequency: Option<String>,
    frequency_config: Option<String>,
    target_count: Option<i32>,
    status: Option<String>,
) -> Result<Circulation, String> {
    log_command!("update_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        // Get existing
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        let existing: Circulation = stmt
            .query_row([&id], |row| {
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
            })
            .map_err(|e| e.to_string())?;

        let new_title = title.unwrap_or(existing.title);
        let new_type = circulation_type.unwrap_or(existing.circulation_type);
        let new_freq = frequency.or(existing.frequency);
        let new_config = frequency_config.or(existing.frequency_config);
        let new_target = target_count.or(existing.target_count);
        let new_status = status.unwrap_or(existing.status);

        conn.execute(
            "UPDATE circulations SET title = ?, circulation_type = ?, frequency = ?, frequency_config = ?, target_count = ?, status = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![new_title, new_type, new_freq, new_config, new_target, new_status, now, id],
        ).map_err(|e| e.to_string())?;

        Ok(Circulation {
            id: existing.id,
            title: new_title,
            content: existing.content,
            circulation_type: new_type,
            frequency: new_freq,
            frequency_config: new_config,
            target_count: new_target,
            current_count: existing.current_count,
            streak_count: existing.streak_count,
            best_streak: existing.best_streak,
            last_completed_at: existing.last_completed_at,
            status: new_status,
            created_at: existing.created_at,
            updated_at: now,
        })
    })
}

#[tauri::command]
pub fn delete_circulation(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM circulations WHERE id = ?", [&id])
            .map_err(|e| e.to_string())?;
        Ok(())
    })
}

// ============================================================================
// Check-in Commands
// ============================================================================

#[tauri::command]
pub fn checkin_circulation(
    state: tauri::State<AppState>,
    id: String,
    note: Option<String>,
) -> Result<Circulation, String> {
    log_command!("checkin_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();

        // Get existing circulation
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        let mut circ: Circulation = stmt
            .query_row([&id], |row| {
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
            })
            .map_err(|e| e.to_string())?;

        // Calculate period for periodic
        let period = if circ.circulation_type == "periodic" {
            Some(calculate_period(
                circ.frequency.as_deref().unwrap_or("daily"),
                &today,
            ))
        } else {
            None
        };

        // Check if already completed today (for periodic)
        if let Some(ref last_completed) = circ.last_completed_at {
            if circ.circulation_type == "periodic" {
                let last_date = &last_completed[..10]; // Get date part
                if last_date == today {
                    return Err("Already checked in today".to_string());
                }
            }
        }

        // Update based on type
        if circ.circulation_type == "count" {
            // Increment count
            circ.current_count += 1;
            circ.last_completed_at = Some(now.clone());

            conn.execute(
                "UPDATE circulations SET current_count = ?, last_completed_at = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![circ.current_count, circ.last_completed_at, now, id],
            ).map_err(|e| e.to_string())?;
        } else {
            // Calculate new streak
            let new_streak = calculate_streak(
                &conn,
                &id,
                circ.frequency.as_deref().unwrap_or("daily"),
                &today,
            );
            circ.streak_count = new_streak;

            // Update best streak if needed
            if new_streak > circ.best_streak {
                circ.best_streak = new_streak;
            }
            circ.last_completed_at = Some(now.clone());

            conn.execute(
                "UPDATE circulations SET streak_count = ?, best_streak = ?, last_completed_at = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![circ.streak_count, circ.best_streak, circ.last_completed_at, now, id],
            ).map_err(|e| e.to_string())?;
        }

        // Insert log
        let log_id = uuid::Uuid::new_v4().to_string();
        conn.execute(
            "INSERT INTO circulation_logs (id, circulation_id, completed_at, note, period) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![log_id, id, now, note, period],
        ).map_err(|e| e.to_string())?;

        circ.updated_at = now;
        Ok(circ)
    })
}

#[tauri::command]
pub fn undo_checkin_circulation(
    state: tauri::State<AppState>,
    id: String,
) -> Result<Circulation, String> {
    log_command!("undo_checkin_circulation", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        // Get latest log
        let mut log_stmt = conn
            .prepare("SELECT id, completed_at, period FROM circulation_logs WHERE circulation_id = ? ORDER BY completed_at DESC LIMIT 1")
            .map_err(|e| e.to_string())?;

        let log_result: Result<(String, String, Option<String>), _> =
            log_stmt.query_row([&id], |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)));

        let (log_id, _completed_at, _period) = match log_result {
            Ok(r) => r,
            Err(_) => return Err("No check-in history found".to_string()),
        };

        // Get circulation
        let mut circ_stmt = conn
            .prepare(
                "SELECT id, title, content, circulation_type, frequency, frequency_config,
                        target_count, current_count, streak_count, best_streak,
                        last_completed_at, status, created_at, updated_at
                 FROM circulations WHERE id = ?",
            )
            .map_err(|e| e.to_string())?;

        let mut circ: Circulation = circ_stmt
            .query_row([&id], |row| {
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
            })
            .map_err(|e| e.to_string())?;

        // Reverse based on type
        if circ.circulation_type == "count" {
            if circ.current_count > 0 {
                circ.current_count -= 1;
            }
            // Find previous completion
            let mut prev_stmt = conn
                .prepare("SELECT completed_at FROM circulation_logs WHERE circulation_id = ? AND id != ? ORDER BY completed_at DESC LIMIT 1")
                .map_err(|e| e.to_string())?;

            circ.last_completed_at = prev_stmt
                .query_row(rusqlite::params![id, log_id], |row| row.get(0))
                .ok();

            conn.execute(
                "UPDATE circulations SET current_count = ?, last_completed_at = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![circ.current_count, circ.last_completed_at, now, id],
            ).map_err(|e| e.to_string())?;
        } else {
            // Recalculate streak
            let today = chrono::Local::now().format("%Y-%m-%d").to_string();
            let new_streak = calculate_streak_undo(
                &conn,
                &id,
                circ.frequency.as_deref().unwrap_or("daily"),
                &today,
            );
            circ.streak_count = new_streak;

            // Find previous completion
            let mut prev_stmt = conn
                .prepare("SELECT completed_at FROM circulation_logs WHERE circulation_id = ? AND id != ? ORDER BY completed_at DESC LIMIT 1")
                .map_err(|e| e.to_string())?;

            circ.last_completed_at = prev_stmt
                .query_row(rusqlite::params![id, log_id], |row| row.get(0))
                .ok();

            conn.execute(
                "UPDATE circulations SET streak_count = ?, last_completed_at = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![circ.streak_count, circ.last_completed_at, now, id],
            ).map_err(|e| e.to_string())?;
        }

        // Delete log
        conn.execute("DELETE FROM circulation_logs WHERE id = ?", [&log_id])
            .map_err(|e| e.to_string())?;

        circ.updated_at = now;
        Ok(circ)
    })
}

#[tauri::command]
pub fn get_circulation_logs(
    state: tauri::State<AppState>,
    circulation_id: String,
    limit: Option<i32>,
) -> Result<Vec<CirculationLog>, String> {
    log_command!("get_circulation_logs", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let limit = limit.unwrap_or(20);

        let mut stmt = conn
            .prepare(
                "SELECT id, circulation_id, completed_at, note, period
                 FROM circulation_logs
                 WHERE circulation_id = ?
                 ORDER BY completed_at DESC
                 LIMIT ?",
            )
            .map_err(|e| e.to_string())?;

        let log_iter = stmt
            .query_map(rusqlite::params![circulation_id, limit], |row| {
                Ok(CirculationLog {
                    id: row.get(0)?,
                    circulation_id: row.get(1)?,
                    completed_at: row.get(2)?,
                    note: row.get(3)?,
                    period: row.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?;

        Ok(log_iter.filter_map(|l| l.ok()).collect())
    })
}

// ============================================================================
// Helper Functions
// ============================================================================

fn calculate_period(frequency: &str, today: &str) -> String {
    match frequency {
        "daily" => today.to_string(),
        "weekly" => {
            let dt = chrono::NaiveDate::parse_from_str(today, "%Y-%m-%d")
                .unwrap_or_else(|_| chrono::Local::now().naive_local().date());
            let week = dt.format("%Y-W%V").to_string();
            week
        }
        "monthly" => {
            let dt = chrono::NaiveDate::parse_from_str(today, "%Y-%m-%d")
                .unwrap_or_else(|_| chrono::Local::now().naive_local().date());
            dt.format("%Y-%m").to_string()
        }
        _ => today.to_string(),
    }
}

fn calculate_streak(
    conn: &rusqlite::Connection,
    circulation_id: &str,
    frequency: &str,
    today: &str,
) -> i32 {
    // Get all completion dates
    let mut stmt = conn
        .prepare("SELECT completed_at FROM circulation_logs WHERE circulation_id = ? ORDER BY completed_at DESC")
        .unwrap();

    let dates: Vec<String> = stmt
        .query_map([circulation_id], |row| row.get(0))
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();

    if dates.is_empty() {
        return 1; // First check-in
    }

    let today_date = chrono::NaiveDate::parse_from_str(today, "%Y-%m-%d")
        .unwrap_or_else(|_| chrono::Local::now().naive_local().date());

    match frequency {
        "daily" => {
            let mut streak = 1;
            let mut current = today_date;

            for date_str in &dates {
                if let Ok(date) = chrono::NaiveDate::parse_from_str(&date_str[..10], "%Y-%m-%d") {
                    let expected = current - chrono::Duration::days(1);
                    if date == expected || date == current {
                        if date == expected {
                            streak += 1;
                            current = date;
                        }
                    } else if date < expected {
                        break;
                    }
                }
            }
            streak
        }
        "weekly" => {
            let mut streak = 1;
            let mut current_week = today_date.format("%Y-W%V").to_string();

            for date_str in &dates {
                if let Ok(date) = chrono::NaiveDate::parse_from_str(&date_str[..10], "%Y-%m-%d") {
                    let week = date.format("%Y-W%V").to_string();
                    if week == current_week {
                        continue;
                    }
                    // Check if it's the previous week
                    let diff_days = (today_date - date).num_days();
                    if diff_days > 0 && diff_days < 14 {
                        streak += 1;
                        current_week = week;
                    }
                }
            }
            streak
        }
        "monthly" => {
            let mut streak = 1;
            let mut current_month = &today[..7]; // YYYY-MM

            for date_str in &dates {
                if date_str.len() >= 7 {
                    let month = &date_str[..7];
                    if month == current_month {
                        continue;
                    }
                    // Check if consecutive month
                    if let Ok(current) = chrono::NaiveDate::parse_from_str(
                        &format!("{}-01", current_month),
                        "%Y-%m-%d",
                    ) {
                        if let Ok(comp) =
                            chrono::NaiveDate::parse_from_str(&format!("{}-01", month), "%Y-%m-%d")
                        {
                            let diff = (current - comp).num_days();
                            if diff < 45 && diff > 0 {
                                streak += 1;
                                current_month = month;
                            }
                        }
                    }
                }
            }
            streak
        }
        _ => 1,
    }
}

fn calculate_streak_undo(
    conn: &rusqlite::Connection,
    circulation_id: &str,
    frequency: &str,
    today: &str,
) -> i32 {
    // Similar to calculate_streak but starts from previous completion
    let mut stmt = conn
        .prepare("SELECT completed_at FROM circulation_logs WHERE circulation_id = ? ORDER BY completed_at DESC")
        .unwrap();

    let dates: Vec<String> = stmt
        .query_map([circulation_id], |row| row.get(0))
        .unwrap()
        .filter_map(|r| r.ok())
        .collect();

    if dates.is_empty() {
        return 0;
    }

    let today_date = chrono::NaiveDate::parse_from_str(today, "%Y-%m-%d")
        .unwrap_or_else(|_| chrono::Local::now().naive_local().date());

    match frequency {
        "daily" => {
            let mut streak = 0;
            let mut current = today_date;

            for date_str in &dates {
                if let Ok(date) = chrono::NaiveDate::parse_from_str(&date_str[..10], "%Y-%m-%d") {
                    let expected = current - chrono::Duration::days(1);
                    if date == expected {
                        streak += 1;
                        current = date;
                    } else if date < expected {
                        break;
                    }
                }
            }
            streak
        }
        _ => 1,
    }
}
