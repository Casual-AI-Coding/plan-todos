#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;
use rusqlite::Connection;
use std::io::Write;
use std::sync::Mutex;

// Re-export AppState for use in modules
pub use crate::models::AppState;

// Module declarations
mod batch;
mod command_log;
mod dashboard;
mod db;
mod milestones;
mod models;
mod notification_plugins;
mod notifications;
mod plans;
mod statistics;
mod steps;
mod targets;
mod tasks;
#[cfg(test)]
mod tests;
mod todos;

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
            plans::get_plan,
            plans::get_plans,
            plans::create_plan,
            plans::update_plan,
            plans::delete_plan,
            // Task
            tasks::get_task,
            tasks::get_tasks,
            tasks::get_tasks_by_plan,
            tasks::create_task,
            tasks::update_task,
            tasks::delete_task,
            // Target
            targets::get_target,
            targets::get_targets,
            targets::create_target,
            targets::update_target,
            targets::delete_target,
            // Step
            steps::get_steps,
            steps::create_step,
            steps::update_step,
            steps::delete_step,
            // Todo
            todos::get_todo,
            todos::get_todos,
            todos::create_todo,
            todos::update_todo,
            todos::delete_todo,
            // Milestone
            milestones::get_milestone,
            milestones::get_milestones,
            milestones::create_milestone,
            milestones::update_milestone,
            milestones::delete_milestone,
            // Statistics
            statistics::get_statistics,
            // Dashboard
            dashboard::get_dashboard,
            // Batch operations
            batch::bulk_update_todo_status,
            batch::bulk_update_task_status,
            batch::bulk_update_step_status,
            batch::bulk_delete_todos,
            batch::bulk_delete_tasks,
            // Notifications
            notifications::get_notification_settings,
            notifications::set_notification_settings,
            notifications::delete_notification_settings,
            notifications::get_daily_summary_settings,
            notifications::update_daily_summary_settings,
            notifications::get_due_reminders,
            notifications::mark_reminder_sent,
            notifications::get_daily_summary,
            // Notification Plugins
            notification_plugins::get_notification_plugins,
            notification_plugins::create_notification_plugin,
            notification_plugins::update_notification_plugin,
            notification_plugins::delete_notification_plugin,
            notification_plugins::send_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
