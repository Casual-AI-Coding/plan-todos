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

/**
 * Helper to wrap Tauri invoke calls with unified error handling
 */
export async function withTauriError<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (e) {
    console.error("[Tauri Error]", e);
    throw e;
  }
}
