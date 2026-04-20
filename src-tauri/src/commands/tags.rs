// Tag CRUD commands

use super::validation::{normalize_color_or_default, validate_tag_name};
use crate::commands::repositories::tag_repository::{BulkTagResult, EntityTag, Tag};
use crate::commands::repositories::TagRepository;
use crate::log_command;
use crate::AppState;

#[tauri::command]
pub fn get_tags(state: tauri::State<AppState>) -> Result<Vec<Tag>, String> {
    log_command!("get_tags", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TagRepository::get_all(&conn)
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

        // Validate name using centralized validation
        validate_tag_name(&name)?;
        let name = name.trim().to_string();

        let id = uuid::Uuid::new_v4().to_string();

        // Validate and normalize color using centralized validation
        let color = normalize_color_or_default(&color.unwrap_or_default());

        TagRepository::create(&conn, &id, &name, &color, description.as_deref())
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

        // Validate name if provided using centralized validation
        if let Some(ref n) = name {
            validate_tag_name(n)?;
        }

        // Validate and normalize color if provided
        let normalized_color = color.map(|c| normalize_color_or_default(&c));

        TagRepository::update(
            &conn,
            &id,
            name.as_deref(),
            normalized_color.as_deref(),
            description.as_deref(),
        )
    })
}

#[tauri::command]
pub fn delete_tag(state: tauri::State<AppState>, id: String) -> Result<(), String> {
    log_command!("delete_tag", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TagRepository::delete(&conn, &id)
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
        TagRepository::get_by_entity(&conn, &entity_type, &entity_id)
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
        TagRepository::set_entity_tags(&*conn, &entity_type, &entity_id, &tag_ids)
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
        TagRepository::get_entities_by_tag(&conn, &entity_type, &tag_ids)
    })
}

/// Result for bulk tag operations (imported from tag_repository)

#[tauri::command]
pub fn bulk_add_tags(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_ids: Vec<String>,
    tag_id: String,
) -> Result<BulkTagResult, String> {
    log_command!("bulk_add_tags", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TagRepository::bulk_add_tags(&conn, &entity_type, &entity_ids, &tag_id)
    })
}

#[tauri::command]
pub fn bulk_remove_tags(
    state: tauri::State<AppState>,
    entity_type: String,
    entity_ids: Vec<String>,
    tag_id: String,
) -> Result<BulkTagResult, String> {
    log_command!("bulk_remove_tags", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        TagRepository::bulk_remove_tags(&conn, &entity_type, &entity_ids, &tag_id)
    })
}
