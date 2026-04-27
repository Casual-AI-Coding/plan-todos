import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  configToString,
  DEFAULT_HOTKEYS,
  useHotkeyStore,
  type HotkeyDefinition,
} from "./useHotkeyStore";

const newTodoBinding: HotkeyDefinition = DEFAULT_HOTKEYS["new-todo"];
const searchBinding: HotkeyDefinition = DEFAULT_HOTKEYS.search;

describe("configToString", () => {
  it("formats modifier keys and uppercases the main key", () => {
    expect(
      configToString({ key: "k", ctrl: true, shift: true, alt: true }),
    ).toBe("Ctrl + Shift + Alt + K");
  });

  it("formats a key without modifiers", () => {
    expect(configToString({ key: "escape" })).toBe("ESCAPE");
  });
});

describe("useHotkeyStore", () => {
  beforeEach(() => {
    localStorage.clear();
    useHotkeyStore.setState({ hotkeys: {}, customConfigs: {} });
  });

  it("registers a hotkey using the default binding", () => {
    const callback = vi.fn();

    useHotkeyStore.getState().register("new-todo", newTodoBinding, callback);

    expect(useHotkeyStore.getState().hotkeys["new-todo"]).toEqual({
      key: "n",
      ctrl: true,
      shift: undefined,
      alt: undefined,
      description: "新建 Todo",
      action: callback,
    });
  });

  it("registers a hotkey using a saved custom config", () => {
    const callback = vi.fn();

    useHotkeyStore.getState().updateConfig("new-todo", {
      key: "m",
      ctrl: true,
      shift: true,
    });
    useHotkeyStore.getState().register("new-todo", newTodoBinding, callback);

    expect(useHotkeyStore.getState().hotkeys["new-todo"]).toEqual({
      key: "m",
      ctrl: true,
      shift: true,
      alt: undefined,
      description: "新建 Todo",
      action: callback,
    });
  });

  it("unregisters a previously registered hotkey", () => {
    useHotkeyStore.getState().register("new-todo", newTodoBinding, vi.fn());
    useHotkeyStore.getState().unregister("new-todo");

    expect(useHotkeyStore.getState().hotkeys["new-todo"]).toBeUndefined();
  });

  it("updates the custom config when there is no conflict", () => {
    useHotkeyStore.getState().updateConfig("search", {
      key: "f",
      ctrl: true,
      alt: true,
    });

    expect(useHotkeyStore.getState().customConfigs.search).toEqual({
      key: "f",
      ctrl: true,
      alt: true,
    });
  });

  it("does not update the custom config when a conflict is detected", () => {
    const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    useHotkeyStore.getState().register("new-todo", newTodoBinding, vi.fn());
    useHotkeyStore.getState().updateConfig("search", {
      key: "n",
      ctrl: true,
    });

    expect(useHotkeyStore.getState().customConfigs.search).toBeUndefined();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Hotkey conflict: Ctrl + N is already used by "new-todo"',
    );
  });

  it("removes a saved custom config for one action", () => {
    useHotkeyStore.getState().updateConfig("new-todo", {
      key: "m",
      ctrl: true,
    });
    useHotkeyStore.getState().updateConfig("search", {
      key: "f",
      ctrl: true,
    });

    useHotkeyStore.getState().resetConfig("new-todo");

    expect(useHotkeyStore.getState().customConfigs["new-todo"]).toBeUndefined();
    expect(useHotkeyStore.getState().customConfigs.search).toEqual({
      key: "f",
      ctrl: true,
    });
  });

  it("resets all saved custom configs", () => {
    useHotkeyStore.getState().updateConfig("new-todo", {
      key: "m",
      ctrl: true,
    });
    useHotkeyStore.getState().updateConfig("search", {
      key: "f",
      ctrl: true,
    });

    useHotkeyStore.getState().resetAll();

    expect(useHotkeyStore.getState().customConfigs).toEqual({});
  });

  it("returns the saved config when one exists", () => {
    useHotkeyStore.getState().updateConfig("new-todo", {
      key: "m",
      ctrl: true,
      shift: true,
    });

    expect(useHotkeyStore.getState().getConfig("new-todo")).toEqual({
      key: "m",
      ctrl: true,
      shift: true,
    });
  });

  it("returns the default config when no custom config exists", () => {
    expect(useHotkeyStore.getState().getConfig("search")).toEqual({
      key: searchBinding.key,
      ctrl: searchBinding.ctrl,
      shift: searchBinding.shift,
      alt: searchBinding.alt,
    });
  });

  it("returns an empty config for an unknown action", () => {
    expect(useHotkeyStore.getState().getConfig("unknown-action")).toEqual({
      key: "",
      ctrl: false,
      shift: false,
      alt: false,
    });
  });

  it("detects conflicts across registered hotkeys case-insensitively", () => {
    useHotkeyStore.getState().register("new-todo", newTodoBinding, vi.fn());

    expect(
      useHotkeyStore.getState().detectConflict({ key: "N", ctrl: true }),
    ).toBe("new-todo");
  });

  it("ignores the excluded action when checking conflicts", () => {
    useHotkeyStore.getState().register("new-todo", newTodoBinding, vi.fn());

    expect(
      useHotkeyStore
        .getState()
        .detectConflict({ key: "n", ctrl: true }, "new-todo"),
    ).toBeNull();
  });

  it("returns null when no registered hotkey conflicts", () => {
    useHotkeyStore.getState().register("new-todo", newTodoBinding, vi.fn());

    expect(
      useHotkeyStore.getState().detectConflict({ key: "p", ctrl: true }),
    ).toBeNull();
  });
});
