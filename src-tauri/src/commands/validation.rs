// Input validation utilities for CRUD commands

/// Validates title: must be non-empty and length <= 500
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
    let valid_priorities = ["P0", "P1", "P2", "P3"];
    if !valid_priorities.contains(&priority) {
        return Err(format!(
            "Invalid priority '{}'. Must be one of: {}",
            priority,
            valid_priorities.join(", ")
        ));
    }
    Ok(())
}

/// Validates status: must be one of pending, in_progress, completed, cancelled
pub fn validate_status(status: &str) -> Result<(), String> {
    let valid_statuses = ["pending", "in_progress", "completed", "cancelled"];
    if !valid_statuses.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            valid_statuses.join(", ")
        ));
    }
    Ok(())
}

/// Validates plan status: must be one of active, completed, archived
pub fn validate_plan_status(status: &str) -> Result<(), String> {
    let valid_statuses = ["active", "completed", "archived"];
    if !valid_statuses.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            valid_statuses.join(", ")
        ));
    }
    Ok(())
}

/// Validates target status: must be one of active, completed, cancelled
pub fn validate_target_status(status: &str) -> Result<(), String> {
    let valid_statuses = ["active", "completed", "cancelled"];
    if !valid_statuses.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            valid_statuses.join(", ")
        ));
    }
    Ok(())
}

/// Validates milestone status: must be one of pending, completed, cancelled
pub fn validate_milestone_status(status: &str) -> Result<(), String> {
    let valid_statuses = ["pending", "completed", "cancelled"];
    if !valid_statuses.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            valid_statuses.join(", ")
        ));
    }
    Ok(())
}

/// Validates circulation status: must be one of active, paused, completed
pub fn validate_circulation_status(status: &str) -> Result<(), String> {
    let valid_statuses = ["active", "paused", "completed"];
    if !valid_statuses.contains(&status) {
        return Err(format!(
            "Invalid status '{}'. Must be one of: {}",
            status,
            valid_statuses.join(", ")
        ));
    }
    Ok(())
}

/// Validates circulation type: must be one of periodic, count
pub fn validate_circulation_type(circulation_type: &str) -> Result<(), String> {
    let valid_types = ["periodic", "count"];
    if !valid_types.contains(&circulation_type) {
        return Err(format!(
            "Invalid circulation_type '{}'. Must be one of: {}",
            circulation_type,
            valid_types.join(", ")
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
    let valid_frequencies = ["daily", "weekly", "monthly"];
    if !valid_frequencies.contains(&frequency) {
        return Err(format!(
            "Invalid frequency '{}'. Must be one of: {}",
            frequency,
            valid_frequencies.join(", ")
        ));
    }
    Ok(())
}
