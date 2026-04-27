import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  applyCustomColors,
  loadCustomColors,
  saveCustomColors,
  useTheme,
} from "../useTheme";
import { logger } from "@/lib/utils/logger";

// Mock dependencies
vi.mock("@/lib/utils/logger", () => ({
  logger: {
    warn: vi.fn(),
  },
}));

// Mock matchMedia
const mockMatchMedia = vi.fn();

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: mockMatchMedia,
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
});

// Mock document.documentElement
const mockDocumentElement = {
  setAttribute: vi.fn(),
  getAttribute: vi.fn(),
  style: {
    setProperty: vi.fn(),
    removeProperty: vi.fn(),
  },
};

Object.defineProperty(document, "documentElement", {
  value: mockDocumentElement,
  writable: true,
});

describe("useTheme", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue(undefined);
    mockDocumentElement.setAttribute.mockClear();
    mockDocumentElement.getAttribute.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("初始状态", () => {
    it("应该返回默认主题 (light) 当没有存储的主题", () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("light");
      expect(result.current.isDark).toBe(false);
      expect(result.current.isSystem).toBe(false);
      expect(result.current.isInitialized).toBe(true);
    });

    it("应该从 localStorage 读取存储的主题", () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      mockLocalStorage.getItem.mockReturnValue("dark");

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("dark");
      expect(result.current.isDark).toBe(true);
    });

    it("应该从 DOM 读取 data-theme 属性 (优先级高于 localStorage)", () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      mockDocumentElement.getAttribute.mockReturnValue("nord");

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("nord");
    });

    it("应该使用系统主题当设置为 system", () => {
      mockLocalStorage.getItem.mockReturnValue("system");
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("system");
      expect(result.current.isSystem).toBe(true);
    });

    it("当系统偏好为深色时，system 主题应返回深色", () => {
      mockLocalStorage.getItem.mockReturnValue("system");
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(true);
    });

    it("当系统偏好为浅色时，system 主题应返回浅色", () => {
      mockLocalStorage.getItem.mockReturnValue("system");
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.isDark).toBe(false);
    });
  });

  describe("setTheme", () => {
    it("应该更新主题状态", () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme("dark");
      });

      expect(result.current.theme).toBe("dark");
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "plan-todos-theme",
        "dark",
      );
    });

    it("应该持久化主题到 localStorage", () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme("dracula");
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "plan-todos-theme",
        "dracula",
      );
    });

    it("应该应用到 DOM", () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme("dark");
      });

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "dark",
      );
    });

    it("无效主题应该回退到默认主题 (light)", () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      const { result } = renderHook(() => useTheme());

      // Test with invalid theme - use any to bypass type check for testing
      act(() => {
        (result.current.setTheme as (theme: string) => void)("invalid-theme");
      });

      // Should fall back to light
      expect(result.current.theme).toBe("light");
      expect(logger.warn).toHaveBeenCalledWith(
        "Invalid theme: invalid-theme, falling back to light",
      );
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "plan-todos-theme",
        "light",
      );
    });

    it("切换到 custom 主题时应该应用自定义颜色", () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "plan-todos-custom-theme-colors") {
          return JSON.stringify({
            primary: "#111111",
            secondary: "#222222",
            bg: "#333333",
            bgCard: "#444444",
            text: "#555555",
            textMuted: "#666666",
          });
        }
        return null;
      });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme("custom");
      });

      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "custom",
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--color-primary",
        "#111111",
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--color-text-muted",
        "#666666",
      );
    });

    it("离开 custom 主题时应该清理自定义颜色", () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "plan-todos-custom-theme-colors") {
          return JSON.stringify({
            primary: "#111111",
            secondary: "#222222",
            bg: "#333333",
            bgCard: "#444444",
            text: "#555555",
            textMuted: "#666666",
          });
        }
        return null;
      });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme("custom");
        result.current.setTheme("dark");
      });

      expect(mockDocumentElement.style.removeProperty).toHaveBeenCalledWith(
        "--color-primary",
      );
      expect(mockDocumentElement.style.removeProperty).toHaveBeenCalledWith(
        "--color-text-muted",
      );
    });
  });

  describe("toggleTheme", () => {
    it("浅色主题应该切换到深色", () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      mockLocalStorage.getItem.mockReturnValue("light");

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("dark");
    });

    it("深色主题应该切换到浅色", () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      mockLocalStorage.getItem.mockReturnValue("dark");

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      expect(result.current.theme).toBe("light");
    });

    it("system 主题应该根据系统偏好切换", () => {
      mockLocalStorage.getItem.mockReturnValue("system");
      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.toggleTheme();
      });

      // From dark, should toggle to light
      expect(result.current.theme).toBe("light");
    });
  });

  describe("副作用和清理", () => {
    it("主题变更时应该应用到 DOM", () => {
      mockMatchMedia.mockReturnValue({ matches: false });

      const { result } = renderHook(() => useTheme());

      // Initial theme should be applied
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "light",
      );

      act(() => {
        result.current.setTheme("dark");
      });

      // Should be called again with new theme
      expect(mockDocumentElement.setAttribute).toHaveBeenCalledWith(
        "data-theme",
        "dark",
      );
    });

    it("在 system 模式下应该监听系统主题变化", () => {
      const mockAddEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();

      mockMatchMedia.mockReturnValue({
        matches: true,
        addEventListener: mockAddEventListener,
        removeEventListener: mockRemoveEventListener,
      });
      mockLocalStorage.getItem.mockReturnValue("system");

      const { result, unmount } = renderHook(() => useTheme());

      expect(result.current.isSystem).toBe(true);

      // Should add listener
      expect(mockAddEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );

      unmount();

      // Should remove listener on cleanup
      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "change",
        expect.any(Function),
      );
    });

    it("非 system 模式下不应该监听系统主题变化", () => {
      const mockAddEventListener = vi.fn();

      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: mockAddEventListener,
        removeEventListener: vi.fn(),
      });
      mockLocalStorage.getItem.mockReturnValue("dark");

      renderHook(() => useTheme());

      expect(mockAddEventListener).not.toHaveBeenCalled();
    });
  });

  describe("主题验证", () => {
    it("应该接受所有有效主题", () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      });
      const validThemes = [
        "light",
        "dark",
        "dracula",
        "nord",
        "monokai",
        "glass",
        "spring",
        "catppuccin",
        "tokyoNight",
        "oneDark",
        "pastel",
        "mint",
        "lavender",
        "ocean",
        "rose",
        "ayuLight",
        "githubLight",
        "midnight",
        "purple",
        "forest",
        "coffee",
        "sunset",
        "nightOwl",
        "cobalt2",
        "ayuMirage",
        "blackMyth",
        "cyberpunk",
        "halloween",
        "christmas",
        "handwritten",
        "cottagecore",
        "vaporwave",
        "darkAcademia",
        "kawaii",
        "retro90s",
        "custom",
        "system",
      ];

      const { result } = renderHook(() => useTheme());

      for (const theme of validThemes) {
        act(() => {
          result.current.setTheme(theme as typeof result.current.theme);
        });
        expect(result.current.theme).toBe(theme);
      }
    });

    it("应该忽略无效的 DOM 主题并回退到 localStorage", () => {
      mockMatchMedia.mockReturnValue({ matches: false });
      mockDocumentElement.getAttribute.mockReturnValue("not-a-theme");
      mockLocalStorage.getItem.mockReturnValue("dark");

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("dark");
    });

    it("当 localStorage 中的主题无效时应该回退到系统偏好", () => {
      mockMatchMedia.mockReturnValue({ matches: true });
      mockDocumentElement.getAttribute.mockReturnValue(null);
      mockLocalStorage.getItem.mockReturnValue("not-a-theme");

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe("dark");
      expect(result.current.isDark).toBe(true);
    });
  });

  describe("自定义颜色工具函数", () => {
    it("loadCustomColors 在 JSON 无效时应返回默认值", () => {
      mockLocalStorage.getItem.mockReturnValue("not-json");

      expect(loadCustomColors()).toEqual({
        primary: "#14B8A6",
        secondary: "#2DD4BF",
        bg: "#0F172A",
        bgCard: "#1E293B",
        text: "#F1F5F9",
        textMuted: "#94A3B8",
      });
    });

    it("saveCustomColors 应该写入 localStorage", () => {
      const colors = {
        primary: "#101010",
        secondary: "#202020",
        bg: "#303030",
        bgCard: "#404040",
        text: "#505050",
        textMuted: "#606060",
      };

      saveCustomColors(colors);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "plan-todos-custom-theme-colors",
        JSON.stringify(colors),
      );
    });

    it("applyCustomColors 应该设置所有 CSS 变量", () => {
      applyCustomColors({
        primary: "#101010",
        secondary: "#202020",
        bg: "#303030",
        bgCard: "#404040",
        text: "#505050",
        textMuted: "#606060",
      });

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--color-primary",
        "#101010",
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--color-secondary",
        "#202020",
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--color-bg",
        "#303030",
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--color-bg-card",
        "#404040",
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--color-text",
        "#505050",
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--color-text-muted",
        "#606060",
      );
    });
  });
});
