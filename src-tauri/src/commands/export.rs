// Export functionality

use crate::models::{Milestone, Plan, Step, Target, Task, Todo};
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

// Re-export import types for backward compatibility
pub use super::import::{ImportData, ImportResult};

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
        .prepare("SELECT id, title, target_date, plan_id, task_id, target_id, status, progress, created_at, updated_at FROM milestones")
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(Milestone {
                id: row.get(0)?,
                title: row.get(1)?,
                target_date: row.get(2)?,
                plan_id: row.get(3)?,
                task_id: row.get(4)?,
                target_id: row.get(5)?,
                status: row.get(6)?,
                progress: row.get(7)?,
                created_at: row.get(8)?,
                updated_at: row.get(9)?,
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

    Ok(SettingsData {
        daily_summary_settings,
        notification_plugins,
    })
}
