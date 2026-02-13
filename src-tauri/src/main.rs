#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use log::info;
use rusqlite::Connection;
use std::sync::Mutex;

// Re-export AppState for use in modules
pub use crate::models::AppState;

// Module declarations
mod dashboard;
mod db;
mod milestones;
mod models;
mod plans;
mod statistics;
mod steps;
mod targets;
mod tasks;
mod todos;

fn main() {
    env_logger::init();
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
