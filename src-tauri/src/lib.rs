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
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
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

    // Run Tauri application with setup hook to initialize database
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Get app data directory using Tauri v2 path API
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");

            // Create directory if it doesn't exist
            std::fs::create_dir_all(&app_data_dir).ok();

            let db_path = app_data_dir.join("data.db");
            info!("Database path: {:?}", db_path);

            let conn = Connection::open(&db_path).expect("Failed to open database");
            db::init_db(&conn).expect("Failed to initialize database");

            // Create AppState and manage it
            let state = AppState {
                db: Mutex::new(conn),
            };
            app.manage(state);

            info!("Database initialized successfully");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::dashboard::get_dashboard,
            commands::todos::get_todo,
            commands::todos::get_todos,
            commands::todos::create_todo,
            commands::todos::update_todo,
            commands::todos::delete_todo,
            commands::plans::get_plan,
            commands::plans::get_plans,
            commands::plans::create_plan,
            commands::plans::update_plan,
            commands::plans::delete_plan,
            commands::targets::get_target,
            commands::targets::get_targets,
            commands::targets::create_target,
            commands::targets::update_target,
            commands::targets::delete_target,
            commands::milestones::get_milestone,
            commands::milestones::get_milestones,
            commands::milestones::create_milestone,
            commands::milestones::update_milestone,
            commands::milestones::delete_milestone,
            commands::circulations::get_circulation,
            commands::circulations::get_circulations,
            commands::circulations::get_circulations_by_type,
            commands::circulations::create_circulation,
            commands::circulations::update_circulation,
            commands::circulations::delete_circulation,
            commands::circulations::checkin::checkin_circulation,
            commands::circulations::checkin::undo_checkin_circulation,
            commands::circulations::statistics::get_circulation_logs,
            commands::circulations::statistics::get_circulation_logs_batch,
            commands::tags::get_tags,
            commands::tags::create_tag,
            commands::tags::update_tag,
            commands::tags::delete_tag,
            commands::tags::get_entity_tags,
            commands::tags::set_entity_tags,
            commands::tags::get_entities_by_tag,
            commands::tasks::get_task,
            commands::tasks::get_tasks,
            commands::tasks::get_tasks_by_plan,
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
            commands::notification_plugins::create_notification_plugin,
            commands::notification_plugins::update_notification_plugin,
            commands::notification_plugins::delete_notification_plugin,
            commands::notification_plugins::send_notification,
            commands::notifications::get_notification_settings,
            commands::notifications::set_notification_settings,
            commands::notifications::delete_notification_settings,
            commands::notifications::get_daily_summary_settings,
            commands::notifications::update_daily_summary_settings,
            commands::notifications::get_due_reminders,
            commands::notifications::mark_reminder_sent,
            commands::notifications::get_daily_summary,
            commands::batch::bulk_update_todo_status,
            commands::batch::bulk_update_task_status,
            commands::batch::bulk_update_step_status,
            commands::batch::bulk_delete_todos,
            commands::batch::bulk_delete_tasks,
            commands::data::seed_test_data,
            commands::data::reset_data,
            commands::window::minimize_window,
            commands::window::toggle_maximize,
            commands::window::close_window,
            commands::window::is_maximized,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
