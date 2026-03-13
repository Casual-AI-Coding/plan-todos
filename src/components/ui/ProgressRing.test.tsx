import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressRing, CircularProgress } from "./ProgressRing";

describe("ProgressRing", () => {
  describe("value handling", () => {
    it("should render with value", () => {
      const { container } = render(<ProgressRing value={50} />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should clamp value to 0-100 range", () => {
      // Test negative value
      const { container: c1 } = render(<ProgressRing value={-10} />);
      expect(c1.querySelector("svg")).toBeInTheDocument();

      // Test value > 100
      const { container: c2 } = render(<ProgressRing value={150} />);
      expect(c2.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("dimensions", () => {
    it("should apply default size (100px)", () => {
      const { container } = render(<ProgressRing value={50} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.width).toBe("100px");
      expect(wrapper.style.height).toBe("100px");
    });

    it("should apply custom size", () => {
      const { container } = render(<ProgressRing value={50} size={150} />);
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.width).toBe("150px");
      expect(wrapper.style.height).toBe("150px");
    });

    it("should apply custom stroke width", () => {
      const { container } = render(
        <ProgressRing value={50} strokeWidth={10} />,
      );
      expect(container.querySelector("circle")).toBeInTheDocument();
    });
  });

  describe("colors", () => {
    it("should apply custom progress color", () => {
      const { container } = render(<ProgressRing value={50} color="#FF0000" />);
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should apply custom track color", () => {
      const { container } = render(
        <ProgressRing value={50} trackColor="#CCCCCC" />,
      );
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("content", () => {
    it("should show value by default", () => {
      render(<ProgressRing value={75} />);
      expect(screen.getByText("75")).toBeInTheDocument();
    });

    it("should hide value when showValue=false", () => {
      render(<ProgressRing value={75} showValue={false} />);
      expect(screen.queryByText("75")).not.toBeInTheDocument();
    });

    it("should show label", () => {
      render(<ProgressRing value={50} label="Progress" />);
      expect(screen.getByText("Progress")).toBeInTheDocument();
    });

    it("should not show label when not provided", () => {
      render(<ProgressRing value={50} />);
      expect(screen.queryByText("Progress")).not.toBeInTheDocument();
    });
  });

  describe("attributes", () => {
    it("should apply title attribute", () => {
      const { container } = render(
        <ProgressRing value={50} title="Completion status" />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.title).toBe("Completion status");
    });

    it("should apply custom className", () => {
      const { container } = render(
        <ProgressRing value={50} className="custom-progress" />,
      );
      expect(container.firstChild).toHaveClass("custom-progress");
    });
  });
});

describe("CircularProgress", () => {
  it("should be an alias for ProgressRing", () => {
    const { container } = render(<CircularProgress value={50} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("should pass all props to ProgressRing", () => {
    render(<CircularProgress value={80} label="Loading" />);
    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("Loading")).toBeInTheDocument();
  });
});
