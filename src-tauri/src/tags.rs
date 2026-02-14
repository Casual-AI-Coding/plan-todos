// Tag CRUD commands

use crate::log_command;
use crate::AppState;

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct EntityTag {
    pub entity_type: String,
    pub entity_id: String,
    pub tag_id: String,
}

#[tauri::command]
pub fn get_tags(state: tauri::State<AppState>) -> Result<Vec<Tag>, String> {
    log_command!("get_tags", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id, name, color, description, created_at FROM tags ORDER BY name")
            .map_err(|e| e.to_string())?;

        let tag_iter = stmt
            .query_map([], |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    description: row.get(3)?,
                    created_at: row.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?;

        Ok(tag_iter.filter_map(|t| t.ok()).collect())
    })
}

#[tauri::command]
pub fn create_tag(
    state: tauri::State<AppState>,
    name: String,
    color: Option<String>,
    description: Option<String>,
) -> Result<Tag, String> {
    log_command!("create_tag", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        // Validate name is not empty
        let name = name.trim().to_string();
        if name.is_empty() {
            return Err("Tag name cannot be empty".to_string());
        }

        let id = uuid::Uuid::new_v4().to_string();
        let now = chrono::Utc::now().to_rfc3339();

        // Validate and use default color
        let color = color.unwrap_or_else(|| "#3B82F6".to_string());
        let color = if color.starts_with('#') && color.len() == 7 {
            color
        } else {
            "#3B82F6".to_string()
        };

        conn.execute(
            "INSERT INTO tags (id, name, color, description, created_at) VALUES (?, ?, ?, ?, ?)",
            rusqlite::params![id, name, color, description, now],
        )
        .map_err(|e| e.to_string())?;

        Ok(Tag {
            id,
            name,
            color,
            description,
            created_at: now,
        })
    })
}

#[tauri::command]
pub fn update_tag(
    state: tauri::State<AppState>,
    id: String,
    name: Option<String>,
    color: Option<String>,
    description: Option<String>,
) -> Result<Tag, String> {
    log_command!("update_tag", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare("SELECT id, name, color, description, created_at FROM tags WHERE id = ?")
            .map_err(|e| e.to_string())?;

        let tag: Tag = stmt
            .query_row([&id], |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    description: row.get(3)?,
                    created_at: row.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?;

        // Validate name if provided
        let new_name = name.map(|n| n.trim().to_string());
        if let Some(ref n) = new_name {
            if n.is_empty() {
                return Err("Tag name cannot be empty".to_string());
            }
        }
        let new_name = new_name.unwrap_or(tag.name);

        // Validate color if provided
        let new_color = color.map(|c| {
            if c.starts_with('#') && c.len() == 7 {
                c
            } else {
                tag.color.clone()
            }
        });
        let new_color = new_color.unwrap_or(tag.color);

        // Description can be cleared (None) or set
        let new_description = description;

        conn.execute(
            "UPDATE tags SET name = ?, color = ?, description = ? WHERE id = ?",
            rusqlite::params![new_name, new_color, new_description, id],
        )
        .map_err(|e| e.to_string())?;

        Ok(Tag {
            id: tag.id,
            name: new_name,
            color: new_color,
            description: new_description,
            created_at: tag.created_at,
        })
    })
}

#[tauri::command]
pub fn delete_tag(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_tag", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.execute("DELETE FROM tags WHERE id = ?", [&id])
            .map_err(|e| e.to_string())?;
        Ok(())
    })
}

#[tauri::command]
pub fn get_entity_tags(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_id: String,
) -> Result<Vec<Tag>, String> {
    log_command!("get_entity_tags", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        let mut stmt = conn
            .prepare(
                "SELECT t.id, t.name, t.color, t.description, t.created_at 
                 FROM tags t 
                 INNER JOIN entity_tags et ON t.id = et.tag_id 
                 WHERE et.entity_type = ? AND et.entity_id = ?",
            )
            .map_err(|e| e.to_string())?;

        let tag_iter = stmt
            .query_map(rusqlite::params![entity_type, entity_id], |row| {
                Ok(Tag {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    color: row.get(2)?,
                    description: row.get(3)?,
                    created_at: row.get(4)?,
                })
            })
            .map_err(|e| e.to_string())?;

        Ok(tag_iter.filter_map(|t| t.ok()).collect())
    })
}

#[tauri::command]
pub fn set_entity_tags(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_id: String,
    tag_ids: Vec<String>,
) -> Result<(), String> {
    log_command!("set_entity_tags", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        // Use transaction for data safety
        let tx = conn.unchecked_transaction().map_err(|e| e.to_string())?;

        // Delete existing tags for this entity
        tx.execute(
            "DELETE FROM entity_tags WHERE entity_type = ? AND entity_id = ?",
            rusqlite::params![entity_type, entity_id],
        )
        .map_err(|e| e.to_string())?;

        // Insert new tags
        for tag_id in tag_ids {
            tx.execute(
                "INSERT INTO entity_tags (entity_type, entity_id, tag_id) VALUES (?, ?, ?)",
                rusqlite::params![entity_type, entity_id, tag_id],
            )
            .map_err(|e| e.to_string())?;
        }

        tx.commit().map_err(|e| e.to_string())?;

        Ok(())
    })
}

#[tauri::command]
pub fn get_entities_by_tag(
    state: tauri::State<AppState>,
    entity_type: String,
    tag_ids: Vec<String>,
) -> Result<Vec<String>, String> {
    log_command!("get_entities_by_tag", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;

        if tag_ids.is_empty() {
            return Ok(vec![]);
        }

        let placeholders: Vec<String> = tag_ids.iter().map(|_| "?".to_string()).collect();
        let query = format!(
            "SELECT DISTINCT entity_id FROM entity_tags WHERE entity_type = ? AND tag_id IN ({})",
            placeholders.join(",")
        );

        let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

        let mut params: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(entity_type.clone())];
        for tag_id in &tag_ids {
            params.push(Box::new(tag_id.clone()));
        }
        let params_ref: Vec<&dyn rusqlite::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        let id_iter = stmt
            .query_map(params_ref.as_slice(), |row| row.get(0))
            .map_err(|e| e.to_string())?;

        Ok(id_iter.filter_map(|r| r.ok()).collect())
    })
}
