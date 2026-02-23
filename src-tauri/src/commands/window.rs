use tauri::Window;

// Desktop-only window commands - not available on Android
#[cfg(not(target_os = "android"))]
#[tauri::command]
pub fn minimize_window(window: Window) -> Result<(), String> {
    window
        .minimize()
        .map_err(|e| format!("Failed to minimize window: {}", e))
}

#[cfg(not(target_os = "android"))]
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

#[cfg(not(target_os = "android"))]
#[tauri::command]
pub fn close_window(window: Window) -> Result<(), String> {
    window
        .close()
        .map_err(|e| format!("Failed to close window: {}", e))
}

#[cfg(not(target_os = "android"))]
#[tauri::command]
pub fn is_maximized(window: Window) -> Result<bool, String> {
    window
        .is_maximized()
        .map_err(|e| format!("Failed to check maximized state: {}", e))
}

// Android stub implementations - return error on Android
#[cfg(target_os = "android")]
#[tauri::command]
pub fn minimize_window(_window: Window) -> Result<(), String> {
    Err("Window minimize is not supported on Android".to_string())
}

#[cfg(target_os = "android")]
#[tauri::command]
pub fn toggle_maximize(_window: Window) -> Result<(), String> {
    Err("Window maximize is not supported on Android".to_string())
}

#[cfg(target_os = "android")]
#[tauri::command]
pub fn close_window(_window: Window) -> Result<(), String> {
    Err("Window close is not supported on Android".to_string())
}

#[cfg(target_os = "android")]
#[tauri::command]
pub fn is_maximized(_window: Window) -> Result<bool, String> {
    Err("Window state is not supported on Android".to_string())
}
