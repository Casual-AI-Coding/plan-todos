import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  minimizeWindow,
  toggleMaximize,
  closeWindow,
  isMaximized,
} from "@/lib/api/window";

// Use vi.hoisted to create mock function before imports
const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

// Mock @tauri-apps/api/core
  vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
  }));

    describe("Window API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("minimizeWindow", () => {
    it("should call invoke with minimize_window", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await minimizeWindow();

      expect(mockInvoke).toHaveBeenCalledWith("minimize_window");
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });

    it("should handle invoke error", async () => {
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(minimizeWindow()).rejects.toThrow("Tauri error");
    });
  });

  describe("toggleMaximize", () => {
    it("should call invoke with toggle_maximize", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await toggleMaximize();

      expect(mockInvoke).toHaveBeenCalledWith("toggle_maximize");
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });

    it("should handle invoke error", async () => {
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(toggleMaximize()).rejects.toThrow("Tauri error");
    });
  });

  describe("closeWindow", () => {
    it("should call invoke with close_window", async () => {
      mockInvoke.mockResolvedValue(undefined);

      await closeWindow();

      expect(mockInvoke).toHaveBeenCalledWith("close_window");
      expect(mockInvoke).toHaveBeenCalledTimes(1);
    });

    it("should handle invoke error", async () => {
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(closeWindow()).rejects.toThrow("Tauri error");
    });
  });

  describe("isMaximized", () => {
    it("should return true when window is maximized", async () => {
      mockInvoke.mockResolvedValue(true);

      const result = await isMaximized();

      expect(mockInvoke).toHaveBeenCalledWith("is_maximized");
      expect(result).toBe(true);
    });

    it("should return false when window is not maximized", async () => {
      mockInvoke.mockResolvedValue(false);

      const result = await isMaximized();

      expect(mockInvoke).toHaveBeenCalledWith("is_maximized");
      expect(result).toBe(false);
    });

    it("should handle invoke error", async () => {
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(isMaximized()).rejects.toThrow("Tauri error");
    });
  });
});
