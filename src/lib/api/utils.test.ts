import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  ensureTauri,
  withTauriError,
  withTauriFallback,
  isTauri,
} from "./utils";

// ============================================================================
// ensureTauri Tests
// ============================================================================
describe("ensureTauri", () => {
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

  it("throws error when not in Tauri environment", () => {
    expect(() => ensureTauri("test operation")).toThrow(
      "This app must run in Tauri to test operation",
    );
  });

  it("throws error with Chinese message when operation is in Chinese", () => {
    expect(() => ensureTauri("测试操作")).toThrow(
      "此操作需要在 Tauri 环境中运行: 测试操作",
    );
  });

  it("does not throw when in Tauri environment", () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    expect(() => ensureTauri("test operation")).not.toThrow();
  });
});

// ============================================================================
// withTauriError Tests
// ============================================================================
describe("withTauriError", () => {
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

  it("throws error when not in Tauri environment", async () => {
    await expect(
      withTauriError("test operation", async () => "result"),
    ).rejects.toThrow("This app must run in Tauri to test operation");
  });

  it("returns result when Tauri environment and success", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    const result = await withTauriError(
      "test operation",
      async () => "success",
    );
    expect(result).toBe("success");
  });

  it("wraps Error from function with message", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    await expect(
      withTauriError("test operation", async () => {
        throw new Error("Original error");
      }),
    ).rejects.toThrow("Operation failed: Original error");
  });

  it("wraps string error from function with message", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    await expect(
      withTauriError("test operation", async () => {
        throw "String error";
      }),
    ).rejects.toThrow("Operation failed: String error");
  });

  it("wraps null error with message", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    await expect(
      withTauriError("test operation", async () => {
        throw null;
      }),
    ).rejects.toThrow("Null error");
  });

  it("wraps undefined error with message", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    await expect(
      withTauriError("test operation", async () => {
        throw undefined;
      }),
    ).rejects.toThrow("Undefined error");
  });

  it("uses Chinese message prefix when operation is in Chinese", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    await expect(
      withTauriError("测试操作", async () => {
        throw new Error("错误");
      }),
    ).rejects.toThrow("操作失败: 错误");
  });
});

// ============================================================================
// withTauriFallback Tests
// ============================================================================
describe("withTauriFallback", () => {
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

  it("returns default value when not in Tauri environment", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await withTauriFallback(
      "test operation",
      async () => "success",
      "default",
    );
    expect(result).toBe("default");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Running outside Tauri - data not available",
    );
    consoleSpy.mockRestore();
  });

  it("uses custom fallback message when provided", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const result = await withTauriFallback(
      "test operation",
      async () => "success",
      "default",
      "Custom fallback message",
    );
    expect(result).toBe("default");
    expect(consoleSpy).toHaveBeenCalledWith("Custom fallback message");
    consoleSpy.mockRestore();
  });

  it("returns result when in Tauri environment and success", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    const result = await withTauriFallback(
      "test operation",
      async () => "success",
      "default",
    );
    expect(result).toBe("success");
  });

  it("throws error when in Tauri environment and function fails", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    await expect(
      withTauriFallback(
        "test operation",
        async () => {
          throw new Error("Original error");
        },
        "default",
      ),
    ).rejects.toThrow("Operation failed: Original error");
  });

  it("does not warn when in Tauri environment", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await withTauriFallback("test operation", async () => "success", "default");
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it("handles null error in Tauri environment", async () => {
    (global.window as Window & { __TAURI__?: object }).__TAURI__ = {};
    await expect(
      withTauriFallback(
        "test operation",
        async () => {
          throw null;
        },
        "default",
      ),
    ).rejects.toThrow("Null error");
  });

  it("handles Chinese operation name in fallback", async () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await withTauriFallback("测试操作", async () => "success", "默认值");
    expect(consoleSpy).toHaveBeenCalledWith(
      "Running outside Tauri - data not available",
    );
    consoleSpy.mockRestore();
  });
});

// ============================================================================
// isTauri Re-export Tests
// ============================================================================
describe("isTauri (re-export)", () => {
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
