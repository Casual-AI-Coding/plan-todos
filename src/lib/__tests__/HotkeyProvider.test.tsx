import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { HotkeyProvider } from "../HotkeyProvider";

const mockNewTodoAction = vi.fn();
const mockEscapeAction = vi.fn();

vi.mock("../useHotkeyStore", () => ({
  useHotkeyStore: vi.fn((selector: (state: unknown) => unknown) =>
    selector({
      hotkeys: {
        "new-todo": {
          key: "n",
          ctrl: true,
          shift: false,
          alt: false,
          description: "New todo",
          action: mockNewTodoAction,
        },
        escape: {
          key: "Escape",
          ctrl: false,
          shift: false,
          alt: false,
          description: "Close modal",
          action: mockEscapeAction,
        },
      },
    }),
  ),
}));

describe("HotkeyProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children", () => {
    const { getByText } = render(
      <HotkeyProvider>
        <div>Child content</div>
      </HotkeyProvider>,
    );

    expect(getByText("Child content")).toBeInTheDocument();
  });

  it("invokes the matching hotkey action for ctrl shortcuts", () => {
    render(
      <HotkeyProvider>
        <div>Hotkeys</div>
      </HotkeyProvider>,
    );

    const event = new KeyboardEvent("keydown", {
      key: "N",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockNewTodoAction).toHaveBeenCalledTimes(1);
    expect(event.defaultPrevented).toBe(true);
  });

  it("matches meta key shortcuts through the ctrl/meta branch", () => {
    render(
      <HotkeyProvider>
        <div>Hotkeys</div>
      </HotkeyProvider>,
    );

    const event = new KeyboardEvent("keydown", {
      key: "n",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });

    window.dispatchEvent(event);

    expect(mockNewTodoAction).toHaveBeenCalledTimes(1);
  });

  it("ignores non-escape keys inside input elements", () => {
    render(
      <HotkeyProvider>
        <div>Hotkeys</div>
      </HotkeyProvider>,
    );

    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", {
      key: "n",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    input.dispatchEvent(event);

    expect(mockNewTodoAction).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });

  it("allows escape to pass through from input elements", () => {
    render(
      <HotkeyProvider>
        <div>Hotkeys</div>
      </HotkeyProvider>,
    );

    const input = document.createElement("input");
    document.body.appendChild(input);

    const event = new KeyboardEvent("keydown", {
      key: "Escape",
      bubbles: true,
      cancelable: true,
    });

    input.dispatchEvent(event);

    expect(mockEscapeAction).toHaveBeenCalledTimes(1);
    document.body.removeChild(input);
  });

  it("ignores non-escape keys inside textarea elements", () => {
    render(
      <HotkeyProvider>
        <div>Hotkeys</div>
      </HotkeyProvider>,
    );

    const textarea = document.createElement("textarea");
    document.body.appendChild(textarea);

    const event = new KeyboardEvent("keydown", {
      key: "n",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    textarea.dispatchEvent(event);

    expect(mockNewTodoAction).not.toHaveBeenCalled();
    document.body.removeChild(textarea);
  });

  it("ignores non-escape keys inside content editable elements", () => {
    render(
      <HotkeyProvider>
        <div>Hotkeys</div>
      </HotkeyProvider>,
    );

    const editable = document.createElement("div");
    Object.defineProperty(editable, "isContentEditable", {
      configurable: true,
      value: true,
    });
    document.body.appendChild(editable);

    const event = new KeyboardEvent("keydown", {
      key: "n",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });

    editable.dispatchEvent(event);

    expect(mockNewTodoAction).not.toHaveBeenCalled();
    document.body.removeChild(editable);
  });

  it("does not invoke actions when modifier branches do not match", () => {
    render(
      <HotkeyProvider>
        <div>Hotkeys</div>
      </HotkeyProvider>,
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "n",
        ctrlKey: true,
        shiftKey: true,
        bubbles: true,
      }),
    );
    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "n",
        ctrlKey: true,
        altKey: true,
        bubbles: true,
      }),
    );

    expect(mockNewTodoAction).not.toHaveBeenCalled();
  });

  it("does not invoke actions when no hotkey matches", () => {
    render(
      <HotkeyProvider>
        <div>Hotkeys</div>
      </HotkeyProvider>,
    );

    window.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "x",
        ctrlKey: true,
        bubbles: true,
      }),
    );

    expect(mockNewTodoAction).not.toHaveBeenCalled();
    expect(mockEscapeAction).not.toHaveBeenCalled();
  });
});
