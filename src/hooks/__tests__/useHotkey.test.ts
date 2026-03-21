import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useHotkey, useHotkeys } from "../useHotkey";
import { useHotkeyStore, DEFAULT_HOTKEYS } from "@/lib/useHotkeyStore";

// Mock zustand store
vi.mock("@/lib/useHotkeyStore", () => ({
  useHotkeyStore: vi.fn(),
  DEFAULT_HOTKEYS: {
    "new-todo": { key: "n", ctrl: true, description: "新建 Todo" },
    search: { key: "k", ctrl: true, description: "打开搜索" },
  },
}));

describe("useHotkey", () => {
  const mockRegister = vi.fn();
  const mockUnregister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useHotkeyStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => {
        const state = { register: mockRegister, unregister: mockUnregister };
        return selector(state);
      },
    );
  });

  it("should register hotkey on mount", () => {
    const callback = vi.fn();
    renderHook(() => useHotkey("new-todo", callback));

    expect(mockRegister).toHaveBeenCalledWith(
      "new-todo",
      expect.objectContaining({ key: "n", ctrl: true }),
      expect.any(Function),
    );
  });

  it("should unregister hotkey on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useHotkey("new-todo", callback));

    unmount();

    expect(mockUnregister).toHaveBeenCalledWith("new-todo");
  });

  it("should warn for unknown action", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const callback = vi.fn();

    renderHook(() =>
      useHotkey("unknown-action" as keyof typeof DEFAULT_HOTKEYS, callback),
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      "Unknown hotkey action: unknown-action",
    );
    consoleSpy.mockRestore();
  });
});

describe("useHotkeys", () => {
  const mockRegister = vi.fn();
  const mockUnregister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useHotkeyStore as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      (selector) => {
        const state = { register: mockRegister, unregister: mockUnregister };
        return selector(state);
      },
    );
  });

  it("should register multiple hotkeys", () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    renderHook(() =>
      useHotkeys([
        { action: "new-todo", callback: callback1 },
        { action: "search", callback: callback2 },
      ]),
    );

    expect(mockRegister).toHaveBeenCalledTimes(2);
  });

  it("should unregister all hotkeys on unmount", () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() =>
      useHotkeys([
        { action: "new-todo", callback },
        { action: "search", callback },
      ]),
    );

    unmount();

    expect(mockUnregister).toHaveBeenCalledTimes(2);
  });
});
