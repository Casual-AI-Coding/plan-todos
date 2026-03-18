// Sync Serializer - serializes/deserializes data for sync
// Phase 6: Data format handling

use rusqlite::Connection;
use serde_json::Value;
use std::sync::{Arc, Mutex};

/// Serializes entities for sync transfer
pub struct SyncSerializer {
    db: Arc<Mutex<Connection>>,
}

impl SyncSerializer {
    pub fn new(db: Arc<Mutex<Connection>>) -> Self {
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
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        match entity_type {
            "todo" => deserialize_todo(&conn, data),
            "plan" => deserialize_plan(&conn, data),
            "task" => deserialize_task(&conn, data),
            "target" => deserialize_target(&conn, data),
            "step" => deserialize_step(&conn, data),
            "milestone" => deserialize_milestone(&conn, data),
            "circulation" => deserialize_circulation(&conn, data),
            "tag" => deserialize_tag(&conn, data),
            _ => Err(format!("Unknown entity type: {}", entity_type)),
        }
    }

    /// Delete an entity locally (tombstone application)
    pub fn delete_entity(&self, entity_type: &str, entity_id: &str) -> Result<(), String> {
        let conn = self.db.lock().map_err(|e| e.to_string())?;

        let table = match entity_type {
            "todo" => "todos",
            "plan" => "plans",
            "task" => "tasks",
            "target" => "targets",
            "step" => "steps",
            "milestone" => "milestones",
            "circulation" => "circulations",
            "tag" => "tags",
            _ => return Err(format!("Unknown entity type: {}", entity_type)),
        };

        conn.execute(&format!("DELETE FROM {} WHERE id = ?1", table), [entity_id])
            .map_err(|e| e.to_string())?;

        Ok(())
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

// Deserialization helper functions

fn deserialize_todo(conn: &Connection, data: &Value) -> Result<(), String> {
    let id = data["id"].as_str().ok_or("Missing id")?;
    let title = data["title"].as_str().ok_or("Missing title")?;
    let content = data["content"].as_str();
    let due_date = data["due_date"].as_str();
    let status = data["status"].as_str().unwrap_or("pending");
    let priority = data["priority"].as_str().unwrap_or("P2");
    let created_at = data["created_at"].as_str().ok_or("Missing created_at")?;
    let updated_at = data["updated_at"].as_str().ok_or("Missing updated_at")?;

    conn.execute(
        "INSERT INTO todos (id, title, content, due_date, status, priority, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(id) DO UPDATE SET
            title = ?2, content = ?3, due_date = ?4, status = ?5, priority = ?6,
            updated_at = ?8",
        rusqlite::params![id, title, content, due_date, status, priority, created_at, updated_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn deserialize_plan(conn: &Connection, data: &Value) -> Result<(), String> {
    let id = data["id"].as_str().ok_or("Missing id")?;
    let title = data["title"].as_str().ok_or("Missing title")?;
    let description = data["description"].as_str();
    let start_date = data["start_date"].as_str();
    let end_date = data["end_date"].as_str();
    let status = data["status"].as_str().unwrap_or("active");
    let created_at = data["created_at"].as_str().ok_or("Missing created_at")?;
    let updated_at = data["updated_at"].as_str().ok_or("Missing updated_at")?;

    conn.execute(
        "INSERT INTO plans (id, title, description, start_date, end_date, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(id) DO UPDATE SET
            title = ?2, description = ?3, start_date = ?4, end_date = ?5, status = ?6,
            updated_at = ?8",
        rusqlite::params![id, title, description, start_date, end_date, status, created_at, updated_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn deserialize_task(conn: &Connection, data: &Value) -> Result<(), String> {
    let id = data["id"].as_str().ok_or("Missing id")?;
    let plan_id = data["plan_id"].as_str().ok_or("Missing plan_id")?;
    let title = data["title"].as_str().ok_or("Missing title")?;
    let description = data["description"].as_str();
    let start_date = data["start_date"].as_str();
    let end_date = data["end_date"].as_str();
    let status = data["status"].as_str().unwrap_or("pending");
    let priority = data["priority"].as_str().unwrap_or("P2");
    let created_at = data["created_at"].as_str().ok_or("Missing created_at")?;
    let updated_at = data["updated_at"].as_str().ok_or("Missing updated_at")?;

    conn.execute(
        "INSERT INTO tasks (id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
         ON CONFLICT(id) DO UPDATE SET
            plan_id = ?2, title = ?3, description = ?4, start_date = ?5, end_date = ?6,
            status = ?7, priority = ?8, updated_at = ?10",
        rusqlite::params![id, plan_id, title, description, start_date, end_date, status, priority, created_at, updated_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn deserialize_target(conn: &Connection, data: &Value) -> Result<(), String> {
    let id = data["id"].as_str().ok_or("Missing id")?;
    let title = data["title"].as_str().ok_or("Missing title")?;
    let description = data["description"].as_str();
    let due_date = data["due_date"].as_str();
    let status = data["status"].as_str().unwrap_or("active");
    let progress = data["progress"].as_i64().unwrap_or(0) as i32;
    let created_at = data["created_at"].as_str().ok_or("Missing created_at")?;
    let updated_at = data["updated_at"].as_str().ok_or("Missing updated_at")?;

    conn.execute(
        "INSERT INTO targets (id, title, description, due_date, status, progress, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(id) DO UPDATE SET
            title = ?2, description = ?3, due_date = ?4, status = ?5, progress = ?6,
            updated_at = ?8",
        rusqlite::params![id, title, description, due_date, status, progress, created_at, updated_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn deserialize_step(conn: &Connection, data: &Value) -> Result<(), String> {
    let id = data["id"].as_str().ok_or("Missing id")?;
    let target_id = data["target_id"].as_str().ok_or("Missing target_id")?;
    let title = data["title"].as_str().ok_or("Missing title")?;
    let weight = data["weight"].as_i64().unwrap_or(0) as i32;
    let status = data["status"].as_str().unwrap_or("pending");
    let priority = data["priority"].as_str().unwrap_or("P2");
    let created_at = data["created_at"].as_str().ok_or("Missing created_at")?;
    let updated_at = data["updated_at"].as_str().ok_or("Missing updated_at")?;

    conn.execute(
        "INSERT INTO steps (id, target_id, title, weight, status, priority, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
         ON CONFLICT(id) DO UPDATE SET
            target_id = ?2, title = ?3, weight = ?4, status = ?5, priority = ?6,
            updated_at = ?8",
        rusqlite::params![id, target_id, title, weight, status, priority, created_at, updated_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn deserialize_milestone(conn: &Connection, data: &Value) -> Result<(), String> {
    let id = data["id"].as_str().ok_or("Missing id")?;
    let title = data["title"].as_str().ok_or("Missing title")?;
    let target_date = data["target_date"].as_str();
    let biz_type = data["biz_type"].as_str();
    let biz_id = data["biz_id"].as_str();
    let status = data["status"].as_str().unwrap_or("pending");
    let progress = data["progress"].as_i64().unwrap_or(0) as i32;
    let created_at = data["created_at"].as_str().ok_or("Missing created_at")?;
    let updated_at = data["updated_at"].as_str().ok_or("Missing updated_at")?;

    conn.execute(
        "INSERT INTO milestones (id, title, target_date, biz_type, biz_id, status, progress, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
         ON CONFLICT(id) DO UPDATE SET
            title = ?2, target_date = ?3, biz_type = ?4, biz_id = ?5, status = ?6, progress = ?7,
            updated_at = ?9",
        rusqlite::params![id, title, target_date, biz_type, biz_id, status, progress, created_at, updated_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn deserialize_circulation(conn: &Connection, data: &Value) -> Result<(), String> {
    let id = data["id"].as_str().ok_or("Missing id")?;
    let title = data["title"].as_str().ok_or("Missing title")?;
    let content = data["content"].as_str();
    let circulation_type = data["circulation_type"]
        .as_str()
        .ok_or("Missing circulation_type")?;
    let frequency = data["frequency"].as_str();
    let frequency_config = data["frequency_config"].as_str();
    let target_count = data["target_count"].as_i64().map(|v| v as i32);
    let current_count = data["current_count"].as_i64().unwrap_or(0) as i32;
    let streak_count = data["streak_count"].as_i64().unwrap_or(0) as i32;
    let best_streak = data["best_streak"].as_i64().unwrap_or(0) as i32;
    let last_completed_at = data["last_completed_at"].as_str();
    let status = data["status"].as_str().unwrap_or("active");
    let created_at = data["created_at"].as_str().ok_or("Missing created_at")?;
    let updated_at = data["updated_at"].as_str().ok_or("Missing updated_at")?;

    conn.execute(
        "INSERT INTO circulations (id, title, content, circulation_type, frequency, frequency_config, 
         target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
         ON CONFLICT(id) DO UPDATE SET
            title = ?2, content = ?3, circulation_type = ?4, frequency = ?5, frequency_config = ?6,
            target_count = ?7, current_count = ?8, streak_count = ?9, best_streak = ?10,
            last_completed_at = ?11, status = ?12, updated_at = ?14",
        rusqlite::params![id, title, content, circulation_type, frequency, frequency_config,
            target_count, current_count, streak_count, best_streak, last_completed_at, status, created_at, updated_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

fn deserialize_tag(conn: &Connection, data: &Value) -> Result<(), String> {
    let id = data["id"].as_str().ok_or("Missing id")?;
    let name = data["name"].as_str().ok_or("Missing name")?;
    let color = data["color"].as_str().unwrap_or("#808080");
    let description = data["description"].as_str();
    let created_at = data["created_at"].as_str().ok_or("Missing created_at")?;

    conn.execute(
        "INSERT INTO tags (id, name, color, description, created_at)
         VALUES (?1, ?2, ?3, ?4, ?5)
         ON CONFLICT(id) DO UPDATE SET
            name = ?2, color = ?3, description = ?4",
        rusqlite::params![id, name, color, description, created_at],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}
