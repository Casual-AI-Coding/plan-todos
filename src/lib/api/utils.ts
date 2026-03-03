/**
 * API Error Handling Utilities
 *
 * Unified error handling for Tauri API calls.
 */

import { isTauri } from "./client";

/**
 * Check if operation name is Chinese
 */
function isChineseOperation(operation: string): boolean {
  return /[\u4e00-\u9fa5]/.test(operation);
}

/**
 * Ensure running in Tauri environment, throws consistent error if not.
 * @param operation - Description of the operation being performed
 */
export function ensureTauri(operation: string): void {
  if (!isTauri()) {
    const message = isChineseOperation(operation)
      ? `此操作需要在 Tauri 环境中运行: ${operation}`
      : `This app must run in Tauri to ${operation}`;
    throw new Error(message);
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
    if (error === null) throw null;
    if (error === undefined) throw undefined;
    const prefix = isChineseOperation(operation)
      ? "操作失败"
      : "Operation failed";
    throw new Error(
      `${prefix}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Wrap Tauri API calls with fallback to default value when not in Tauri.
 * @param operation - Description of the operation for error messages
 * @param fn - Async function to execute
 * @param defaultValue - Default value to return when not in Tauri
 * @param fallbackMessage - Optional custom warning message
 * @returns Result of the async function or default value
 */
export async function withTauriFallback<T>(
  operation: string,
  fn: () => Promise<T>,
  defaultValue: T,
  fallbackMessage?: string,
): Promise<T> {
  if (!isTauri()) {
    const message =
      fallbackMessage ?? "Running outside Tauri - data not available";
    console.warn(message);
    return defaultValue;
  }
  try {
    return await fn();
  } catch (error) {
    if (error === null) throw null;
    if (error === undefined) throw undefined;
    const prefix = isChineseOperation(operation)
      ? "操作失败"
      : "Operation failed";
    throw new Error(
      `${prefix}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}
