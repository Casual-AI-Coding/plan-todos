// Data Models

use rusqlite::Connection;
use std::sync::Mutex;

// Database state
pub struct AppState {
    pub db: Mutex<Connection>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Plan {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: String, // active | completed | archived
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Task {
    pub id: String,
    pub plan_id: String,
    pub title: String,
    pub description: Option<String>,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub status: String,   // pending | in-progress | done
    pub priority: String, // P0 | P1 | P2 | P3 (default P2)
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Target {
    pub id: String,
    pub title: String,
    pub description: Option<String>,
    pub due_date: Option<String>,
    pub status: String, // active | completed | archived
    pub progress: i32,  // Calculated from Steps (0-100)
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Step {
    pub id: String,
    pub target_id: String,
    pub title: String,
    pub weight: i32,      // 0-100, sum should not exceed 100
    pub status: String,   // pending | completed
    pub priority: String, // P0 | P1 | P2 | P3 (default P2)
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Todo {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub due_date: Option<String>,
    pub status: String,   // pending | in-progress | done
    pub priority: String, // P0 | P1 | P2 | P3 (default P2)
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Milestone {
    pub id: String,
    pub title: String,
    pub target_date: Option<String>,
    // One of these three will be set
    pub plan_id: Option<String>,
    pub task_id: Option<String>,
    pub target_id: Option<String>,
    pub status: String, // pending | completed
    pub progress: i32,  // Calculated from linked entity (0-100)
    pub created_at: String,
    pub updated_at: String,
}
