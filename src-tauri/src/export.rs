// Export/Import functionality

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

// ============================================================================
// Import Data Structures
// ============================================================================

#[derive(Debug, Deserialize)]
pub struct ImportData {
    pub version: String,
    pub data: ExportDataContent,
}

#[derive(Debug, Serialize)]
pub struct ImportResult {
    pub imported: usize,
    pub skipped: usize,
    pub errors: Vec<String>,
}

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

// ============================================================================
// Import Command
// ============================================================================

#[tauri::command]
pub fn import_data(
    state: tauri::State<AppState>,
    data: ImportData,
    mode: String,
) -> Result<ImportResult, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    match mode.as_str() {
        "merge" => import_merge(&conn, &data.data),
        "replace" => import_replace(&conn, &data.data),
        "update" => import_update(&conn, &data.data),
        _ => Err("Invalid mode. Use 'merge', 'replace', or 'update'".to_string()),
    }
}

fn import_merge(
    conn: &rusqlite::Connection,
    data: &ExportDataContent,
) -> Result<ImportResult, String> {
    let mut imported = 0usize;
    let mut skipped = 0usize;
    let mut errors = Vec::new();

    // Import tags first (dependencies)
    for tag in &data.tags {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM tags WHERE id = ?)",
                [&tag.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO tags (id, name, color, description, created_at) VALUES (?, ?, ?, ?, ?)",
                rusqlite::params![tag.id, tag.name, tag.color, tag.description, tag.created_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Tag {}: {}", tag.id, e)),
            }
        }
    }

    // Import plans
    for plan in &data.plans {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM plans WHERE id = ?)",
                [&plan.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![plan.id, plan.title, plan.description, plan.start_date, plan.end_date, plan.status, plan.created_at, plan.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Plan {}: {}", plan.id, e)),
            }
        }
    }

    // Import targets
    for target in &data.targets {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM targets WHERE id = ?)",
                [&target.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO targets (id, title, description, due_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![target.id, target.title, target.description, target.due_date, target.status, target.progress, target.created_at, target.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Target {}: {}", target.id, e)),
            }
        }
    }

    // Import todos
    for todo in &data.todos {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM todos WHERE id = ?)",
                [&todo.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO todos (id, title, content, due_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![todo.id, todo.title, todo.content, todo.due_date, todo.status, todo.priority, todo.created_at, todo.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Todo {}: {}", todo.id, e)),
            }
        }
    }

    // Import tasks
    for task in &data.tasks {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM tasks WHERE id = ?)",
                [&task.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![task.id, task.plan_id, task.title, task.description, task.start_date, task.end_date, task.status, task.priority, task.created_at, task.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Task {}: {}", task.id, e)),
            }
        }
    }

    // Import steps
    for step in &data.steps {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM steps WHERE id = ?)",
                [&step.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO steps (id, target_id, title, weight, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![step.id, step.target_id, step.title, step.weight, step.status, step.priority, step.created_at, step.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Step {}: {}", step.id, e)),
            }
        }
    }

    // Import milestones
    for milestone in &data.milestones {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM milestones WHERE id = ?)",
                [&milestone.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![milestone.id, milestone.title, milestone.target_date, milestone.plan_id, milestone.task_id, milestone.target_id, milestone.status, milestone.progress, milestone.created_at, milestone.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Milestone {}: {}", milestone.id, e)),
            }
        }
    }

    // Import entity_tags
    for et in &data.entity_tags {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM entity_tags WHERE entity_type = ? AND entity_id = ? AND tag_id = ?)",
                rusqlite::params![et.entity_type, et.entity_id, et.tag_id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO entity_tags (entity_type, entity_id, tag_id) VALUES (?, ?, ?)",
                rusqlite::params![et.entity_type, et.entity_id, et.tag_id],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!(
                    "EntityTag {}: {}/{}: {}",
                    et.tag_id, et.entity_type, et.entity_id, e
                )),
            }
        }
    }

    Ok(ImportResult {
        imported,
        skipped,
        errors,
    })
}

