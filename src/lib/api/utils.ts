/**
 * API Error Handling Utilities
 *
 * Unified error handling for Tauri API calls.
 */

import { isTauri as checkTauri, invoke as tauriInvoke } from "./client";

// Re-export isTauri for convenience
export const isTauri = checkTauri;

/**
 * Re-export invoke for convenience
 */
export const invoke = tauriInvoke;

export class TauriUnavailableError extends Error {
  readonly operation: string;

  constructor(operation: string) {
    super(createUnavailableMessage(operation));
    this.name = "TauriUnavailableError";
    this.operation = operation;
  }
}

export class TauriOperationError extends Error {
  readonly operation: string;

  override readonly cause: unknown;

  constructor(operation: string, cause: unknown) {
    super(createOperationFailureMessage(operation, cause), { cause });
    this.name = "TauriOperationError";
    this.operation = operation;
    this.cause = cause;
  }
}

/**
 * Check if operation name is Chinese
 */
function isChineseOperation(operation: string): boolean {
  return /[\u4e00-\u9fa5]/.test(operation);
}

function createUnavailableMessage(operation: string): string {
  return isChineseOperation(operation)
    ? `此操作需要在 Tauri 环境中运行: ${operation}`
    : `This app must run in Tauri to ${operation}`;
}

function createOperationFailureMessage(
  operation: string,
  cause: unknown,
): string {
  if (cause === null) {
    return "Null error";
  }
  if (cause === undefined) {
    return "Undefined error";
  }

  const prefix = isChineseOperation(operation) ? "操作失败" : "Operation failed";
  return `${prefix}: ${cause instanceof Error ? cause.message : String(cause)}`;
}

/**
 * Ensure running in Tauri environment, throws consistent error if not.
 * @param operation - Description of the operation being performed
 */
export function ensureTauri(operation: string): void {
  if (!isTauri()) {
    throw new TauriUnavailableError(operation);
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
  } catch (error: unknown) {
    throw new TauriOperationError(operation, error);
  }
}
