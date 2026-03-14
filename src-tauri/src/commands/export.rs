// Export functionality

use crate::models::{Circulation, CirculationLog, Milestone, Plan, Step, Target, Task, Todo};
use crate::AppState;
use serde::{Deserialize, Serialize};

// ============================================================================
// Export Data Structures
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExportData {
    pub version: String,
    pub exported_at: String,
    pub data: ExportDataContent,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct ExportDataContent {
    pub todos: Vec<Todo>,
    pub tasks: Vec<Task>,
    pub plans: Vec<Plan>,
    pub targets: Vec<Target>,
    pub steps: Vec<Step>,
    pub milestones: Vec<Milestone>,
    pub tags: Vec<TagData>,
    pub entity_tags: Vec<EntityTagRow>,
    pub circulations: Vec<Circulation>,
    pub circulation_logs: Vec<CirculationLog>,
    pub settings: SettingsData,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TagData {
    pub id: String,
    pub name: String,
    pub color: String,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EntityTagRow {
    pub entity_type: String,
    pub entity_id: String,
    pub tag_id: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, Default)]
pub struct SettingsData {
    pub daily_summary_settings: Option<DailySummarySettingsData>,
    pub notification_plugins: Vec<NotificationPluginData>,
    pub global_notification_settings: Option<GlobalNotificationSettingsData>,
    pub global_circulation_notification_settings: Option<GlobalCirculationNotificationSettingsData>,
    pub circulation_notification_settings: Vec<CirculationNotificationSettingsData>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DailySummarySettingsData {
    pub id: String,
    pub enabled: bool,
    pub time: String,
    pub include_pending: bool,
    pub include_overdue: bool,
    pub include_completed: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationPluginData {
    pub id: String,
    pub name: String,
    pub plugin_type: String,
    pub enabled: bool,
    pub config: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GlobalNotificationSettingsData {
    pub id: String,
    pub master_enabled: bool,
    pub desktop_enabled: bool,
    pub sound_enabled: bool,
    pub todo_default_enabled: bool,
    pub todo_default_times: String,
    pub plan_default_enabled: bool,
    pub plan_default_times: String,
    pub target_default_enabled: bool,
    pub target_default_times: String,
    pub dnd_enabled: bool,
    pub dnd_start_time: String,
    pub dnd_end_time: String,
    pub dnd_days: String,
    pub channel_priority: String,
    pub retention_days: i32,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GlobalCirculationNotificationSettingsData {
    pub id: String,
    pub master_enabled: bool,
    pub default_reminder_type: String,
    pub default_fixed_time: String,
    pub default_before_minutes: i32,
    pub achievement_notifications: bool,
    pub streak_milestones: String,
    pub count_milestones: String,
    pub default_channels: String,
    pub dnd_enabled: bool,
    pub dnd_start_time: String,
    pub dnd_end_time: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CirculationNotificationSettingsData {
    pub id: String,
    pub circulation_id: String,
    pub enabled: bool,
    pub reminder_type: String,
    pub fixed_time: Option<String>,
    pub before_minutes: Option<i32>,
    pub achievement_type: Option<String>,
    pub achievement_threshold: Option<i32>,
    pub channels: String,
    pub message_template: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

// Re-export import types for backward compatibility
// pub use super::import::{ImportData, ImportResult};

// ============================================================================
// Export Command
// ============================================================================

#[tauri::command]
pub fn export_data(state: tauri::State<AppState>) -> Result<ExportData, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Export all tables
    let todos = export_todos(&conn)?;
    let tasks = export_tasks(&conn)?;
    let plans = export_plans(&conn)?;
    let targets = export_targets(&conn)?;
    let steps = export_steps(&conn)?;
    let milestones = export_milestones(&conn)?;
    let tags = export_tags(&conn)?;
    let entity_tags = export_entity_tags(&conn)?;
    let circulations = export_circulations(&conn)?;
    let circulation_logs = export_circulation_logs(&conn)?;
    let settings = export_settings(&conn)?;

    let exported_at = chrono::Utc::now().to_rfc3339();

    Ok(ExportData {
        version: "1.0".to_string(),
        exported_at,
        data: ExportDataContent {
            todos,
            tasks,
            plans,
            targets,
            steps,
            milestones,
            tags,
            entity_tags,
            circulations,
            circulation_logs,
            settings,
        },
    })
}

fn export_todos(conn: &rusqlite::Connection) -> Result<Vec<Todo>, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, content, due_date, status, priority, created_at, updated_at FROM todos")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Todo {
                id: row.get(0)?,
                title: row.get(1)?,
                content: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                priority: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_tasks(conn: &rusqlite::Connection) -> Result<Vec<Task>, String> {
    let mut stmt = conn
        .prepare("SELECT id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at FROM tasks")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Task {
                id: row.get(0)?,
                plan_id: row.get(1)?,
                title: row.get(2)?,
                description: row.get(3)?,
                start_date: row.get(4)?,
                end_date: row.get(5)?,
                status: row.get(6)?,
                priority: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_plans(conn: &rusqlite::Connection) -> Result<Vec<Plan>, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, description, start_date, end_date, status, created_at, updated_at FROM plans")
        .map_err(|e| e.to_string())?;

    let rows = stmt
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

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_targets(conn: &rusqlite::Connection) -> Result<Vec<Target>, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, description, due_date, status, progress, created_at, updated_at FROM targets")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Target {
                id: row.get(0)?,
                title: row.get(1)?,
                description: row.get(2)?,
                due_date: row.get(3)?,
                status: row.get(4)?,
                progress: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_steps(conn: &rusqlite::Connection) -> Result<Vec<Step>, String> {
    let mut stmt = conn
        .prepare("SELECT id, target_id, title, weight, status, priority, created_at, updated_at FROM steps")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Step {
                id: row.get(0)?,
                target_id: row.get(1)?,
                title: row.get(2)?,
                weight: row.get(3)?,
                status: row.get(4)?,
                priority: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_milestones(conn: &rusqlite::Connection) -> Result<Vec<Milestone>, String> {
    let mut stmt = conn
        .prepare("SELECT id, title, target_date, biz_type, biz_id, status, progress, created_at, updated_at FROM milestones")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Milestone {
                id: row.get(0)?,
                title: row.get(1)?,
                target_date: row.get(2)?,
                biz_type: row.get(3)?,
                biz_id: row.get(4)?,
                status: row.get(5)?,
                progress: row.get(6)?,
                created_at: row.get(7)?,
                updated_at: row.get(8)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_tags(conn: &rusqlite::Connection) -> Result<Vec<TagData>, String> {
    let mut stmt = conn
        .prepare("SELECT id, name, color, description, created_at FROM tags")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(TagData {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                description: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_entity_tags(conn: &rusqlite::Connection) -> Result<Vec<EntityTagRow>, String> {
    let mut stmt = conn
        .prepare("SELECT entity_type, entity_id, tag_id FROM entity_tags")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(EntityTagRow {
                entity_type: row.get(0)?,
                entity_id: row.get(1)?,
                tag_id: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_circulations(conn: &rusqlite::Connection) -> Result<Vec<Circulation>, String> {
    let mut stmt = conn
        .prepare(
            "SELECT id, title, content, circulation_type, frequency, frequency_config, 
                    target_count, current_count, streak_count, best_streak,
                    last_completed_at, status, created_at, updated_at FROM circulations",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
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

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_circulation_logs(conn: &rusqlite::Connection) -> Result<Vec<CirculationLog>, String> {
    let mut stmt = conn
        .prepare("SELECT id, circulation_id, completed_at, note, period, COALESCE(count, 1) as count FROM circulation_logs")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(CirculationLog {
                id: row.get(0)?,
                circulation_id: row.get(1)?,
                completed_at: row.get(2)?,
                note: row.get(3)?,
                period: row.get(4)?,
                count: row.get(5)?,
            })
        })
        .map_err(|e| e.to_string())?;

    Ok(rows.filter_map(|r| r.ok()).collect())
}

fn export_settings(conn: &rusqlite::Connection) -> Result<SettingsData, String> {
    // Export daily summary settings
    let daily_summary_settings = conn
        .query_row(
            "SELECT id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at FROM daily_summary_settings LIMIT 1",
            [],
            |row| {
                Ok(DailySummarySettingsData {
                    id: row.get(0)?,
                    enabled: row.get::<_, i32>(1)? != 0,
                    time: row.get(2)?,
                    include_pending: row.get::<_, i32>(3)? != 0,
                    include_overdue: row.get::<_, i32>(4)? != 0,
                    include_completed: row.get::<_, i32>(5)? != 0,
                    created_at: row.get(6)?,
                    updated_at: row.get(7)?,
                })
            },
        )
        .ok();

    // Export notification plugins
    let mut stmt = conn
        .prepare("SELECT id, name, plugin_type, enabled, config, created_at, updated_at FROM notification_plugins")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(NotificationPluginData {
                id: row.get(0)?,
                name: row.get(1)?,
                plugin_type: row.get(2)?,
                enabled: row.get::<_, i32>(3)? != 0,
                config: row.get(4)?,
                created_at: row.get(5)?,
                updated_at: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let notification_plugins: Vec<NotificationPluginData> = rows.filter_map(|r| r.ok()).collect();

    // Export global notification settings
    let global_notification_settings = conn
        .query_row(
            "SELECT id, master_enabled, desktop_enabled, sound_enabled, todo_default_enabled,
                    todo_default_times, plan_default_enabled, plan_default_times, target_default_enabled,
                    target_default_times, dnd_enabled, dnd_start_time, dnd_end_time, dnd_days,
                    channel_priority, retention_days, updated_at FROM global_notification_settings LIMIT 1",
            [],
            |row| {
                Ok(GlobalNotificationSettingsData {
                    id: row.get(0)?,
                    master_enabled: row.get::<_, i32>(1)? != 0,
                    desktop_enabled: row.get::<_, i32>(2)? != 0,
                    sound_enabled: row.get::<_, i32>(3)? != 0,
                    todo_default_enabled: row.get::<_, i32>(4)? != 0,
                    todo_default_times: row.get(5)?,
                    plan_default_enabled: row.get::<_, i32>(6)? != 0,
                    plan_default_times: row.get(7)?,
                    target_default_enabled: row.get::<_, i32>(8)? != 0,
                    target_default_times: row.get(9)?,
                    dnd_enabled: row.get::<_, i32>(10)? != 0,
                    dnd_start_time: row.get(11)?,
                    dnd_end_time: row.get(12)?,
                    dnd_days: row.get(13)?,
                    channel_priority: row.get(14)?,
                    retention_days: row.get(15)?,
                    updated_at: row.get(16)?,
                })
            },
        )
        .ok();

    // Export global circulation notification settings
    let global_circulation_notification_settings = conn
        .query_row(
            "SELECT id, master_enabled, default_reminder_type, default_fixed_time, default_before_minutes,
                    achievement_notifications, streak_milestones, count_milestones, default_channels,
                    dnd_enabled, dnd_start_time, dnd_end_time, updated_at FROM global_circulation_notification_settings LIMIT 1",
            [],
            |row| {
                Ok(GlobalCirculationNotificationSettingsData {
                    id: row.get(0)?,
                    master_enabled: row.get::<_, i32>(1)? != 0,
                    default_reminder_type: row.get(2)?,
                    default_fixed_time: row.get(3)?,
                    default_before_minutes: row.get(4)?,
                    achievement_notifications: row.get::<_, i32>(5)? != 0,
                    streak_milestones: row.get(6)?,
                    count_milestones: row.get(7)?,
                    default_channels: row.get(8)?,
                    dnd_enabled: row.get::<_, i32>(9)? != 0,
                    dnd_start_time: row.get(10)?,
                    dnd_end_time: row.get(11)?,
                    updated_at: row.get(12)?,
                })
            },
        )
        .ok();

    // Export circulation notification settings
    let mut stmt2 = conn
        .prepare(
            "SELECT id, circulation_id, enabled, reminder_type, fixed_time, before_minutes,
                         achievement_type, achievement_threshold, channels, message_template,
                         created_at, updated_at FROM circulation_notification_settings",
        )
        .map_err(|e| e.to_string())?;

    let rows2 = stmt2
        .query_map([], |row| {
            Ok(CirculationNotificationSettingsData {
                id: row.get(0)?,
                circulation_id: row.get(1)?,
                enabled: row.get::<_, i32>(2)? != 0,
                reminder_type: row.get(3)?,
                fixed_time: row.get(4)?,
                before_minutes: row.get(5)?,
                achievement_type: row.get(6)?,
                achievement_threshold: row.get(7)?,
                channels: row.get(8)?,
                message_template: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let circulation_notification_settings: Vec<CirculationNotificationSettingsData> =
        rows2.filter_map(|r| r.ok()).collect();

    Ok(SettingsData {
        daily_summary_settings,
        notification_plugins,
        global_notification_settings,
        global_circulation_notification_settings,
        circulation_notification_settings,
    })
}
