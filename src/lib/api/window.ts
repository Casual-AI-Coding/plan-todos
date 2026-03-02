/**
 * Window Control APIs
 *
 * API functions for window controls.
 */

export async function minimizeWindow(): Promise<void> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("minimize_window");
}

export async function toggleMaximize(): Promise<void> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("toggle_maximize");
}

export async function closeWindow(): Promise<void> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("close_window");
}

export async function isMaximized(): Promise<boolean> {
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<boolean>("is_maximized");
}
