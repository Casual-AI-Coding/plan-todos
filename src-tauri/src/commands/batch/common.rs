use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct BatchUpdateResult {
    pub updated: i32,
    pub failed: Vec<BatchFailedItem>,
}

#[derive(Debug, Serialize)]
pub struct BatchFailedItem {
    pub id: String,
    pub error: String,
}
