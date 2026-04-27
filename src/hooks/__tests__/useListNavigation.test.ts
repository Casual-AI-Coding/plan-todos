import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act, fireEvent } from "@testing-library/react";
import { getListItemProps, useListNavigation } from "../useListNavigation";

describe("useListNavigation", () => {
  const items = ["alpha", "beta", "gamma"];

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("focuses next and previous items with arrow keys and vim keys", () => {
    const { result } = renderHook(() => useListNavigation({ items }));

    act(() => {
      fireEvent.keyDown(document, { key: "ArrowDown" });
    });
    expect(result.current.focusedIndex).toBe(0);
    expect(result.current.focusedItem).toBe("alpha");

    act(() => {
      fireEvent.keyDown(document, { key: "j" });
    });
    expect(result.current.focusedIndex).toBe(1);
    expect(result.current.focusedItem).toBe("beta");

    act(() => {
      fireEvent.keyDown(document, { key: "ArrowUp" });
    });
    expect(result.current.focusedIndex).toBe(0);

    act(() => {
      fireEvent.keyDown(document, { key: "k" });
    });
    expect(result.current.focusedIndex).toBe(2);
    expect(result.current.focusedItem).toBe("gamma");
  });

  it("focuses the first and last items with Home and End", () => {
    const { result } = renderHook(() => useListNavigation({ items }));

    act(() => {
      fireEvent.keyDown(document, { key: "End" });
    });
    expect(result.current.focusedIndex).toBe(2);

    act(() => {
      fireEvent.keyDown(document, { key: "Home" });
    });
    expect(result.current.focusedIndex).toBe(0);
  });

  it("selects on Enter and activates on Shift+Enter", () => {
    const onSelect = vi.fn();
    const onActivate = vi.fn();
    const { result } = renderHook(() =>
      useListNavigation({ items, onSelect, onActivate }),
    );

    act(() => {
      result.current.setFocusedIndex(1);
    });

    act(() => {
      fireEvent.keyDown(document, { key: "Enter" });
    });
    expect(onSelect).toHaveBeenCalledWith("beta");

    act(() => {
      fireEvent.keyDown(document, { key: "Enter", shiftKey: true });
    });
    expect(onActivate).toHaveBeenCalledWith("beta");
  });

  it("resets focus on Escape", () => {
    const { result } = renderHook(() => useListNavigation({ items }));

    act(() => {
      result.current.setFocusedIndex(2);
      fireEvent.keyDown(document, { key: "Escape" });
    });

    expect(result.current.focusedIndex).toBe(-1);
    expect(result.current.focusedItem).toBeNull();
  });

  it("ignores keyboard handling when disabled", () => {
    const { result } = renderHook(() =>
      useListNavigation({ items, enabled: false }),
    );

    act(() => {
      fireEvent.keyDown(document, { key: "ArrowDown" });
    });

    expect(result.current.focusedIndex).toBe(-1);
  });

  it("ignores key presses from inputs, textareas, and editable content", () => {
    const { result } = renderHook(() => useListNavigation({ items }));
    const input = document.createElement("input");
    const textarea = document.createElement("textarea");
    const editable = document.createElement("div");
    editable.contentEditable = "true";
    Object.defineProperty(editable, "isContentEditable", {
      configurable: true,
      value: true,
    });
    document.body.append(input, textarea, editable);

    act(() => {
      fireEvent.keyDown(input, { key: "ArrowDown" });
      fireEvent.keyDown(textarea, { key: "ArrowDown" });
      fireEvent.keyDown(editable, { key: "ArrowDown" });
    });

    expect(result.current.focusedIndex).toBe(-1);
  });

  it("keeps empty lists stable and still supports direct helpers", () => {
    const onSelect = vi.fn();
    const onActivate = vi.fn();
    const { result } = renderHook(() =>
      useListNavigation({ items: [], onSelect, onActivate }),
    );

    act(() => {
      result.current.focusNext();
      result.current.focusPrev();
      result.current.focusFirst();
      result.current.focusLast();
      result.current.selectFocused();
      result.current.activateFocused();
    });

    expect(result.current.focusedIndex).toBe(-1);
    expect(result.current.focusedItem).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
    expect(onActivate).not.toHaveBeenCalled();
  });

  it("returns props that mark the focused item", () => {
    expect(getListItemProps(1, 1)).toEqual({
      tabIndex: 0,
      "data-focused": true,
      role: "listitem",
    });
    expect(getListItemProps(0, 1)).toEqual({
      tabIndex: -1,
      "data-focused": false,
      role: "listitem",
    });
  });
});