fn import_replace(
    conn: &rusqlite::Connection,
    data: &ExportDataContent,
) -> Result<ImportResult, String> {
    let mut imported = 0usize;
    let mut errors = Vec::new();

    // Delete in reverse order (due to foreign keys)
    conn.execute("DELETE FROM entity_tags", []).ok();
    conn.execute("DELETE FROM steps", []).ok();
    conn.execute("DELETE FROM milestones", []).ok();
    conn.execute("DELETE FROM tasks", []).ok();
    conn.execute("DELETE FROM todos", []).ok();
    conn.execute("DELETE FROM targets", []).ok();
    conn.execute("DELETE FROM plans", []).ok();
    conn.execute("DELETE FROM tags", []).ok();

    // Import tags
    for tag in &data.tags {
        match conn.execute(
            "INSERT INTO tags (id, name, color, description, created_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![tag.id, tag.name, tag.color, tag.description, tag.created_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Tag {}: {}", tag.id, e)),
        }
    }

    // Import plans
    for plan in &data.plans {
        match conn.execute(
            "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![plan.id, plan.title, plan.description, plan.start_date, plan.end_date, plan.status, plan.created_at, plan.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Plan {}: {}", plan.id, e)),
        }
    }

    // Import targets
    for target in &data.targets {
        match conn.execute(
            "INSERT INTO targets (id, title, description, due_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![target.id, target.title, target.description, target.due_date, target.status, target.progress, target.created_at, target.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Target {}: {}", target.id, e)),
        }
    }

    // Import todos
    for todo in &data.todos {
        match conn.execute(
            "INSERT INTO todos (id, title, content, due_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![todo.id, todo.title, todo.content, todo.due_date, todo.status, todo.priority, todo.created_at, todo.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Todo {}: {}", todo.id, e)),
        }
    }

    // Import tasks
    for task in &data.tasks {
        match conn.execute(
            "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![task.id, task.plan_id, task.title, task.description, task.start_date, task.end_date, task.status, task.priority, task.created_at, task.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Task {}: {}", task.id, e)),
        }
    }

    // Import steps
    for step in &data.steps {
        match conn.execute(
            "INSERT INTO steps (id, target_id, title, weight, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![step.id, step.target_id, step.title, step.weight, step.status, step.priority, step.created_at, step.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Step {}: {}", step.id, e)),
        }
    }

    // Import milestones
    for milestone in &data.milestones {
        match conn.execute(
            "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![milestone.id, milestone.title, milestone.target_date, milestone.plan_id, milestone.task_id, milestone.target_id, milestone.status, milestone.progress, milestone.created_at, milestone.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Milestone {}: {}", milestone.id, e)),
        }
    }

    // Import entity_tags
    for et in &data.entity_tags {
        match conn.execute(
            "INSERT INTO entity_tags (entity_type, entity_id, tag_id) VALUES (?, ?, ?)",
            rusqlite::params![et.entity_type, et.entity_id, et.tag_id],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!(
                "EntityTag {}: {}/{}: {}",
                et.tag_id, et.entity_type, et.entity_id, e
            )),
        }
    }

    Ok(ImportResult {
        imported,
        skipped: 0,
        errors,
    })
}

