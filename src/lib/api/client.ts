/**
 * API Client Utilities
 *
 * Common utilities for Tauri API client.
 */

/**
 * Check if running in Tauri environment
 */
export function isTauri(): boolean {
  if (typeof window === "undefined") return false;
  return "__TAURI__" in window;
}

