// Circulation check-in commands

use crate::log_command;
use crate::models::{Circulation, CirculationLog};
use crate::AppState;
use rusqlite::TransactionBehavior;

// ============================================================================
// Check-in Commands
// ============================================================================

#[tauri::command]
pub fn checkin_circulation(
    state: tauri::State<AppState>,
    id: String,
    note: Option<String>,
    count: Option<i32>,
) -> Result<Circulation, String> {
    log_command!("checkin_circulation", {
        let mut conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();

        // Use IMMEDIATE transaction to acquire exclusive lock and prevent TOCTOU race
        let tx = conn
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(|e| e.to_string())?;

        // Get circulation within transaction
        let circ = get_circulation_in_tx(&tx, &id)?;

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
        check_already_completed_today(&circ, &today)?;

        // Update circulation within transaction
        let updated_circ = update_circulation_in_tx(&tx, &circ, count, &now, &today)?;

        // Insert log within transaction
        insert_log_in_tx(&tx, &id, &now, &note, &period, count)?;

        tx.commit().map_err(|e| e.to_string())?;

        Ok(updated_circ)
    })
}

#[tauri::command]
pub fn undo_checkin_circulation(
    state: tauri::State<AppState>,
    id: String,
) -> Result<Circulation, String> {
    log_command!("undo_checkin_circulation", {
        let mut conn = state.db.lock().map_err(|e| e.to_string())?;
        let now = chrono::Utc::now().to_rfc3339();

        // Use IMMEDIATE transaction for atomicity
        let tx = conn
            .transaction_with_behavior(TransactionBehavior::Immediate)
            .map_err(|e| e.to_string())?;

        // Get latest log within transaction
        let log = get_latest_log_in_tx(&tx, &id)?;

        // Get circulation within transaction
        let mut circ = get_circulation_in_tx(&tx, &id)?;

        // Reverse circulation data within transaction
        circ = reverse_circulation_in_tx(&tx, &mut circ, &log, &now)?;

        // Delete log within transaction
        delete_log_in_tx(&tx, &log.id)?;

        tx.commit().map_err(|e| e.to_string())?;

        Ok(circ)
    })
}

// ============================================================================
// Helper Functions
// ============================================================================

/// Get latest log within a transaction
fn get_latest_log_in_tx(
    tx: &rusqlite::Transaction,
    circulation_id: &str,
) -> Result<CirculationLog, String> {
    let mut stmt = tx
        .prepare(
            "SELECT id, circulation_id, completed_at, note, period, COALESCE(count, 1) as count FROM circulation_logs WHERE circulation_id = ? ORDER BY completed_at DESC LIMIT 1",
        )
        .map_err(|e| e.to_string())?;

    stmt.query_row([circulation_id], |row| {
        Ok(CirculationLog {
            id: row.get(0)?,
            circulation_id: row.get(1)?,
            completed_at: row.get(2)?,
            note: row.get(3)?,
            period: row.get(4)?,
            count: row.get(5)?,
        })
    })
    .map_err(|_| "No check-in history found".to_string())
}

/// Reverse circulation data within a transaction
fn reverse_circulation_in_tx(
    tx: &rusqlite::Transaction,
    circ: &mut Circulation,
    log: &CirculationLog,
    now: &str,
) -> Result<Circulation, String> {
    if circ.circulation_type == "count" {
        // Decrement by the logged count amount
        let log_count = log.count.unwrap_or(1);
        circ.current_count = (circ.current_count - log_count).max(0);

        // Find previous completion
        let mut prev_stmt = tx
            .prepare(
                "SELECT completed_at FROM circulation_logs WHERE circulation_id = ? AND id != ? ORDER BY completed_at DESC LIMIT 1",
            )
            .map_err(|e| e.to_string())?;

        circ.last_completed_at = prev_stmt
            .query_row(rusqlite::params![log.circulation_id, log.id], |row| {
                row.get(0)
            })
            .ok();

        tx.execute(
            "UPDATE circulations SET current_count = ?, last_completed_at = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![circ.current_count, circ.last_completed_at, now, circ.id],
        )
        .map_err(|e| e.to_string())?;
    } else {
        // Recalculate streak
        let today = chrono::Local::now().format("%Y-%m-%d").to_string();
        let new_streak = calculate_streak_undo(
            tx,
            &circ.id,
            circ.frequency.as_deref().unwrap_or("daily"),
            &today,
        )?;
        circ.streak_count = new_streak;

        // Find previous completion
        let mut prev_stmt = tx
            .prepare(
                "SELECT completed_at FROM circulation_logs WHERE circulation_id = ? AND id != ? ORDER BY completed_at DESC LIMIT 1",
            )
            .map_err(|e| e.to_string())?;

        circ.last_completed_at = prev_stmt
            .query_row(rusqlite::params![log.circulation_id, log.id], |row| {
                row.get(0)
            })
            .ok();

        tx.execute(
            "UPDATE circulations SET streak_count = ?, last_completed_at = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![circ.streak_count, circ.last_completed_at, now, circ.id],
        )
        .map_err(|e| e.to_string())?;
    }

    circ.updated_at = now.to_string();
    Ok(circ.clone())
}

