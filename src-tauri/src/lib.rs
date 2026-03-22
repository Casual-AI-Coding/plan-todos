// Library crate for Tauri Android builds
pub use crate::models::AppState;

mod background;
mod commands;
mod db;
mod models;
mod sync;
#[cfg(test)]
mod tests;

use log::info;
use rusqlite::Connection;
use std::io::Write;
use std::sync::{Arc, Mutex};
use tauri::Manager;
use crate::sync::SyncState;

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
        .plugin(tauri_plugin_deep_link::init())
        .setup(|app| {
            // Get app data directory using Tauri v2 path API
            let app_data_dir = match app.path().app_data_dir() {
                Ok(dir) => dir,
                Err(e) => {
                    log::error!("Failed to get app data directory: {}", e);
                    return Err(Box::new(std::io::Error::new(
                        std::io::ErrorKind::NotFound,
                        format!("Failed to get app data directory: {}", e),
                    )) as Box<dyn std::error::Error>);
                }
            };

            // Create directory if it doesn't exist
            if let Err(e) = std::fs::create_dir_all(&app_data_dir) {
                log::error!("Failed to create app data directory: {}", e);
                return Err(Box::new(e) as Box<dyn std::error::Error>);
            }

            let db_path = app_data_dir.join("data.db");
            info!("Database path: {:?}", db_path);

            let conn = match Connection::open(&db_path) {
                Ok(c) => c,
                Err(e) => {
                    log::error!("Failed to open database at {:?}: {}", db_path, e);
                    return Err(Box::new(e) as Box<dyn std::error::Error>);
                }
            };

            if let Err(e) = db::init_db(&conn) {
                log::error!("Failed to initialize database: {}", e);
                return Err(Box::new(e) as Box<dyn std::error::Error>);
            }

            // Create AppState and manage it
            let state = AppState {
                db: Arc::new(Mutex::new(conn)),
            };
            app.manage(state);

            // Initialize and manage scheduler state
            let scheduler_state = background::SchedulerState::new();
            app.manage(scheduler_state);

            // Initialize and manage sync state for real-time progress tracking
            let sync_state = Arc::new(SyncState::new());
            app.manage(sync_state);

            // Start the background sync scheduler
            background::start_sync_scheduler(app.handle());

            info!("Database initialized successfully");
            info!("Background sync scheduler started");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::dashboard::get_dashboard,
            commands::todos::get_todo,
            commands::todos::get_todos,
            commands::todos::create_todo,
            commands::todos::update_todo,
            commands::todos::delete_todo,
            commands::todos::update_todo_sort_order,
            commands::todos::reorder_todos,
            commands::plans::get_plan,
            commands::plans::get_plans,
            commands::plans::create_plan,
            commands::plans::update_plan,
            commands::plans::delete_plan,
            commands::plans::update_plan_sort_order,
            commands::plans::reorder_plans,
            commands::targets::get_target,
            commands::targets::get_targets,
            commands::targets::create_target,
            commands::targets::update_target,
            commands::targets::delete_target,
            commands::targets::update_target_sort_order,
            commands::targets::reorder_targets,
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
            commands::tags::bulk_add_tags,
            commands::tags::bulk_remove_tags,
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
            commands::notifications::get_notification_history,
            commands::notifications::get_pending_notifications,
            commands::notifications::get_global_notification_settings,
            commands::notifications::update_global_notification_settings,
            commands::notifications::reset_global_notification_settings,
            commands::notifications::send_test_notification,
            commands::circulation_notifications::get_circulation_notification_settings,
            commands::circulation_notifications::update_circulation_notification_settings,
            commands::circulation_notifications::delete_circulation_notification_settings,
            commands::circulation_notifications::get_global_circulation_notification_settings,
            commands::circulation_notifications::update_global_circulation_notification_settings,
            commands::circulation_notifications::get_circulations_with_notification_settings,
            commands::batch::bulk_update_todo_status,
            commands::batch::bulk_update_task_status,
            commands::batch::bulk_update_step_status,
            commands::batch::bulk_delete_todos,
            commands::batch::bulk_delete_tasks,
            commands::batch::bulk_update_todos,
            commands::batch::bulk_archive_todos,
            commands::batch::bulk_update_plans,
            commands::batch::bulk_delete_plans,
            commands::batch::bulk_update_targets,
            commands::batch::bulk_delete_targets,
            commands::data::seed::seed_test_data,
            commands::data::reset::reset_data,
            commands::window::minimize_window,
            commands::window::toggle_maximize,
            commands::window::close_window,
            commands::window::is_maximized,
            // Update commands
            commands::update::check_for_updates,
            commands::update::skip_version,
            // Sync commands (Phase 6)
            commands::sync::get_sync_config,
            commands::sync::update_sync_config,
            commands::sync::test_sync_connection,
            commands::sync::save_sync_credentials,
            commands::sync::get_sync_username,
            commands::sync::delete_sync_credentials,
            commands::sync::has_sync_credentials,
            commands::sync::get_sync_status,
            commands::sync::trigger_sync,
            commands::sync::get_pending_changes_count,
            commands::sync::get_sync_logs,
            commands::sync::get_device_info,
            commands::sync::update_device_name,
            commands::sync::get_synced_devices,
            commands::sync::get_pending_conflicts,
            commands::sync::resolve_conflict,
            commands::sync::resolve_all_conflicts,
            // Scheduler commands (Phase 6 - Wave 7)
            commands::sync::get_scheduler_status,
            commands::sync::start_scheduler,
            commands::sync::stop_scheduler,
            commands::sync::set_sync_interval,
            commands::sync::trigger_background_sync,
            commands::sync::reset_circuit_breaker,
            // Sync progress command (Phase 6 - v0.7.1)
            commands::sync::get_sync_progress,
            // Google Drive commands
            commands::google_drive::get_google_drive_auth_url,
            commands::google_drive::exchange_google_drive_code,
            commands::google_drive::get_google_drive_status,
            commands::google_drive::google_drive_upload,
            commands::google_drive::google_drive_download,
            commands::google_drive::google_drive_list_files,
            commands::google_drive::google_drive_disconnect,
            commands::google_drive::google_drive_sync,
            commands::google_drive::google_drive_restore,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running tauri application");
}
