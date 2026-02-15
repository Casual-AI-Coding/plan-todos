#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;
use rusqlite::Connection;
use std::io::Write;
use std::sync::Mutex;

// Re-export AppState for use in modules
pub use crate::models::AppState;

// Module declarations
mod commands;
mod db;
mod models;
#[cfg(test)]
mod tests;

fn main() {
    // Initialize logger with info level
    env_logger::Builder::from_default_env()
        .filter_level(log::LevelFilter::Info)
        .format(|buf, record| {
            writeln!(
                buf,
                "[{} {} {}] {}",
                chrono::Local::now().format("%Y-%m-%d %H:%M:%S"),
                record.level(),
                record.target(),
                record.args()
            )
        })
        .init();

    info!("Starting Plan Todos application");

    // Initialize database
    let db_path = dirs::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("plan-todos")
        .join("data.db");

    // Create directory if it doesn't exist
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).ok();
    }

    let conn = Connection::open(&db_path).expect("Failed to open database");
    db::init_db(&conn).expect("Failed to initialize database");

    info!("Database opened at: {:?}", db_path);

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            db: Mutex::new(conn),
        })
        .invoke_handler(tauri::generate_handler![
            // Plan
            commands::plans::get_plan,
            commands::plans::get_plans,
            commands::plans::create_plan,
            commands::plans::update_plan,
            commands::plans::delete_plan,
            // Task
            commands::tasks::get_task,
            commands::tasks::get_tasks,
            commands::tasks::get_tasks_by_plan,
            commands::tasks::create_task,
            commands::tasks::update_task,
            commands::tasks::delete_task,
            // Target
            commands::targets::get_target,
            commands::targets::get_targets,
            commands::targets::create_target,
            commands::targets::update_target,
            commands::targets::delete_target,
            // Step
            commands::steps::get_steps,
            commands::steps::create_step,
            commands::steps::update_step,
            commands::steps::delete_step,
            // Todo
            commands::todos::get_todo,
            commands::todos::get_todos,
            commands::todos::create_todo,
            commands::todos::update_todo,
            commands::todos::delete_todo,
            // Milestone
            commands::milestones::get_milestone,
            commands::milestones::get_milestones,
            commands::milestones::create_milestone,
            commands::milestones::update_milestone,
            commands::milestones::delete_milestone,
            // Statistics
            commands::statistics::get_statistics,
            // Dashboard
            commands::dashboard::get_dashboard,
            // Batch operations
            commands::batch::bulk_update_todo_status,
            commands::batch::bulk_update_task_status,
            commands::batch::bulk_update_step_status,
            commands::batch::bulk_delete_todos,
            commands::batch::bulk_delete_tasks,
            // Notifications
            commands::notifications::get_notification_settings,
            commands::notifications::set_notification_settings,
            commands::notifications::delete_notification_settings,
            commands::notifications::get_daily_summary_settings,
            commands::notifications::update_daily_summary_settings,
            commands::notifications::get_due_reminders,
            commands::notifications::mark_reminder_sent,
            commands::notifications::get_daily_summary,
            // Notification Plugins
            commands::notification_plugins::get_notification_plugins,
            commands::notification_plugins::create_notification_plugin,
            commands::notification_plugins::update_notification_plugin,
            commands::notification_plugins::delete_notification_plugin,
            commands::notification_plugins::send_notification,
            // Search
            commands::search::search_all,
            // Tags
            commands::tags::get_tags,
            commands::tags::create_tag,
            commands::tags::update_tag,
            commands::tags::delete_tag,
            commands::tags::get_entity_tags,
            commands::tags::set_entity_tags,
            commands::tags::get_entities_by_tag,
            // Export/Import
            commands::export::export_data,
            commands::import::import_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
