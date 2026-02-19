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
    // Unified fields for flexible linking to any entity
    pub biz_type: Option<String>, // 'plan' | 'task' | 'target' | 'circulation'
    pub biz_id: Option<String>,
    pub status: String, // pending | completed
    pub progress: i32,  // Calculated from linked entity (0-100)
    pub created_at: String,
    pub updated_at: String,
}

// Circulation - 打卡
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Circulation {
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub circulation_type: String,         // 'periodic' | 'count'
    pub frequency: Option<String>,        // 'daily' | 'weekly' | 'monthly' (periodic only)
    pub frequency_config: Option<String>, // JSON config (e.g., {"weekdays": [1,2,3]})
    pub target_count: Option<i32>,        // target count (count only)
    pub current_count: i32,               // current count (count only)
    pub streak_count: i32,                // current streak (periodic only)
    pub best_streak: i32,                 // best streak (periodic only)
    pub last_completed_at: Option<String>,
    pub status: String, // 'active' | 'archived'
    pub created_at: String,
    pub updated_at: String,
}

// CirculationLog - 打卡记录
#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct CirculationLog {
    pub id: String,
    pub circulation_id: String,
    pub completed_at: String,
    pub note: Option<String>,
    pub period: Option<String>, // periodic: "2024-W05" / "2024-02"
}
