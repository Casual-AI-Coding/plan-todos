import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
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
});
