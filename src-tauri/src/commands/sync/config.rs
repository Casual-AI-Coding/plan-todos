// Sync configuration commands
// Phase 6: WebDAV configuration management

use crate::models::{AppState, SyncConfig};
use crate::sync::client::WebDAVClient;
use crate::sync::credentials::CredentialManager;
use rusqlite::OptionalExtension;
use tauri::State;

/// Get current sync configuration
#[tauri::command]
pub fn get_sync_config(state: State<AppState>) -> Result<SyncConfig, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    conn.query_row(
        "SELECT id, enabled, provider_type, server_url, username, password_encrypted,
                remote_path, sync_interval_minutes, conflict_strategy, last_sync_at,
                last_sync_status, last_sync_error, created_at, updated_at
         FROM sync_config WHERE id = 'default'",
        [],
        |row| {
            Ok(SyncConfig {
                id: row.get(0)?,
                enabled: row.get::<_, i32>(1)? != 0,
                provider_type: row.get(2)?,
                server_url: row.get(3)?,
                username: row.get(4)?,
                password_encrypted: row.get(5)?,
                remote_path: row.get(6)?,
                sync_interval_minutes: row.get(7)?,
                conflict_strategy: row.get(8)?,
                last_sync_at: row.get(9)?,
                last_sync_status: row.get(10)?,
                last_sync_error: row.get(11)?,
                created_at: row.get(12)?,
                updated_at: row.get(13)?,
            })
        },
    ).map_err(|e| e.to_string())
}

/// Update sync configuration
#[tauri::command]
pub fn update_sync_config(
    state: State<AppState>,
    enabled: Option<bool>,
    server_url: Option<String>,
    username: Option<String>,
    remote_path: Option<String>,
    sync_interval_minutes: Option<i32>,
    conflict_strategy: Option<String>,
) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    let enabled_val = enabled.map(|v| if v { 1 } else { 0 });
    
    conn.execute(
        "UPDATE sync_config SET
            enabled = COALESCE(?1, enabled),
            server_url = COALESCE(?2, server_url),
            username = COALESCE(?3, username),
            remote_path = COALESCE(?4, remote_path),
            sync_interval_minutes = COALESCE(?5, sync_interval_minutes),
            conflict_strategy = COALESCE(?6, conflict_strategy),
            updated_at = datetime('now')
         WHERE id = 'default'",
        rusqlite::params![
            enabled_val,
            server_url,
            username,
            remote_path,
            sync_interval_minutes,
            conflict_strategy,
        ],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

/// Test WebDAV connection
#[tauri::command]
pub async fn test_sync_connection(
    state: State<'_, AppState>,
    server_url: String,
    username: String,
    password: String,
) -> Result<bool, String> {
    // Get the remote path from config
    let remote_path = {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT remote_path FROM sync_config WHERE id = 'default'",
            [],
            |row| row.get::<_, Option<String>>(0),
        ).optional().map_err(|e: rusqlite::Error| e.to_string())?
        .flatten()
        .unwrap_or_else(|| "/plan-todos-sync".to_string())
    };
    
    // Create WebDAV client
    let client = WebDAVClient::new(server_url, username, password, remote_path)?;
    
    // Test connection
    client.test_connection().await
}

/// Save sync credentials securely to platform keychain
/// 
/// This stores the password in the OS keychain and updates the username
/// in the database. The password is NEVER stored in the database.
#[tauri::command]
pub async fn save_sync_credentials(
    state: State<'_, AppState>,
    username: String,
    password: String,
) -> Result<(), String> {
    // Save password to platform keychain
    let credential_manager = CredentialManager::new();
    credential_manager.save_credentials(&username, &password)?;
    
    // Update username in database (password is only in keychain)
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE sync_config SET username = ?1, updated_at = datetime('now') WHERE id = 'default'",
        rusqlite::params![username],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

/// Get stored sync username (password is never returned for security)
#[tauri::command]
pub fn get_sync_username(state: State<AppState>) -> Result<Option<String>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    let username = conn.query_row(
        "SELECT username FROM sync_config WHERE id = 'default'",
        [],
        |row| row.get::<_, Option<String>>(0),
    ).optional().map_err(|e: rusqlite::Error| e.to_string())?;
    
    // Flatten the Option<Option<String>> to Option<String>
    Ok(username.flatten())
}

/// Delete stored sync credentials from keychain and database
#[tauri::command]
pub async fn delete_sync_credentials(
    state: State<'_, AppState>,
) -> Result<(), String> {
    // Get current username to delete from keychain
    let username = {
        let conn = state.db.lock().map_err(|e| e.to_string())?;
        conn.query_row(
            "SELECT username FROM sync_config WHERE id = 'default'",
            [],
            |row| row.get::<_, Option<String>>(0),
        ).optional().map_err(|e: rusqlite::Error| e.to_string())?
    };
    
    // Delete from keychain if username exists
    if let Some(user) = username.flatten() {
        let credential_manager = CredentialManager::new();
        // Ignore error if credentials don't exist
        let _ = credential_manager.delete_credentials(&user);
    }
    
    // Clear username in database
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "UPDATE sync_config SET username = NULL, updated_at = datetime('now') WHERE id = 'default'",
        [],
    ).map_err(|e| e.to_string())?;
    
    Ok(())
}

/// Check if sync credentials are stored
#[tauri::command]
pub fn has_sync_credentials(state: State<AppState>) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    let username = conn.query_row(
        "SELECT username FROM sync_config WHERE id = 'default'",
        [],
        |row| row.get::<_, Option<String>>(0),
    ).optional().map_err(|e: rusqlite::Error| e.to_string())?;
    
    match username.flatten() {
        Some(user) if !user.is_empty() => {
            let credential_manager = CredentialManager::new();
            Ok(credential_manager.has_credentials(&user))
        }
        _ => Ok(false),
    }
}

/// Get credentials for internal use (WebDAV client)
/// This is NOT a Tauri command - it's for internal use only
pub fn get_sync_credentials_internal(state: &AppState) -> Result<(String, String), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;
    
    let username: String = conn.query_row(
        "SELECT username FROM sync_config WHERE id = 'default'",
        [],
        |row| row.get(0),
    ).map_err(|e| format!("No username configured: {}", e))?;
    
    drop(conn); // Release lock before keychain access
    
    let credential_manager = CredentialManager::new();
    let password = credential_manager.get_credentials(&username)?;
    
    Ok((username, password))
}