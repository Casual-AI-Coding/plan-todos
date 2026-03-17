// Device management commands
// Phase 6: Multi-device sync support

use crate::models::{AppState, DeviceInfo};
use rusqlite::OptionalExtension;
use tauri::State;

/// Get current device info
#[tauri::command]
pub fn get_device_info(state: State<AppState>) -> Result<DeviceInfo, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    // Check if current device is registered
    let device = conn
        .query_row(
            "SELECT device_id, device_name, is_current_device, last_seen_at, created_at
             FROM device_info WHERE is_current_device = 1",
            [],
            |row| {
                Ok(DeviceInfo {
                    device_id: row.get(0)?,
                    device_name: row.get(1)?,
                    is_current_device: row.get::<_, i32>(2)? != 0,
                    last_seen_at: row.get(3)?,
                    created_at: row.get(4)?,
                })
            },
        )
        .optional()
        .map_err(|e| e.to_string())?;

    // Create device if not exists
    if let Some(device) = device {
        Ok(device)
    } else {
        // Generate new device ID and name
        let device_id = generate_device_id();
        let device_name = get_device_name();
        let now = chrono::Utc::now().to_rfc3339();

        conn.execute(
            "INSERT INTO device_info (device_id, device_name, is_current_device, last_seen_at, created_at)
             VALUES (?1, ?2, 1, ?3, ?3)",
            rusqlite::params![&device_id, &device_name, &now],
        ).map_err(|e| e.to_string())?;

        Ok(DeviceInfo {
            device_id,
            device_name,
            is_current_device: true,
            last_seen_at: now.clone(),
            created_at: now,
        })
    }
}

/// Update device name
#[tauri::command]
pub fn update_device_name(state: State<AppState>, device_name: String) -> Result<(), String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    conn.execute(
        "UPDATE device_info SET device_name = ?1 WHERE is_current_device = 1",
        rusqlite::params![device_name],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Get all synced devices
#[tauri::command]
pub fn get_synced_devices(state: State<AppState>) -> Result<Vec<DeviceInfo>, String> {
    let conn = state.db.lock().map_err(|e| e.to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT device_id, device_name, is_current_device, last_seen_at, created_at
             FROM device_info
             ORDER BY last_seen_at DESC",
        )
        .map_err(|e| e.to_string())?;

    let devices = stmt
        .query_map([], |row| {
            Ok(DeviceInfo {
                device_id: row.get(0)?,
                device_name: row.get(1)?,
                is_current_device: row.get::<_, i32>(2)? != 0,
                last_seen_at: row.get(3)?,
                created_at: row.get(4)?,
            })
        })
        .map_err(|e| e.to_string())?
        .filter_map(|r| r.ok())
        .collect();

    Ok(devices)
}

// Helper functions

fn generate_device_id() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    format!("device-{}", timestamp)
}

fn get_device_name() -> String {
    #[cfg(target_os = "windows")]
    {
        hostname::get()
            .ok()
            .and_then(|n| n.into_string().ok())
            .unwrap_or_else(|| "Windows PC".to_string())
    }
    #[cfg(target_os = "macos")]
    {
        hostname::get()
            .ok()
            .and_then(|n| n.into_string().ok())
            .unwrap_or_else(|| "Mac".to_string())
    }
    #[cfg(target_os = "linux")]
    {
        hostname::get()
            .ok()
            .and_then(|n| n.into_string().ok())
            .unwrap_or_else(|| "Linux PC".to_string())
    }
    #[cfg(target_os = "android")]
    {
        "Android Device".to_string()
    }
    #[cfg(target_os = "ios")]
    {
        "iOS Device".to_string()
    }
}
