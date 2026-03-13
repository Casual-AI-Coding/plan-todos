import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useSystemTheme } from "../useSystemTheme";

// Mock matchMedia
const mockMatchMedia = vi.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

describe("useSystemTheme", () => {
  const mockAddEventListener = vi.fn();
  const mockRemoveEventListener = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
    } as unknown as MediaQueryList);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("初始状态", () => {
    it("系统偏好浅色时应该返回 light", () => {
      const { result } = renderHook(() => useSystemTheme());

      expect(result.current).toBe("light");
    });

    it("系统偏好深色时应该返回 dark", () => {
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      } as unknown as MediaQueryList);

      const { result } = renderHook(() => useSystemTheme());

      expect(result.current).toBe("dark");
    });
  });

  describe("系统主题变更监听", () => {
    it("应该监听系统主题变化", () => {
      renderHook(() => useSystemTheme());

      expect(mockAddEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("组件卸载时应该移除监听器", () => {
      const { unmount } = renderHook(() => useSystemTheme());

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });
  });

  describe("类型安全", () => {
    it("应该只返回 'light' 或 'dark'", () => {
      const { result } = renderHook(() => useSystemTheme());

      expect(result.current).toMatch(/^(light|dark)$/);
    });
  });
});
