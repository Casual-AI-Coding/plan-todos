// Import functionality

use crate::export::{
    DailySummarySettingsData, EntityTagRow, ExportDataContent, NotificationPluginData,
    SettingsData, TagData,
};
use crate::AppState;
use serde::{Deserialize, Serialize};

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

// ============================================================================
// Merge Mode - Skip on conflict
// ============================================================================

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
                "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![milestone.id, milestone.title, milestone.target_date, milestone.plan_id, milestone.task_id, milestone.target_id, milestone.status, milestone.created_at, milestone.updated_at],
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
                [&et.entity_type, &et.entity_id, &et.tag_id],
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
                Err(e) => errors.push(format!("EntityTag {}: {}", et.entity_id, e)),
            }
        }
    }

    // Import settings
    if let Some(ref settings) = data.settings.daily_summary_settings {
        conn.execute("DELETE FROM daily_summary_settings", []).ok();
        conn.execute(
            "INSERT INTO daily_summary_settings (id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![settings.id, settings.enabled, settings.time, settings.include_pending, settings.include_overdue, settings.include_completed, settings.created_at, settings.updated_at],
        ).ok();
    }

    for plugin in &data.settings.notification_plugins {
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM notification_plugins WHERE id = ?)",
                [&plugin.id],
                |row| row.get(0),
            )
            .unwrap_or(false);

        if exists {
            skipped += 1;
        } else {
            match conn.execute(
                "INSERT INTO notification_plugins (id, name, plugin_type, enabled, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                rusqlite::params![plugin.id, plugin.name, plugin.plugin_type, plugin.enabled, plugin.config, plugin.created_at, plugin.updated_at],
            ) {
                Ok(_) => imported += 1,
                Err(e) => errors.push(format!("Plugin {}: {}", plugin.id, e)),
            }
        }
    }

    Ok(ImportResult {
        imported,
        skipped,
        errors,
    })
}

// ============================================================================
// Replace Mode - Clear all and import
// ============================================================================

fn import_replace(
    conn: &rusqlite::Connection,
    data: &ExportDataContent,
) -> Result<ImportResult, String> {
    let mut imported = 0usize;
    let mut skipped = 0usize;
    let mut errors = Vec::new();

    // Clear all tables (in reverse dependency order)
    conn.execute("DELETE FROM entity_tags", []).ok();
    conn.execute("DELETE FROM milestones", []).ok();
    conn.execute("DELETE FROM steps", []).ok();
    conn.execute("DELETE FROM tasks", []).ok();
    conn.execute("DELETE FROM todos", []).ok();
    conn.execute("DELETE FROM targets", []).ok();
    conn.execute("DELETE FROM plans", []).ok();
    conn.execute("DELETE FROM daily_summary_settings", []).ok();
    conn.execute("DELETE FROM notification_plugins", []).ok();
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
            "INSERT INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![milestone.id, milestone.title, milestone.target_date, milestone.plan_id, milestone.task_id, milestone.target_id, milestone.status, milestone.created_at, milestone.updated_at],
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
            Err(e) => errors.push(format!("EntityTag {}: {}", et.entity_id, e)),
        }
    }

    // Import settings
    if let Some(ref settings) = data.settings.daily_summary_settings {
        conn.execute(
            "INSERT INTO daily_summary_settings (id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![settings.id, settings.enabled, settings.time, settings.include_pending, settings.include_overdue, settings.include_completed, settings.created_at, settings.updated_at],
        ).ok();
    }

    for plugin in &data.settings.notification_plugins {
        match conn.execute(
            "INSERT INTO notification_plugins (id, name, plugin_type, enabled, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![plugin.id, plugin.name, plugin.plugin_type, plugin.enabled, plugin.config, plugin.created_at, plugin.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Plugin {}: {}", plugin.id, e)),
        }
    }

    Ok(ImportResult {
        imported,
        skipped,
        errors,
    })
}

// ============================================================================
// Update Mode - Upsert (update if exists, insert if not)
// ============================================================================

