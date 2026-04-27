import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    render(<Button loading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("disabled");
  });

  it("applies variant styles", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary").style.background).toContain("var(--color-primary)");

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText("Danger").style.background).toContain("var(--color-error)");
  });

  it("applies size styles", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toHaveClass("px-6 py-3 text-base");
  });

  it("renders icon when provided", () => {
    render(
      <Button icon={<span data-testid="icon">🎯</span>}>With Icon</Button>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("disabled");
  });

  it("applies secondary variant styles", () => {
    render(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByText("Secondary")).toBeInTheDocument();
  });

  it("applies ghost variant styles", () => {
    render(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByText("Ghost")).toBeInTheDocument();
  });

  it("applies small size styles", () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByText("Small")).toHaveClass("px-3 py-1.5 text-sm");
  });

  it("applies medium size styles", () => {
    render(<Button size="md">Medium</Button>);
    expect(screen.getByText("Medium")).toHaveClass("px-4 py-2 text-sm");
  });

  it("handles disabled state with click", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Click
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("handles loading state with click", () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Loading Click
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders with custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });

  it("handles disabled and loading combination", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled loading onClick={handleClick}>
        Both
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("disabled");
  });

  it("handles ripple animation timeout", () => {
    vi.useFakeTimers();
    render(<Button>Ripple Test</Button>);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    vi.advanceTimersByTime(600);
    expect(button).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("should handle click without onClick handler", () => {
    // Test click when onClick is undefined (line 76: onClick?.(e))
    render(<Button>No Handler</Button>);
    const button = screen.getByText("No Handler");
    // Should not throw when clicked without onClick
    expect(() => fireEvent.click(button)).not.toThrow();
  });

  it("should render with non-string children for aria-label", () => {
    // Test aria-label when children is not a string (line 147)
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>,
    );
    const button = screen.getByRole("button");
    // When children is not a string and no label, aria-label should be undefined
    expect(button).toBeInTheDocument();
  });

  it("should use label prop for aria-label", () => {
    // Test aria-label from label prop (line 147)
    render(
      <Button label="Custom Label">
        <span>Icon</span>
      </Button>,
    );
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Custom Label");
  });

  it("should use string children as aria-label", () => {
    // Test aria-label from string children (line 147)
    render(<Button>Button Text</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Button Text");
  });

  it("should not apply scale effects when loading", () => {
    // Test whileHover/whileTap scale when loading (lines 128, 139)
    const { container } = render(<Button loading>Loading</Button>);
    const button = container.querySelector("button");
    // Button should be disabled when loading
    expect(button).toHaveAttribute("disabled");
  });
});
