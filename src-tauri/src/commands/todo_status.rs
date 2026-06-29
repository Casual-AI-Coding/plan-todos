pub const TODO_STATUSES: [&str; 3] = ["pending", "in-progress", "done"];

pub fn validate_todo_status(status: &str) -> Result<(), String> {
    if TODO_STATUSES.contains(&status) {
        Ok(())
    } else {
        Err(format!(
            "Invalid todo status: '{}'. Valid values: {:?}",
            status, TODO_STATUSES
        ))
    }
}
