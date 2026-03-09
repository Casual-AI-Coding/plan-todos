import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isTauri,
  ApiError,
  invoke,
  tryInvoke,
  createMockClient,
  apiClient,
} from "./client";

// ============================================================================
// isTauri Tests
// ============================================================================
describe("isTauri", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("returns false when window is undefined", () => {
    Object.defineProperty(global, "window", {
      value: undefined,
      writable: true,
    });
    expect(isTauri()).toBe(false);
  });

  it("returns false when window does not have __TAURI__", () => {
    expect(isTauri()).toBe(false);
  });

  it("returns true when window has __TAURI__", () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    expect(isTauri()).toBe(true);
  });
});

// ============================================================================
// ApiError Tests
// ============================================================================
describe("ApiError", () => {
  it("creates error with correct command and cause", () => {
    const cause = new Error("Original error");
    const error = new ApiError("test_command", cause);

    expect(error.command).toBe("test_command");
    expect(error.cause).toBe(cause);
    expect(error.name).toBe("ApiError");
  });

  it("creates error with string cause", () => {
    const error = new ApiError("test_command", "String error");

    expect(error.command).toBe("test_command");
    expect(error.cause).toBe("String error");
    expect(error.message).toBe(
      'API command "test_command" failed: String error',
    );
  });

  it("creates error with object cause", () => {
    const cause = { code: "ERR_INTERNAL", details: "Something went wrong" };
    const error = new ApiError("test_command", cause);

    expect(error.command).toBe("test_command");
    expect(error.cause).toBe(cause);
    expect(error.message).toBe(
      'API command "test_command" failed: [object Object]',
    );
  });

  it("error message includes command name", () => {
    const error = new ApiError("get_todos", new Error("DB error"));
    expect(error.message).toContain("get_todos");
    expect(error.message).toContain("DB error");
  });

  it("can be caught as Error instance", () => {
    const error = new ApiError("test", new Error("test error"));
    expect(error instanceof Error).toBe(true);
  });
});

// ============================================================================
// invoke Tests - Non-Tauri Environment
// ============================================================================
describe("invoke", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("throws ApiError when not in Tauri environment", async () => {
    await expect(invoke<string>("test_command")).rejects.toThrow(ApiError);
    await expect(invoke<string>("test_command")).rejects.toThrow(
      'API command "test_command" failed: Error: Not running in Tauri environment',
    );
  });

  it("throws ApiError when window is undefined", async () => {
    Object.defineProperty(global, "window", {
      value: undefined,
      writable: true,
    });
    await expect(invoke<string>("test_command")).rejects.toThrow(ApiError);
  });
});

// ============================================================================
// tryInvoke Tests
// ============================================================================
describe("tryInvoke", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });
    vi.spyOn(console, "debug").mockImplementation(() => {});
  });

  afterEach(() => {
    global.window = originalWindow;
    vi.restoreAllMocks();
  });

  it("returns null when invoke throws ApiError", async () => {
    Object.defineProperty(global, "window", {
      value: undefined,
      writable: true,
    });

    const result = await tryInvoke<string>("test_command");
    expect(result).toBe(null);
  });

  it("logs debug message in development mode", async () => {
    const consoleSpy = vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "development");

    Object.defineProperty(global, "window", {
      value: undefined,
      writable: true,
    });

    await tryInvoke<string>("test_command");
    expect(consoleSpy).toHaveBeenCalledWith(
      "[API] tryInvoke failed: test_command",
      expect.any(Error),
    );

    consoleSpy.mockRestore();
    vi.unstubAllEnvs();
  });
});

// ============================================================================
// createMockClient Tests
// ============================================================================
describe("createMockClient", () => {
  it("creates mock client with basic responses", () => {
    const mockClient = createMockClient({
      get_data: { id: 1, name: "test" },
    });

    expect(mockClient.isTauri()).toBe(false);
  });

  it("returns mocked value for command", async () => {
    const mockClient = createMockClient({
      get_data: { id: 1, name: "test" },
    });

    const result = await mockClient.invoke<{ id: number; name: string }>(
      "get_data",
    );
    expect(result).toEqual({ id: 1, name: "test" });
  });

  it("returns mocked value with args as key", async () => {
    const mockClient = createMockClient({
      'get_item:{"id":1}': { id: 1, name: "item1" },
      'get_item:{"id":2}': { id: 2, name: "item2" },
    });

    const result1 = await mockClient.invoke<{ id: number; name: string }>(
      "get_item",
      { id: 1 },
    );
    const result2 = await mockClient.invoke<{ id: number; name: string }>(
      "get_item",
      { id: 2 },
    );

    expect(result1).toEqual({ id: 1, name: "item1" });
    expect(result2).toEqual({ id: 2, name: "item2" });
  });

  it("falls back to command-only key when args-specific key not found", async () => {
    const mockClient = createMockClient({
      get_data: { default: true },
      'get_data:{"filter":"active"}': { filtered: true },
    });

    const result = await mockClient.invoke<{ default: boolean }>("get_data");
    expect(result).toEqual({ default: true });
  });

  it("throws ApiError when no mock for command", async () => {
    const mockClient = createMockClient({
      other_command: "value",
    });

    await expect(mockClient.invoke("unknown_command")).rejects.toThrow(
      ApiError,
    );
    await expect(mockClient.invoke("unknown_command")).rejects.toThrow(
      "No mock for command: unknown_command",
    );
  });

  it("handles different return types", async () => {
    const mockClient = createMockClient({
      get_string: "hello",
      get_number: 42,
      get_boolean: true,
      get_array: [1, 2, 3],
      get_null: null,
    });

    expect(await mockClient.invoke<string>("get_string")).toBe("hello");
    expect(await mockClient.invoke<number>("get_number")).toBe(42);
    expect(await mockClient.invoke<boolean>("get_boolean")).toBe(true);
    expect(await mockClient.invoke<number[]>("get_array")).toEqual([1, 2, 3]);
    expect(await mockClient.invoke<null>("get_null")).toBe(null);
  });
});

// ============================================================================
// apiClient Exports Tests
// ============================================================================
describe("apiClient", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  it("apiClient has invoke function", () => {
    expect(typeof apiClient.invoke).toBe("function");
  });

  it("apiClient has isTauri function", () => {
    expect(typeof apiClient.isTauri).toBe("function");
  });

  it("apiClient.isTauri reflects environment", () => {
    expect(apiClient.isTauri()).toBe(false);
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    expect(apiClient.isTauri()).toBe(true);
  });
});
