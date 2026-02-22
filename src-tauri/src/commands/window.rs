use tauri::Window;

#[tauri::command]
pub fn minimize_window(window: Window) -> Result<(), String> {
    window
        .minimize()
        .map_err(|e| format!("Failed to minimize window: {}", e))
}

#[tauri::command]
pub fn toggle_maximize(window: Window) -> Result<(), String> {
    if window
        .is_maximized()
        .map_err(|e| format!("Failed to check maximized state: {}", e))?
    {
        window
            .unmaximize()
            .map_err(|e| format!("Failed to unmaximize window: {}", e))
    } else {
        window
            .maximize()
            .map_err(|e| format!("Failed to maximize window: {}", e))
    }
}

#[tauri::command]
pub fn close_window(window: Window) -> Result<(), String> {
    window
        .close()
        .map_err(|e| format!("Failed to close window: {}", e))
}

#[tauri::command]
pub fn is_maximized(window: Window) -> Result<bool, String> {
    window
        .is_maximized()
        .map_err(|e| format!("Failed to check maximized state: {}", e))
}
