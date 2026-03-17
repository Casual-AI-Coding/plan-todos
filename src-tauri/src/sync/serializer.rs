// Sync Serializer - serializes/deserializes data for sync
// Phase 6: Data format handling

use rusqlite::Connection;
use serde_json::Value;
use std::sync::Mutex;

/// Serializes entities for sync transfer
pub struct SyncSerializer {
    db: Mutex<Connection>,
}

impl SyncSerializer {
    pub fn new(db: Mutex<Connection>) -> Self {
        Self { db }
    }

    /// Serialize an entity to JSON
    pub fn serialize_entity(&self, entity_type: &str, entity_id: &str) -> Result<Value, String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        match entity_type {
            "todo" => serialize_todo(&conn, entity_id),
            "plan" => serialize_plan(&conn, entity_id),
            "task" => serialize_task(&conn, entity_id),
            "target" => serialize_target(&conn, entity_id),
            "step" => serialize_step(&conn, entity_id),
            "milestone" => serialize_milestone(&conn, entity_id),
            "circulation" => serialize_circulation(&conn, entity_id),
            "tag" => serialize_tag(&conn, entity_id),
            _ => Err(format!("Unknown entity type: {}", entity_type)),
        }
    }

    /// Deserialize and apply an entity from JSON
    pub fn deserialize_entity(&self, entity_type: &str, data: &Value) -> Result<(), String> {
        // TODO: Implement in Wave 4
        Err("Deserialization not yet implemented".to_string())
    }
}

// Helper serialization functions

fn serialize_todo(conn: &Connection, id: &str) -> Result<Value, String> {
    let row = conn.query_row(
        "SELECT id, title, content, due_date, status, priority, created_at, updated_at FROM todos WHERE id = ?",
        [id],
        |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "title": row.get::<_, String>(1)?,
                "content": row.get::<_, Option<String>>(2)?,
                "due_date": row.get::<_, Option<String>>(3)?,
                "status": row.get::<_, String>(4)?,
                "priority": row.get::<_, String>(5)?,
                "created_at": row.get::<_, String>(6)?,
                "updated_at": row.get::<_, String>(7)?,
            }))
        },
    ).map_err(|e| e.to_string())?;
    Ok(row)
}

fn serialize_plan(conn: &Connection, id: &str) -> Result<Value, String> {
    let row = conn.query_row(
        "SELECT id, title, description, start_date, end_date, status, created_at, updated_at FROM plans WHERE id = ?",
        [id],
        |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "title": row.get::<_, String>(1)?,
                "description": row.get::<_, Option<String>>(2)?,
                "start_date": row.get::<_, Option<String>>(3)?,
                "end_date": row.get::<_, Option<String>>(4)?,
                "status": row.get::<_, String>(5)?,
                "created_at": row.get::<_, String>(6)?,
                "updated_at": row.get::<_, String>(7)?,
            }))
        },
    ).map_err(|e| e.to_string())?;
    Ok(row)
}

fn serialize_task(conn: &Connection, id: &str) -> Result<Value, String> {
    let row = conn.query_row(
        "SELECT id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at FROM tasks WHERE id = ?",
        [id],
        |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "plan_id": row.get::<_, String>(1)?,
                "title": row.get::<_, String>(2)?,
                "description": row.get::<_, Option<String>>(3)?,
                "start_date": row.get::<_, Option<String>>(4)?,
                "end_date": row.get::<_, Option<String>>(5)?,
                "status": row.get::<_, String>(6)?,
                "priority": row.get::<_, String>(7)?,
                "created_at": row.get::<_, String>(8)?,
                "updated_at": row.get::<_, String>(9)?,
            }))
        },
    ).map_err(|e| e.to_string())?;
    Ok(row)
}

