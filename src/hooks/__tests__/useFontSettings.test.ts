import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";

import { FONT_SIZE, STORAGE_KEYS } from "@/config/constants";

import { useFontSettings } from "../useFontSettings";

describe("useFontSettings", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.style.removeProperty("--font-size-base");
  });

  it("uses the default font size when nothing is stored", () => {
    const { result } = renderHook(() => useFontSettings());

    expect(result.current.fontSize).toBe(16);
    expect(result.current.defaultSize).toBe(16);
    expect(
      document.documentElement.style.getPropertyValue("--font-size-base"),
    ).toBe("16px");
  });

  it("prefers the DOM font size over localStorage", () => {
    document.documentElement.style.setProperty("--font-size-base", "18px");
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, "20");

    const { result } = renderHook(() => useFontSettings());

    expect(result.current.fontSize).toBe(18);
  });

  it("reads a valid font size from localStorage when the DOM is empty", () => {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, "20");

    const { result } = renderHook(() => useFontSettings());

    expect(result.current.fontSize).toBe(20);
    expect(
      document.documentElement.style.getPropertyValue("--font-size-base"),
    ).toBe("20px");
  });

  it("falls back to localStorage when the DOM font size is non-numeric", () => {
    document.documentElement.style.setProperty("--font-size-base", "abc");
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, "19");

    const { result } = renderHook(() => useFontSettings());

    expect(result.current.fontSize).toBe(19);
  });

  it("ignores invalid stored font sizes and falls back to the default", () => {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, "200");

    const { result } = renderHook(() => useFontSettings());

    expect(result.current.fontSize).toBe(16);
  });

  it("ignores out-of-range localStorage values even when they parse correctly", () => {
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(FONT_SIZE.MIN - 1));

    const { result } = renderHook(() => useFontSettings());

    expect(result.current.fontSize).toBe(16);
  });

  it("clamps setFontSize to the allowed range and persists it", () => {
    const { result } = renderHook(() => useFontSettings());

    act(() => {
      result.current.setFontSize(FONT_SIZE.MAX + 10);
    });

    expect(result.current.fontSize).toBe(FONT_SIZE.MAX);
    expect(localStorage.getItem(STORAGE_KEYS.FONT_SIZE)).toBe(
      String(FONT_SIZE.MAX),
    );
    expect(
      document.documentElement.style.getPropertyValue("--font-size-base"),
    ).toBe(`${FONT_SIZE.MAX}px`);
  });

  it("increases and decreases the font size by one step", () => {
    const { result } = renderHook(() => useFontSettings());

    act(() => {
      result.current.increaseFontSize();
    });
    expect(result.current.fontSize).toBe(17);

    act(() => {
      result.current.decreaseFontSize();
    });
    expect(result.current.fontSize).toBe(16);
  });

  it("resets the font size back to the default", () => {
    const { result } = renderHook(() => useFontSettings());

    act(() => {
      result.current.setFontSize(21);
    });
    expect(result.current.fontSize).toBe(21);

    act(() => {
      result.current.resetFontSize();
    });

    expect(result.current.fontSize).toBe(16);
    expect(localStorage.getItem(STORAGE_KEYS.FONT_SIZE)).toBe("16");
  });

  it("exposes the configured min and max sizes", () => {
    const { result } = renderHook(() => useFontSettings());

    expect(result.current.minSize).toBe(FONT_SIZE.MIN);
    expect(result.current.maxSize).toBe(FONT_SIZE.MAX);
  });
});