/// Delete log within a transaction
fn delete_log_in_tx(tx: &rusqlite::Transaction, log_id: &str) -> Result<(), String> {
    tx.execute("DELETE FROM circulation_logs WHERE id = ?", [log_id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

/// Get circulation within a transaction
fn get_circulation_in_tx(tx: &rusqlite::Transaction, id: &str) -> Result<Circulation, String> {
    let mut stmt = tx
        .prepare(
            "SELECT id, title, content, circulation_type, frequency, frequency_config,
                    target_count, current_count, streak_count, best_streak,
                    last_completed_at, status, created_at, updated_at
             FROM circulations WHERE id = ?",
        )
        .map_err(|e| e.to_string())?;

    stmt.query_row([id], |row| {
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
}

/// Check if already completed today (for periodic type)
fn check_already_completed_today(circ: &Circulation, today: &str) -> Result<(), String> {
    if let Some(ref last_completed) = circ.last_completed_at {
        if circ.circulation_type == "periodic" {
            let last_date = &last_completed[..10];
            if last_date == today {
                return Err("Already checked in today".to_string());
            }
        }
    }
    Ok(())
}

/// Update circulation within a transaction
fn update_circulation_in_tx(
    tx: &rusqlite::Transaction,
    circ: &Circulation,
    count: Option<i32>,
    now: &str,
    today: &str,
) -> Result<Circulation, String> {
    let mut updated_circ = circ.clone();
    let add_count = count.unwrap_or(1).max(1);

    if circ.circulation_type == "count" {
        // Increment count by specified amount
        updated_circ.current_count += add_count;
        updated_circ.last_completed_at = Some(now.to_string());

        tx.execute(
            "UPDATE circulations SET current_count = ?, last_completed_at = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![updated_circ.current_count, updated_circ.last_completed_at, now, circ.id],
        ).map_err(|e| e.to_string())?;
    } else {
        // Calculate new streak
        let new_streak = calculate_streak(
            tx,
            &circ.id,
            circ.frequency.as_deref().unwrap_or("daily"),
            today,
        )?;
        updated_circ.streak_count = new_streak;

        // Update best streak if needed
        if new_streak > updated_circ.best_streak {
            updated_circ.best_streak = new_streak;
        }
        updated_circ.last_completed_at = Some(now.to_string());

        tx.execute(
            "UPDATE circulations SET streak_count = ?, best_streak = ?, last_completed_at = ?, updated_at = ? WHERE id = ?",
            rusqlite::params![updated_circ.streak_count, updated_circ.best_streak, updated_circ.last_completed_at, now, circ.id],
        ).map_err(|e| e.to_string())?;
    }

    updated_circ.updated_at = now.to_string();
    Ok(updated_circ)
}

/// Insert circulation log within a transaction
fn insert_log_in_tx(
    tx: &rusqlite::Transaction,
    circulation_id: &str,
    completed_at: &str,
    note: &Option<String>,
    period: &Option<String>,
    count: Option<i32>,
) -> Result<(), String> {
    let log_id = uuid::Uuid::new_v4().to_string();
    let add_count = count.unwrap_or(1).max(1);

    tx.execute(
        "INSERT INTO circulation_logs (id, circulation_id, completed_at, note, period, count) VALUES (?, ?, ?, ?, ?, ?)",
        rusqlite::params![log_id, circulation_id, completed_at, note, period, add_count],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

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
) -> Result<i32, String> {
    // Get all completion dates
    let mut stmt = conn
        .prepare("SELECT completed_at FROM circulation_logs WHERE circulation_id = ? ORDER BY completed_at DESC")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let dates: Vec<String> = stmt
        .query_map([circulation_id], |row| row.get(0))
        .map_err(|e| format!("Failed to query: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    if dates.is_empty() {
        return Ok(1); // First check-in
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
            Ok(streak)
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
            Ok(streak)
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
            Ok(streak)
        }
        _ => Ok(1),
    }
}

fn calculate_streak_undo(
    conn: &rusqlite::Connection,
    circulation_id: &str,
    frequency: &str,
    today: &str,
) -> Result<i32, String> {
    // Similar to calculate_streak but starts from previous completion
    let mut stmt = conn
        .prepare("SELECT completed_at FROM circulation_logs WHERE circulation_id = ? ORDER BY completed_at DESC")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let dates: Vec<String> = stmt
        .query_map([circulation_id], |row| row.get(0))
        .map_err(|e| format!("Failed to query: {}", e))?
        .filter_map(|r| r.ok())
        .collect();

    if dates.is_empty() {
        return Ok(0);
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
            Ok(streak)
        }
        _ => Ok(1),
    }
}
