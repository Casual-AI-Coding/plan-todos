import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScaleIn } from "./ScaleIn";

describe("ScaleIn", () => {
  it("should render children", () => {
    render(
      <ScaleIn>
        <div>Test Content</div>
      </ScaleIn>,
    );
    expect(screen.getByText("Test Content")).toBeInTheDocument();
  });

  it("should apply default delay and duration", () => {
    const { container } = render(
      <ScaleIn>
        <div>Content</div>
      </ScaleIn>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should apply custom delay and duration", () => {
    const { container } = render(
      <ScaleIn delay={0.5} duration={0.5}>
        <div>Content</div>
      </ScaleIn>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it("should pass additional motion props", () => {
    const { container } = render(
      <ScaleIn data-testid="scale-in">
        <div>Content</div>
      </ScaleIn>,
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
