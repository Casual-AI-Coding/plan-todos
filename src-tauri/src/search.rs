// Search module for full-text search across all entities

use crate::log_command;
use crate::AppState;
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SearchResult {
    pub entity_type: String,
    pub id: String,
    pub title: String,
    pub content: Option<String>,
    pub status: String,
}

#[tauri::command]
pub fn search_all(
    state: tauri::State<AppState>,
    query: String,
) -> Result<Vec<SearchResult>, String> {
    log_command!("search_all", {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        let mut results = Vec::new();
        let pattern = format!("%{}%", query);

        // Search todos (title, content)
        let mut stmt = conn
            .prepare(
                "SELECT id, title, content, status FROM todos WHERE title LIKE ? OR content LIKE ?",
            )
            .map_err(|e| e.to_string())?;
        let todos = stmt
            .query_map([&pattern, &pattern], |row| {
                Ok(SearchResult {
                    entity_type: "todo".to_string(),
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    status: row.get(3)?,
                })
            })
            .map_err(|e| e.to_string())?;
        results.extend(todos.filter_map(|r| r.ok()));

        // Search plans (title, description)
        let mut stmt = conn
            .prepare("SELECT id, title, description, status FROM plans WHERE title LIKE ? OR description LIKE ?")
            .map_err(|e| e.to_string())?;
        let plans = stmt
            .query_map([&pattern, &pattern], |row| {
                Ok(SearchResult {
                    entity_type: "plan".to_string(),
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    status: row.get(3)?,
                })
            })
            .map_err(|e| e.to_string())?;
        results.extend(plans.filter_map(|r| r.ok()));

        // Search tasks (title, description)
        let mut stmt = conn
            .prepare("SELECT id, title, description, status FROM tasks WHERE title LIKE ? OR description LIKE ?")
            .map_err(|e| e.to_string())?;
        let tasks = stmt
            .query_map([&pattern, &pattern], |row| {
                Ok(SearchResult {
                    entity_type: "task".to_string(),
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    status: row.get(3)?,
                })
            })
            .map_err(|e| e.to_string())?;
        results.extend(tasks.filter_map(|r| r.ok()));

        // Search targets (title, description)
        let mut stmt = conn
            .prepare("SELECT id, title, description, status FROM targets WHERE title LIKE ? OR description LIKE ?")
            .map_err(|e| e.to_string())?;
        let targets = stmt
            .query_map([&pattern, &pattern], |row| {
                Ok(SearchResult {
                    entity_type: "target".to_string(),
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: row.get(2)?,
                    status: row.get(3)?,
                })
            })
            .map_err(|e| e.to_string())?;
        results.extend(targets.filter_map(|r| r.ok()));

        // Search milestones (title only)
        let mut stmt = conn
            .prepare("SELECT id, title, status FROM milestones WHERE title LIKE ?")
            .map_err(|e| e.to_string())?;
        let milestones = stmt
            .query_map([&pattern], |row| {
                Ok(SearchResult {
                    entity_type: "milestone".to_string(),
                    id: row.get(0)?,
                    title: row.get(1)?,
                    content: None,
                    status: row.get(2)?,
                })
            })
            .map_err(|e| e.to_string())?;
        results.extend(milestones.filter_map(|r| r.ok()));

        Ok(results)
    })
}
