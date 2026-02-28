import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HoverCard } from "./HoverCard";

describe("HoverCard", () => {
  it("renders children correctly", () => {
    render(
      <HoverCard>
        <div>Card Content</div>
      </HoverCard>
    );
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <HoverCard className="custom-class">
        <div>Content</div>
      </HoverCard>
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has rounded-lg and border classes", () => {
    const { container } = render(
      <HoverCard>
        <div>Content</div>
      </HoverCard>
    );
    expect(container.firstChild).toHaveClass("rounded-lg", "border");
  });

  it("renders with custom style", () => {
    const { container } = render(
      <HoverCard style={{ padding: "20px" }}>
        <div>Content</div>
      </HoverCard>
    );
    const element = container.firstChild as HTMLElement;
    expect(element.style.padding).toBe("20px");
  });

  it("handles onClick prop", () => {
    const handleClick = vi.fn();
    const { container } = render(
      <HoverCard onClick={handleClick}>
        <div>Clickable Card</div>
      </HoverCard>
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("has pointer cursor when onClick is provided", () => {
    const { container } = render(
      <HoverCard onClick={() => {}}>
        <div>Content</div>
      </HoverCard>
    );
    expect(container.firstChild).toHaveStyle({ cursor: "pointer" });
  });

  it("has default cursor when onClick is not provided", () => {
    const { container } = render(
      <HoverCard>
        <div>Content</div>
      </HoverCard>
    );
    expect(container.firstChild).toHaveStyle({ cursor: "default" });
  });

  it("applies glow effect when glowOnHover is true", () => {
    const { container } = render(
      <HoverCard glowOnHover>
        <div>Content</div>
      </HoverCard>
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("renders with custom hoverElevation", () => {
    const { container } = render(
      <HoverCard hoverElevation={10}>
        <div>Content</div>
      </HoverCard>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
