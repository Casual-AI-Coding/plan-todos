/**
 * API Client Abstraction Layer
 *
 * Provides a unified interface for Tauri IPC calls, decoupling
 * business logic from Tauri implementation details.
 */

import type { InvokeArgs } from "@tauri-apps/api/core";

/**
 * Check if running in Tauri environment
 */
export function isTauri(): boolean {
  if (typeof window === "undefined") return false;
  return "__TAURI__" in window;
}

/**
 * Error class for API invocation failures
 */
export class ApiError extends Error {
  constructor(
    public command: string,
    public cause: unknown,
  ) {
    super(`API command "${command}" failed: ${cause}`);
    this.name = "ApiError";
  }
}

/**
 * Invoke a Tauri backend command
 *
 * @param command - The command name to invoke
 * @param args - Optional arguments to pass to the command
 * @returns Promise resolving to the command result
 * @throws ApiError if the command fails or not in Tauri environment
 */
export async function invoke<T>(
  command: string,
  args?: InvokeArgs,
): Promise<T> {
  if (!isTauri()) {
    throw new ApiError(command, new Error("Not running in Tauri environment"));
  }

  try {
    const { invoke: tauriInvoke } = await import("@tauri-apps/api/core");
    return await tauriInvoke<T>(command, args);
  } catch (error) {
    throw new ApiError(command, error);
  }
}

/**
 * Safely invoke a Tauri command, returning null on failure instead of throwing
 *
 * @param command - The command name to invoke
 * @param args - Optional arguments to pass to the command
 * @returns Promise resolving to the result or null on failure
 */
export async function tryInvoke<T>(
  command: string,
  args?: InvokeArgs,
): Promise<T | null> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[API] tryInvoke failed: ${command}`, error);
    }
    return null;
  }
}

/**
 * API Client type for dependency injection and testing
 */
export interface ApiClient {
  invoke<T>(command: string, args?: InvokeArgs): Promise<T>;
  isTauri(): boolean;
}

/**
 * Default API client implementation
 */
export const apiClient: ApiClient = {
  invoke,
  isTauri,
};

/**
 * Mock API client for testing
 */
export function createMockClient(
  mockResponses: Record<string, unknown>,
): ApiClient {
  return {
    invoke: async <T>(command: string, args?: InvokeArgs) => {
      const key = args ? `${command}:${JSON.stringify(args)}` : command;
      if (key in mockResponses) {
        return mockResponses[key] as T;
      }
      if (command in mockResponses) {
        return mockResponses[command] as T;
      }
      throw new ApiError(command, new Error(`No mock for command: ${command}`));
    },
    isTauri: () => false,
  };
}
