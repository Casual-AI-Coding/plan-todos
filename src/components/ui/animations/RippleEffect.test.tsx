import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { RippleEffect } from "./RippleEffect";

describe("RippleEffect", () => {
  it("renders children correctly", () => {
    render(
      <RippleEffect>
        <button>Click Me</button>
      </RippleEffect>
    );
    expect(screen.getByText("Click Me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(
      <RippleEffect onClick={handleClick}>
        <button>Click</button>
      </RippleEffect>
    );
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("applies custom className", () => {
    const { container } = render(
      <RippleEffect className="custom-class">
        <div>Content</div>
      </RippleEffect>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has relative and overflow-hidden classes", () => {
    const { container } = render(
      <RippleEffect>
        <div>Content</div>
      </RippleEffect>
    );
    expect(container.firstChild).toHaveClass("relative", "overflow-hidden");
  });
});
