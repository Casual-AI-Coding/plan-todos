// Statistics and analytics commands

use crate::AppState;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Statistics {
    pub counts: EntityCounts,
    pub completion: CompletionStats,
    pub trends: TrendStats,
    pub efficiency: EfficiencyStats,
}

#[derive(Debug, Serialize)]
pub struct EntityCounts {
    pub todo: i32,
    pub plan: i32,
    pub task: i32,
    pub target: i32,
    pub step: i32,
    pub milestone: i32,
}

#[derive(Debug, Serialize)]
pub struct CompletionStats {
    pub todo_done: i32,
    pub todo_total: i32,
    pub task_done: i32,
    pub task_total: i32,
    pub step_completed: i32,
    pub step_total: i32,
    pub milestone_done: i32,
    pub milestone_total: i32,
    pub todo_completion_rate: f32,
    pub task_completion_rate: f32,
    pub step_completion_rate: f32,
    pub milestone_completion_rate: f32,
}

#[derive(Debug, Serialize)]
pub struct TrendStats {
    pub daily: Vec<DailyStat>,
}

#[derive(Debug, Serialize)]
pub struct DailyStat {
    pub date: String,
    pub completed: i32,
}

#[derive(Debug, Serialize)]
pub struct EfficiencyStats {
    pub streak_days: i32,
    pub today_completed: i32,
    pub week_completed: i32,
    pub month_completed: i32,
    pub productivity_score: i32,
}

#[tauri::command]
pub fn get_statistics(state: tauri::State<AppState>) -> Result<Statistics, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let counts = get_counts(&conn)?;
    let completion = get_completion_stats(&conn)?;
    let trends = get_trend_stats(&conn)?;
    let efficiency = get_efficiency_stats(&conn)?;

    Ok(Statistics {
        counts,
        completion,
        trends,
        efficiency,
    })
}

fn get_counts(conn: &rusqlite::Connection) -> Result<EntityCounts, String> {
    let todo_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM todos", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let plan_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM plans", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let task_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM tasks", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let target_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM targets", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let step_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM steps", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    let milestone_count: i32 = conn
        .query_row("SELECT COUNT(*) FROM milestones", [], |row| row.get(0))
        .map_err(|e| e.to_string())?;

    Ok(EntityCounts {
        todo: todo_count,
        plan: plan_count,
        task: task_count,
        target: target_count,
        step: step_count,
        milestone: milestone_count,
    })
}

fn get_completion_stats(conn: &rusqlite::Connection) -> Result<CompletionStats, String> {
    // Todo stats
    let (todo_done, todo_total): (i32, i32) = conn
        .query_row(
            "SELECT 
                COALESCE(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END), 0),
                COUNT(*)
            FROM todos",
            [],
            |row| {
                Ok((
                    row.get::<_, i32>(0).unwrap_or(0),
                    row.get::<_, i32>(1).unwrap_or(0),
                ))
            },
        )
        .map_err(|e| e.to_string())?;

    // Task stats
    let (task_done, task_total): (i32, i32) = conn
        .query_row(
            "SELECT 
                COALESCE(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END), 0),
                COUNT(*)
            FROM tasks",
            [],
            |row| {
                Ok((
                    row.get::<_, i32>(0).unwrap_or(0),
                    row.get::<_, i32>(1).unwrap_or(0),
                ))
            },
        )
        .map_err(|e| e.to_string())?;

    // Step stats
    let (step_completed, step_total): (i32, i32) = conn
        .query_row(
            "SELECT 
                COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0),
                COUNT(*)
            FROM steps",
            [],
            |row| {
                Ok((
                    row.get::<_, i32>(0).unwrap_or(0),
                    row.get::<_, i32>(1).unwrap_or(0),
                ))
            },
        )
        .map_err(|e| e.to_string())?;

    // Milestone stats
    let (milestone_done, milestone_total): (i32, i32) = conn
        .query_row(
            "SELECT 
                COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0),
                COUNT(*)
            FROM milestones",
            [],
            |row| {
                Ok((
                    row.get::<_, i32>(0).unwrap_or(0),
                    row.get::<_, i32>(1).unwrap_or(0),
                ))
            },
        )
        .map_err(|e| e.to_string())?;

    let todo_completion_rate = if todo_total > 0 {
        (todo_done as f32 / todo_total as f32) * 100.0
    } else {
        0.0
    };

    let task_completion_rate = if task_total > 0 {
        (task_done as f32 / task_total as f32) * 100.0
    } else {
        0.0
    };

    let step_completion_rate = if step_total > 0 {
        (step_completed as f32 / step_total as f32) * 100.0
    } else {
        0.0
    };

    let milestone_completion_rate = if milestone_total > 0 {
        (milestone_done as f32 / milestone_total as f32) * 100.0
    } else {
        0.0
    };

    Ok(CompletionStats {
        todo_done,
        todo_total,
        task_done,
        task_total,
        step_completed,
        step_total,
        milestone_done,
        milestone_total,
        todo_completion_rate,
        task_completion_rate,
        step_completion_rate,
        milestone_completion_rate,
    })
}

