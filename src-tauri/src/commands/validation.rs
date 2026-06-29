// Input validation utilities for CRUD commands

use crate::commands::todo_status;

pub const VALID_PRIORITIES: [&str; 4] = ["P0", "P1", "P2", "P3"];
pub const VALID_TODO_STATUSES: [&str; 3] = todo_status::TODO_STATUSES;
pub const VALID_PLAN_STATUSES: [&str; 3] = ["active", "completed", "archived"];
pub const VALID_TARGET_STATUSES: [&str; 3] = ["active", "completed", "archived"];
pub const VALID_MILESTONE_STATUSES: [&str; 2] = ["pending", "completed"];
pub const VALID_CIRCULATION_STATUSES: [&str; 2] = ["active", "archived"];
pub const VALID_CIRCULATION_TYPES: [&str; 2] = ["periodic", "count"];
pub const VALID_FREQUENCIES: [&str; 3] = ["daily", "weekly", "monthly"];

pub fn validate_title(title: &str) -> Result<(), String> {
    let trimmed = title.trim();
    if trimmed.is_empty() {
        return Err("Title cannot be empty".to_string());
    }
    if trimmed.len() > 500 {
        return Err("Title cannot exceed 500 characters".to_string());
    }
    Ok(())
}

/// Validates priority: must be one of P0, P1, P2, P3
pub fn validate_priority(priority: &str) -> Result<(), String> {
    if !VALID_PRIORITIES.contains(&priority) {
        return Err(format!(
            "Invalid priority '{}'. Must be one of: {}",
            priority,
            VALID_PRIORITIES.join(", ")
        ));
    }
    Ok(())
}

pub fn validate_status(status: &str) -> Result<(), String> {
    if todo_status::validate_todo_status(status).is_err() {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            VALID_TODO_STATUSES.join(", ")
        ));
    }
    Ok(())
}

/// Validates plan status: must be one of active, completed, archived
pub fn validate_plan_status(status: &str) -> Result<(), String> {
    if !VALID_PLAN_STATUSES.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            VALID_PLAN_STATUSES.join(", ")
        ));
    }
    Ok(())
}

/// Validates target status: must be one of active, completed, archived
pub fn validate_target_status(status: &str) -> Result<(), String> {
    if !VALID_TARGET_STATUSES.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            VALID_TARGET_STATUSES.join(", ")
        ));
    }
    Ok(())
}

/// Validates milestone status: must be one of pending, completed
pub fn validate_milestone_status(status: &str) -> Result<(), String> {
    if !VALID_MILESTONE_STATUSES.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            VALID_MILESTONE_STATUSES.join(", ")
        ));
    }
    Ok(())
}

/// Validates circulation status: must be one of active, archived
pub fn validate_circulation_status(status: &str) -> Result<(), String> {
    if !VALID_CIRCULATION_STATUSES.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            VALID_CIRCULATION_STATUSES.join(", ")
        ));
    }
    Ok(())
}

/// Validates circulation type: must be one of periodic, count
pub fn validate_circulation_type(circulation_type: &str) -> Result<(), String> {
    if !VALID_CIRCULATION_TYPES.contains(&circulation_type) {
        return Err(format!(
            "Invalid circulation_type '{}'. Must be one of: {}",
            circulation_type,
            VALID_CIRCULATION_TYPES.join(", ")
        ));
    }
    Ok(())
}

/// Validates tag name: must be non-empty and length <= 100
pub fn validate_tag_name(name: &str) -> Result<(), String> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        return Err("Tag name cannot be empty".to_string());
    }
    if trimmed.len() > 100 {
        return Err("Tag name cannot exceed 100 characters".to_string());
    }
    Ok(())
}

/// Validates color: must be a valid hex color (#RRGGBB)
/// Returns Ok(color) if valid, Err(message) otherwise
pub fn validate_color(color: &str) -> Result<String, String> {
    if !color.starts_with('#') || color.len() != 7 {
        return Err(format!("Invalid color '{}'. Must be #RRGGBB", color));
    }
    let hex_part = &color[1..];
    if !hex_part.chars().all(|c| c.is_ascii_hexdigit()) {
        return Err(format!(
            "Invalid color '{}'. Contains non-hex characters",
            color
        ));
    }
    Ok(color.to_string())
}

/// Validates color and returns default #3B82F6 if invalid
pub fn normalize_color_or_default(color: &str) -> String {
    validate_color(color).unwrap_or_else(|_| "#3B82F6".to_string())
}

/// Validates frequency: must be one of daily, weekly, monthly
pub fn validate_frequency(frequency: &str) -> Result<(), String> {
    if !VALID_FREQUENCIES.contains(&frequency) {
        return Err(format!(
            "Invalid frequency '{}'. Must be one of: {}",
            frequency,
            VALID_FREQUENCIES.join(", ")
        ));
    }
    Ok(())
}
