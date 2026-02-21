// Library crate for Tauri Android builds
pub use crate::models::AppState;

mod commands;
mod db;
mod models;
#[cfg(test)]
mod tests;

use log::info;
use rusqlite::Connection;
use std::io::Write;
use std::sync::Mutex;

pub fn run() {
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

    info!("Starting Plan Todos application...");

    // Initialize database
    let db_path = dirs::data_local_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("."))
        .join("plan-todos")
        .join("data.db");

    // Create directory if it doesn't exist
    if let Some(parent) = db_path.parent() {
        std::fs::create_dir_all(parent).ok();
    }

    info!("Database path: {:?}", db_path);
    let conn = Connection::open(&db_path).expect("Failed to open database");

    // Initialize database schema
    db::init_db(&conn).expect("Failed to initialize database");

    // Create AppState
    let state = AppState {
        db: Mutex::new(conn),
    };

    info!("Database initialized successfully");

    // Run Tauri application
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(state)
        .invoke_handler(tauri::generate_handler![
            commands::dashboard::get_dashboard,
            commands::todos::get_todos,
            commands::todos::create_todo,
            commands::todos::update_todo,
            commands::todos::delete_todo,
            commands::plans::get_plans,
            commands::plans::create_plan,
            commands::plans::update_plan,
            commands::plans::delete_plan,
            commands::targets::get_targets,
            commands::targets::create_target,
            commands::targets::update_target,
            commands::targets::delete_target,
            commands::milestones::get_milestones,
            commands::milestones::create_milestone,
            commands::milestones::update_milestone,
            commands::milestones::delete_milestone,
            commands::circulations::get_circulations,
            commands::circulations::get_circulations_by_type,
            commands::circulations::create_circulation,
            commands::circulations::update_circulation,
            commands::circulations::delete_circulation,
            commands::circulations::checkin_circulation,
            commands::circulations::undo_checkin_circulation,
            commands::circulations::get_circulation_logs,
            commands::tags::get_tags,
            commands::tags::create_tag,
            commands::tags::update_tag,
            commands::tags::delete_tag,
            commands::tasks::get_tasks,
            commands::tasks::create_task,
            commands::tasks::update_task,
            commands::tasks::delete_task,
            commands::steps::get_steps,
            commands::steps::create_step,
            commands::steps::update_step,
            commands::steps::delete_step,
            commands::search::search_all,
            commands::import::import_data,
            commands::export::export_data,
            commands::statistics::get_statistics,
            commands::notification_plugins::get_notification_plugins,
            commands::notifications::get_notification_settings,
            commands::notifications::set_notification_settings,
            commands::notifications::delete_notification_settings,
            commands::notifications::get_daily_summary_settings,
            commands::notifications::update_daily_summary_settings,
            commands::notifications::get_due_reminders,
            commands::notifications::mark_reminder_sent,
            commands::notifications::get_daily_summary,
            commands::batch::bulk_update_todo_status,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
