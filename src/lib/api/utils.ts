/**
 * API Error Handling Utilities
 *
 * Unified error handling for Tauri API calls.
 */

import { isTauri } from "./client";

/**
 * Ensure running in Tauri environment, throws consistent error if not.
 * @param operation - Description of the operation being performed
 */
export function ensureTauri(operation: string): void {
  if (!isTauri()) {
    throw new Error(`此操作需要在 Tauri 环境中运行: ${operation}`);
  }
}

/**
 * Wrap Tauri API calls with unified error handling.
 * @param operation - Description of the operation for error messages
 * @param fn - Async function to execute
 * @returns Result of the async function
 */
export async function withTauriError<T>(
  operation: string,
  fn: () => Promise<T>,
): Promise<T> {
  ensureTauri(operation);
  try {
    return await fn();
  } catch (error) {
    throw new Error(
      `${operation} 失败: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