fn import_update(
    conn: &rusqlite::Connection,
    data: &ExportDataContent,
) -> Result<ImportResult, String> {
    let mut imported = 0usize;
    let mut skipped = 0usize;
    let mut errors = Vec::new();

    // Import tags (upsert)
    for tag in &data.tags {
        match conn.execute(
            "INSERT OR REPLACE INTO tags (id, name, color, description, created_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![tag.id, tag.name, tag.color, tag.description, tag.created_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Tag {}: {}", tag.id, e)),
        }
    }

    // Import plans (upsert)
    for plan in &data.plans {
        match conn.execute(
            "INSERT OR REPLACE INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![plan.id, plan.title, plan.description, plan.start_date, plan.end_date, plan.status, plan.created_at, plan.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Plan {}: {}", plan.id, e)),
        }
    }

    // Import targets (upsert)
    for target in &data.targets {
        match conn.execute(
            "INSERT OR REPLACE INTO targets (id, title, description, due_date, status, progress, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![target.id, target.title, target.description, target.due_date, target.status, target.progress, target.created_at, target.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Target {}: {}", target.id, e)),
        }
    }

    // Import todos (upsert)
    for todo in &data.todos {
        match conn.execute(
            "INSERT OR REPLACE INTO todos (id, title, content, due_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![todo.id, todo.title, todo.content, todo.due_date, todo.status, todo.priority, todo.created_at, todo.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Todo {}: {}", todo.id, e)),
        }
    }

    // Import tasks (upsert)
    for task in &data.tasks {
        match conn.execute(
            "INSERT OR REPLACE INTO tasks (id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![task.id, task.plan_id, task.title, task.description, task.start_date, task.end_date, task.status, task.priority, task.created_at, task.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Task {}: {}", task.id, e)),
        }
    }

    // Import steps (upsert)
    for step in &data.steps {
        match conn.execute(
            "INSERT OR REPLACE INTO steps (id, target_id, title, weight, status, priority, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![step.id, step.target_id, step.title, step.weight, step.status, step.priority, step.created_at, step.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Step {}: {}", step.id, e)),
        }
    }

    // Import milestones (upsert)
    for milestone in &data.milestones {
        match conn.execute(
            "INSERT OR REPLACE INTO milestones (id, title, target_date, plan_id, task_id, target_id, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![milestone.id, milestone.title, milestone.target_date, milestone.plan_id, milestone.task_id, milestone.target_id, milestone.status, milestone.created_at, milestone.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Milestone {}: {}", milestone.id, e)),
        }
    }

    // Import entity_tags (upsert)
    for et in &data.entity_tags {
        match conn.execute(
            "INSERT OR REPLACE INTO entity_tags (entity_type, entity_id, tag_id) VALUES (?, ?, ?)",
            rusqlite::params![et.entity_type, et.entity_id, et.tag_id],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("EntityTag {}: {}", et.entity_id, e)),
        }
    }

    // Import settings (replace)
    conn.execute("DELETE FROM daily_summary_settings", []).ok();
    if let Some(ref settings) = data.settings.daily_summary_settings {
        conn.execute(
            "INSERT INTO daily_summary_settings (id, enabled, time, include_pending, include_overdue, include_completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![settings.id, settings.enabled, settings.time, settings.include_pending, settings.include_overdue, settings.include_completed, settings.created_at, settings.updated_at],
        ).ok();
    }

    for plugin in &data.settings.notification_plugins {
        match conn.execute(
            "INSERT OR REPLACE INTO notification_plugins (id, name, plugin_type, enabled, config, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            rusqlite::params![plugin.id, plugin.name, plugin.plugin_type, plugin.enabled, plugin.config, plugin.created_at, plugin.updated_at],
        ) {
            Ok(_) => imported += 1,
            Err(e) => errors.push(format!("Plugin {}: {}", plugin.id, e)),
        }
    }

    Ok(ImportResult {
        imported,
        skipped,
        errors,
    })
}
