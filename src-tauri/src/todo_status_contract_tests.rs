use crate::commands::todo_status::{validate_todo_status, TODO_STATUSES};

#[test]
fn todo_status_contract_matches_frontend_domain_statuses() {
    assert_eq!(TODO_STATUSES, ["pending", "in-progress", "done"]);
}

#[test]
fn todo_status_contract_rejects_archival_and_task_completion_aliases() {
    assert!(validate_todo_status("archived").is_err());
    assert!(validate_todo_status("completed").is_err());
    assert!(validate_todo_status("cancelled").is_err());
}

#[test]
fn todo_status_contract_accepts_canonical_todo_statuses() {
    for status in TODO_STATUSES {
        assert!(validate_todo_status(status).is_ok());
    }
}
