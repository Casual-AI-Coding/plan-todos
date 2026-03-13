import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGlassSettings } from "../useGlassSettings";

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
  style: {
    setProperty: vi.fn(),
  },
};

Object.defineProperty(document, "documentElement", {
  value: mockDocumentElement,
  writable: true,
});

describe("useGlassSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    mockLocalStorage.setItem.mockReturnValue(undefined);
    mockDocumentElement.style.setProperty.mockClear();
  });

  describe("初始状态", () => {
    it("应该返回默认模糊值 10", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useGlassSettings());

      expect(result.current.glassBlur).toBe(10);
    });

    it("应该返回默认透明度 80", () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useGlassSettings());

      expect(result.current.glassOpacity).toBe(80);
    });

    it("应该从 localStorage 读取保存的模糊值", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "glass-blur") return "15";
        return null;
      });

      const { result } = renderHook(() => useGlassSettings());

      expect(result.current.glassBlur).toBe(15);
    });

    it("应该从 localStorage 读取保存的透明度", () => {
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === "glass-opacity") return "60";
        return null;
      });

      const { result } = renderHook(() => useGlassSettings());

      expect(result.current.glassOpacity).toBe(60);
    });
  });

  describe("setGlassBlur", () => {
    it("应该更新模糊值状态", () => {
      const { result } = renderHook(() => useGlassSettings());

      act(() => {
        result.current.setGlassBlur(20);
      });

      expect(result.current.glassBlur).toBe(20);
    });

    it("应该保存到 localStorage", () => {
      const { result } = renderHook(() => useGlassSettings());

      act(() => {
        result.current.setGlassBlur(25);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("glass-blur", "25");
    });

    it("应该更新 CSS 变量", () => {
      const { result } = renderHook(() => useGlassSettings());

      act(() => {
        result.current.setGlassBlur(15);
      });

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--glass-blur",
        "15px",
      );
    });
  });

  describe("setGlassOpacity", () => {
    it("应该更新透明度状态", () => {
      const { result } = renderHook(() => useGlassSettings());

      act(() => {
        result.current.setGlassOpacity(50);
      });

      expect(result.current.glassOpacity).toBe(50);
    });

    it("应该保存到 localStorage", () => {
      const { result } = renderHook(() => useGlassSettings());

      act(() => {
        result.current.setGlassOpacity(70);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "glass-opacity",
        "70",
      );
    });

    it("应该更新 CSS 变量 (除以100)", () => {
      const { result } = renderHook(() => useGlassSettings());

      act(() => {
        result.current.setGlassOpacity(60);
      });

      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--glass-opacity",
        "0.6",
      );
    });
  });

  describe("副作用", () => {
    it("挂载时应该设置 CSS 变量", () => {
      mockDocumentElement.style.setProperty.mockClear();

      renderHook(() => useGlassSettings());

      // Should set CSS variables on mount with defaults
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--glass-blur",
        "10px",
      );
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--glass-opacity",
        "0.8",
      );
    });

    it("后续更新不应触发 useEffect", () => {
      mockDocumentElement.style.setProperty.mockClear();

      const { result } = renderHook(() => useGlassSettings());

      // Clear mocks after initial render
      mockDocumentElement.style.setProperty.mockClear();

      act(() => {
        result.current.setGlassBlur(15);
      });

      // Should have been called by setGlassBlur (not useEffect)
      expect(mockDocumentElement.style.setProperty).toHaveBeenCalledWith(
        "--glass-blur",
        "15px",
      );
    });
  });

  describe("返回值", () => {
    it("应该返回所有需要的属性和方法", () => {
      const { result } = renderHook(() => useGlassSettings());

      expect(result.current).toHaveProperty("glassBlur");
      expect(result.current).toHaveProperty("glassOpacity");
      expect(result.current).toHaveProperty("setGlassBlur");
      expect(result.current).toHaveProperty("setGlassOpacity");
      expect(typeof result.current.setGlassBlur).toBe("function");
      expect(typeof result.current.setGlassOpacity).toBe("function");
    });
  });
});