fn serialize_target(conn: &Connection, id: &str) -> Result<Value, String> {
    let row = conn.query_row(
        "SELECT id, title, description, due_date, status, progress, created_at, updated_at FROM targets WHERE id = ?",
        [id],
        |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "title": row.get::<_, String>(1)?,
                "description": row.get::<_, Option<String>>(2)?,
                "due_date": row.get::<_, Option<String>>(3)?,
                "status": row.get::<_, String>(4)?,
                "progress": row.get::<_, i32>(5)?,
                "created_at": row.get::<_, String>(6)?,
                "updated_at": row.get::<_, String>(7)?,
            }))
        },
    ).map_err(|e| e.to_string())?;
    Ok(row)
}

fn serialize_step(conn: &Connection, id: &str) -> Result<Value, String> {
    let row = conn.query_row(
        "SELECT id, target_id, title, weight, status, priority, created_at, updated_at FROM steps WHERE id = ?",
        [id],
        |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "target_id": row.get::<_, String>(1)?,
                "title": row.get::<_, String>(2)?,
                "weight": row.get::<_, i32>(3)?,
                "status": row.get::<_, String>(4)?,
                "priority": row.get::<_, String>(5)?,
                "created_at": row.get::<_, String>(6)?,
                "updated_at": row.get::<_, String>(7)?,
            }))
        },
    ).map_err(|e| e.to_string())?;
    Ok(row)
}

fn serialize_milestone(conn: &Connection, id: &str) -> Result<Value, String> {
    let row = conn.query_row(
        "SELECT id, title, target_date, biz_type, biz_id, status, progress, created_at, updated_at FROM milestones WHERE id = ?",
        [id],
        |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "title": row.get::<_, String>(1)?,
                "target_date": row.get::<_, Option<String>>(2)?,
                "biz_type": row.get::<_, Option<String>>(3)?,
                "biz_id": row.get::<_, Option<String>>(4)?,
                "status": row.get::<_, String>(5)?,
                "progress": row.get::<_, i32>(6)?,
                "created_at": row.get::<_, String>(7)?,
                "updated_at": row.get::<_, String>(8)?,
            }))
        },
    ).map_err(|e| e.to_string())?;
    Ok(row)
}

fn serialize_circulation(conn: &Connection, id: &str) -> Result<Value, String> {
    let row = conn.query_row(
        "SELECT id, title, content, circulation_type, frequency, frequency_config, target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at FROM circulations WHERE id = ?",
        [id],
        |row| {
            Ok(serde_json::json!({
                "id": row.get::<_, String>(0)?,
                "title": row.get::<_, String>(1)?,
                "content": row.get::<_, Option<String>>(2)?,
                "circulation_type": row.get::<_, String>(3)?,
                "frequency": row.get::<_, Option<String>>(4)?,
                "frequency_config": row.get::<_, Option<String>>(5)?,
                "target_count": row.get::<_, Option<i32>>(6)?,
                "current_count": row.get::<_, i32>(7)?,
                "streak_count": row.get::<_, i32>(8)?,
                "best_streak": row.get::<_, i32>(9)?,
                "last_completed_at": row.get::<_, Option<String>>(10)?,
                "status": row.get::<_, String>(11)?,
                "created_at": row.get::<_, String>(12)?,
                "updated_at": row.get::<_, String>(13)?,
            }))
        },
    ).map_err(|e| e.to_string())?;
    Ok(row)
}

fn serialize_tag(conn: &Connection, id: &str) -> Result<Value, String> {
    let row = conn
        .query_row(
            "SELECT id, name, color, description, created_at FROM tags WHERE id = ?",
            [id],
            |row| {
                Ok(serde_json::json!({
                    "id": row.get::<_, String>(0)?,
                    "name": row.get::<_, String>(1)?,
                    "color": row.get::<_, String>(2)?,
                    "description": row.get::<_, Option<String>>(3)?,
                    "created_at": row.get::<_, String>(4)?,
                }))
            },
        )
        .map_err(|e| e.to_string())?;
    Ok(row)
}