fn get_trend_stats(conn: &rusqlite::Connection) -> Result<TrendStats, String> {
    let mut daily_stats: Vec<DailyStat> = Vec::new();

    // Get last 7 days of completion data
    let mut stmt = conn
        .prepare(
            "SELECT 
                date(updated_at) as date,
                COUNT(*) as completed
            FROM todos
            WHERE status = 'done'
                AND date(updated_at) >= date('now', '-7 days')
            GROUP BY date(updated_at)
            ORDER BY date(updated_at)",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DailyStat {
                date: row.get(0)?,
                completed: row.get(1)?,
            })
        })
        .map_err(|e| e.to_string())?;

    for row in rows {
        daily_stats.push(row.map_err(|e| e.to_string())?);
    }

    Ok(TrendStats { daily: daily_stats })
}

fn get_efficiency_stats(conn: &rusqlite::Connection) -> Result<EfficiencyStats, String> {
    // Today's completed count
    let today_completed: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos 
            WHERE status = 'done' 
            AND date(updated_at) = date('now')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Week completed count (last 7 days)
    let week_completed: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos 
            WHERE status = 'done' 
            AND date(updated_at) >= date('now', '-7 days')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Month completed count (last 30 days)
    let month_completed: i32 = conn
        .query_row(
            "SELECT COUNT(*) FROM todos 
            WHERE status = 'done' 
            AND date(updated_at) >= date('now', '-30 days')",
            [],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    // Calculate streak (consecutive days with at least one completion)
    let streak_days = calculate_streak(conn)?;

    // Productivity score (0-100) based on completion rate and streak
    let productivity_score = calculate_productivity_score(conn, streak_days)?;

    Ok(EfficiencyStats {
        streak_days,
        today_completed,
        week_completed,
        month_completed,
        productivity_score,
    })
}

fn calculate_streak(conn: &rusqlite::Connection) -> Result<i32, String> {
    // Get distinct dates with completions in last 30 days, ordered by date desc
    let mut stmt = conn
        .prepare(
            "SELECT DISTINCT date(updated_at) as completion_date
            FROM todos
            WHERE status = 'done'
                AND date(updated_at) >= date('now', '-30 days')
            ORDER BY completion_date DESC",
        )
        .map_err(|e| e.to_string())?;

    let dates: Vec<String> = stmt
        .query_map([], |row| row.get::<_, String>(0))
        .map_err(|e| e.to_string())?
        .filter_map(|d| d.ok())
        .collect();

    if dates.is_empty() {
        return Ok(0);
    }

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let yesterday = (chrono::Local::now() - chrono::Duration::days(1))
        .format("%Y-%m-%d")
        .to_string();

    // Check if streak is active (completed today or yesterday)
    if !dates.contains(&today) && !dates.contains(&yesterday) {
        return Ok(0);
    }

    // Count consecutive days
    let mut streak = 1;
    let mut current_date = if dates.contains(&today) {
        chrono::Local::now().date_naive()
    } else {
        (chrono::Local::now() - chrono::Duration::days(1)).date_naive()
    };

    for date_str in dates.iter().skip(1) {
        let check_date = current_date - chrono::Duration::days(1);
        if date_str == &check_date.format("%Y-%m-%d").to_string() {
            streak += 1;
            current_date = check_date;
        } else {
            break;
        }
    }

    Ok(streak)
}

fn calculate_productivity_score(conn: &rusqlite::Connection, streak: i32) -> Result<i32, String> {
    // Get completion rate for last 7 days
    let (completed, total): (i32, i32) = conn
        .query_row(
            "SELECT 
                COALESCE(SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END), 0),
                COUNT(*)
            FROM todos
            WHERE date(updated_at) >= date('now', '-7 days')
                OR status != 'done'",
            [],
            |row| {
                Ok((
                    row.get::<_, i32>(0).unwrap_or(0),
                    row.get::<_, i32>(1).unwrap_or(0),
                ))
            },
        )
        .map_err(|e| e.to_string())?;

    let completion_rate = if total > 0 {
        (completed as f32 / total as f32) * 100.0
    } else {
        0.0
    };

    // Score based on completion rate (70%) and streak (30%)
    let score = (completion_rate * 0.7) + (streak.min(10) as f32 * 3.0);
    Ok(score.min(100.0) as i32)
}
