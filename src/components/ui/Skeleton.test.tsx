/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  describe("variants", () => {
    it("should render rectangular variant by default", () => {
      const { container } = render(<Skeleton />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });

    it("should render circular variant", () => {
      const { container } = render(<Skeleton variant="circular" />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });

    it("should render text variant", () => {
      const { container } = render(<Skeleton variant="text" />);
      const element = container.firstChild;
      expect(element).toBeInTheDocument();
    });
  });

  describe("dimensions", () => {
    it("should apply width and height", () => {
      const { container } = render(<Skeleton width={200} height={100} />);
      const element = container.firstChild as HTMLElement;
      expect(element.style.width).toBe("200px");
      expect(element.style.height).toBe("100px");
    });

    it("should apply string dimensions", () => {
      const { container } = render(<Skeleton width="100%" height="2em" />);
      const element = container.firstChild as HTMLElement;
      expect(element.style.width).toBe("100%");
      expect(element.style.height).toBe("2em");
    });
  });

  describe("animation", () => {
    it("should render animated skeleton by default", () => {
      const { container } = render(<Skeleton />);
      // Animated version uses motion.div
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should render non-animated skeleton when animated=false", () => {
      const { container } = render(<Skeleton animated={false} />);
      // Non-animated version uses plain div
      const element = container.firstChild as HTMLElement;
      expect(element.tagName).toBe("DIV");
    });
  });

  describe("styling", () => {
    it("should apply custom className", () => {
      const { container } = render(<Skeleton className="custom-class" />);
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should apply custom style", () => {
      const { container } = render(<Skeleton style={{ marginTop: 10 }} />);
      const element = container.firstChild as HTMLElement;
      expect(element.style.marginTop).toBe("10px");
    });
  });
});