fn import_update(
    conn: &rusqlite::Connection,
    data: &ExportDataContent,
) -> Result<ImportResult, String> {
    let mut imported = 0usize;
    let mut skipped = 0usize;
    let mut errors = Vec::new();

    // Upsert tags
    for tag in &data.tags {
        match conn.execute(
            "INSERT OR REPLACE INTO tags (id, name, color, description, created_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![tag.id, tag.name, tag.color, tag.description, tag.created_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Tag {}: {}", tag.id, e)),
        }
    }

    // Upsert plans
    for plan in &data.plans {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM plans WHERE id = ?)",
                [&plan.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            match conn.execute(
                "UPDATE plans SET title = ?, description = ?, start_date = ?, end_date = ?, status = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![plan.title, plan.description, plan.start_date, plan.end_date, plan.status, plan.updated_at, plan.id],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Plan {}: {}", plan.id, e)),
            }
        } else {
            match conn.execute(
                "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![plan.id, plan.title, plan.description, plan.start_date, plan.end_date, plan.status, plan.created_at, plan.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Plan {}: {}", plan.id, e)),
            }
        }
        if !exists {
            skipped += 1;
        }
    }

    // Upsert targets
    for target in &data.targets {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM targets WHERE id = ?)",
                [&target.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            match conn.execute(
                "UPDATE targets SET title = ?, description = ?, due_date = ?, status = ?, progress = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![target.title, target.description, target.due_date, target.status, target.progress, target.updated_at, target.id],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Target {}: {}", target.id, e)),
            }
        } else {
            match conn.execute(
                "INSERT INTO targets (id, title, description, due_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![target.id, target.title, target.description, target.due_date, target.status, target.progress, target.created_at, target.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Target {}: {}", target.id, e)),
            }
        }
        if !exists {
            skipped += 1;
        }
    }

    // Upsert todos
    for todo in &data.todos {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM todos WHERE id = ?)",
                [&todo.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            match conn.execute(
                "UPDATE todos SET title = ?, content = ?, due_date = ?, status = ?, priority = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![todo.title, todo.content, todo.due_date, todo.status, todo.priority, todo.updated_at, todo.id],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Todo {}: {}", todo.id, e)),
            }
        } else {
            match conn.execute(
                "INSERT INTO todos (id, title, content, due_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![todo.id, todo.title, todo.content, todo.due_date, todo.status, todo.priority, todo.created_at, todo.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Todo {}: {}", todo.id, e)),
            }
        }
        if !exists {
            skipped += 1;
        }
    }

    // Upsert tasks
    for task in &data.tasks {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM tasks WHERE id = ?)",
                [&task.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            match conn.execute(
                "UPDATE tasks SET plan_id = ?, title = ?, description = ?, start_date = ?, end_date = ?, status = ?, priority = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![task.plan_id, task.title, task.description, task.start_date, task.end_date, task.status, task.priority, task.updated_at, task.id],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Task {}: {}", task.id, e)),
            }
        } else {
            match conn.execute(
                "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![task.id, task.plan_id, task.title, task.description, task.start_date, task.end_date, task.status, task.priority, task.created_at, task.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Task {}: {}", task.id, e)),
            }
        }
        if !exists {
            skipped += 1;
        }
    }

    // Upsert steps
    for step in &data.steps {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM steps WHERE id = ?)",
                [&step.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            match conn.execute(
                "UPDATE steps SET target_id = ?, title = ?, weight = ?, status = ?, priority = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![step.target_id, step.title, step.weight, step.status, step.priority, step.updated_at, step.id],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Step {}: {}", step.id, e)),
            }
        } else {
            match conn.execute(
                "INSERT INTO steps (id, target_id, title, weight, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![step.id, step.target_id, step.title, step.weight, step.status, step.priority, step.created_at, step.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Step {}: {}", step.id, e)),
            }
        }
        if !exists {
            skipped += 1;
        }
    }

    // Upsert milestones
    for milestone in &data.milestones {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM milestones WHERE id = ?)",
                [&milestone.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            match conn.execute(
                "UPDATE milestones SET title = ?, target_date = ?, plan_id = ?, task_id = ?, target_id = ?, status = ?, progress = ?, updated_at = ? WHERE id = ?",
                rusqlite::params![milestone.title, milestone.target_date, milestone.plan_id, milestone.task_id, milestone.target_id, milestone.status, milestone.progress, milestone.updated_at, milestone.id],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Milestone {}: {}", milestone.id, e)),
            }
        } else {
            match conn.execute(
                "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![milestone.id, milestone.title, milestone.target_date, milestone.plan_id, milestone.task_id, milestone.target_id, milestone.status, milestone.progress, milestone.created_at, milestone.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Milestone {}: {}", milestone.id, e)),
            }
        }
        if !exists {
            skipped += 1;
        }
    }

    // Upsert entity_tags
    for et in &data.entity_tags {
        match conn.execute(
            "INSERT OR REPLACE INTO entity_tags (entity_type, entity_id, tag_id) VALUES (?, ?, ?)",
            rusqlite::params![et.entity_type, et.entity_id, et.tag_id],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!(
                "EntityTag {}: {}/{}: {}",
                et.tag_id, et.entity_type, et.entity_id, e
            )),
        }
    }

    Ok(ImportResult {
        imported,
        skipped,
        errors,
    })
}
