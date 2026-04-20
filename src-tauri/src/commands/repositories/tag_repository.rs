use rusqlite::{params, Connection};

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
pub struct Tag {
    pub id: String,
    pub name: String,
    pub color: String,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
#[allow(dead_code)]
pub struct EntityTag {
    pub entity_type: String,
    pub entity_id: String,
    pub tag_id: String,
}

#[derive(Debug, serde::Serialize)]
pub struct BulkTagResult {
    pub entity_type: String,
    pub tag_id: String,
    pub success_count: usize,
    pub failed_ids: Vec<String>,
}

pub struct TagRepository;

impl TagRepository {
    pub fn get_by_id(conn: &Connection, id: &str) -> Result<Tag, String> {
        let mut stmt = conn
            .prepare("SELECT id, name, color, description, created_at FROM tags WHERE id = ?")
            .map_err(|e| e.to_string())?;

        stmt.query_row([id], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                description: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())
    }

    pub fn get_all(conn: &Connection) -> Result<Vec<Tag>, String> {
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
    }

    pub fn create(
        conn: &Connection,
        id: &str,
        name: &str,
        color: &str,
        description: Option<&str>,
    ) -> Result<Tag, String> {
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO tags (id, name, color, description, created_at) VALUES (?, ?, ?, ?, ?)",
            params![id, name, color, description, now],
        )
        .map_err(|e| e.to_string())?;

        Ok(Tag {
            id: id.to_string(),
            name: name.to_string(),
            color: color.to_string(),
            description: description.map(|s| s.to_string()),
            created_at: now,
        })
    }

    pub fn update(
        conn: &Connection,
        id: &str,
        name: Option<&str>,
        color: Option<&str>,
        description: Option<&str>,
    ) -> Result<Tag, String> {
        let existing = Self::get_by_id(conn, id)?;

        let new_name = name.unwrap_or(&existing.name);
        let new_color = color.unwrap_or(&existing.color);
        let new_description = description.or(existing.description.as_deref());

        conn.execute(
            "UPDATE tags SET name = ?, color = ?, description = ? WHERE id = ?",
            params![new_name, new_color, new_description, id],
        )
        .map_err(|e| e.to_string())?;

        Self::get_by_id(conn, id)
    }

    pub fn delete(conn: &Connection, id: &str) -> Result<(), String> {
        conn.execute("DELETE FROM tags WHERE id = ?", [id])
            .map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_by_entity(
        conn: &Connection,
        entity_type: &str,
        entity_id: &str,
    ) -> Result<Vec<Tag>, String> {
        let mut stmt = conn
            .prepare(
                "SELECT t.id, t.name, t.color, t.description, t.created_at 
                 FROM tags t 
                 INNER JOIN entity_tags et ON t.id = et.tag_id 
                 WHERE et.entity_type = ? AND et.entity_id = ?",
            )
            .map_err(|e| e.to_string())?;

        let tag_iter = stmt
            .query_map(params![entity_type, entity_id], |row| {
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
    }

    pub fn set_entity_tags(
        conn: &Connection,
        entity_type: &str,
        entity_id: &str,
        tag_ids: &[String],
    ) -> Result<(), String> {
        let tx = conn.transaction().map_err(|e| e.to_string())?;

        tx.execute(
            "DELETE FROM entity_tags WHERE entity_type = ? AND entity_id = ?",
            params![entity_type, entity_id],
        )
        .map_err(|e| e.to_string())?;

        for tag_id in tag_ids {
            tx.execute(
                "INSERT INTO entity_tags (entity_type, entity_id, tag_id) VALUES (?, ?, ?)",
                params![entity_type, entity_id, tag_id],
            )
            .map_err(|e| e.to_string())?;
        }

        tx.commit().map_err(|e| e.to_string())?;
        Ok(())
    }

    pub fn get_entities_by_tag(
        conn: &Connection,
        entity_type: &str,
        tag_ids: &[String],
    ) -> Result<Vec<String>, String> {
        if tag_ids.is_empty() {
            return Ok(vec![]);
        }

        let placeholders: Vec<String> = tag_ids.iter().map(|_| "?".to_string()).collect();
        let query = format!(
            "SELECT DISTINCT entity_id FROM entity_tags WHERE entity_type = ? AND tag_id IN ({})",
            placeholders.join(",")
        );

        let mut stmt = conn.prepare(&query).map_err(|e| e.to_string())?;

        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(entity_type.to_string())];
        for tag_id in tag_ids {
            params_vec.push(Box::new(tag_id.clone()));
        }
        let params_ref: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();

        let id_iter = stmt
            .query_map(params_ref.as_slice(), |row| row.get(0))
            .map_err(|e| e.to_string())?;

        Ok(id_iter.filter_map(|r| r.ok()).collect())
    }

    pub fn bulk_add_tags(
        conn: &Connection,
        entity_type: &str,
        entity_ids: &[String],
        tag_id: &str,
    ) -> Result<BulkTagResult, String> {
        let mut success_count = 0;
        let mut failed_ids = Vec::new();

        for entity_id in entity_ids {
            let exists: bool = conn
                .query_row(
                    "SELECT COUNT(*) FROM entity_tags WHERE entity_type = ? AND entity_id = ? AND tag_id = ?",
                    params![entity_type, entity_id, tag_id],
                    |row| row.get::<_, i32>(0).map(|count| count > 0),
                )
                .unwrap_or(false);

            if exists {
                success_count += 1;
                continue;
            }

            let result = conn.execute(
                "INSERT INTO entity_tags (entity_type, entity_id, tag_id) VALUES (?, ?, ?)",
                params![entity_type, entity_id, tag_id],
            );

            match result {
                Ok(_) => success_count += 1,
                Err(_) => failed_ids.push(entity_id.clone()),
            }
        }

        Ok(BulkTagResult {
            entity_type: entity_type.to_string(),
            tag_id: tag_id.to_string(),
            success_count,
            failed_ids,
        })
    }

    pub fn bulk_remove_tags(
        conn: &Connection,
        entity_type: &str,
        entity_ids: &[String],
        tag_id: &str,
    ) -> Result<BulkTagResult, String> {
        let mut success_count = 0;
        let mut failed_ids = Vec::new();

        for entity_id in entity_ids {
            let result = conn.execute(
                "DELETE FROM entity_tags WHERE entity_type = ? AND entity_id = ? AND tag_id = ?",
                params![entity_type, entity_id, tag_id],
            );

            match result {
                Ok(rows_affected) => {
                    if rows_affected > 0 || rows_affected == 0 {
                        success_count += 1;
                    }
                }
                Err(_) => failed_ids.push(entity_id.clone()),
            }
        }

        Ok(BulkTagResult {
            entity_type: entity_type.to_string(),
            tag_id: tag_id.to_string(),
            success_count,
            failed_ids,
        })
    }
}
