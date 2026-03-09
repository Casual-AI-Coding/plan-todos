import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ReminderBadge } from "../ReminderBadge";

describe("ReminderBadge", () => {
  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(<ReminderBadge count={1} />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("显示铃铛图标", () => {
      render(<ReminderBadge count={1} />);
      // Lucide-react Bell component renders with data-testid
      expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
    });
  });

  describe("count=0", () => {
    it("count=0 时不渲染", () => {
      const { container } = render(<ReminderBadge count={0} />);
      // count=0 时返回 null，不渲染任何内容
      expect(container.firstChild).toBeNull();
    });

    it("空渲染时没有 DOM 元素", () => {
      const { container } = render(<ReminderBadge count={0} />);
      expect(container.innerHTML).toBe("");
    });
  });

  describe("count>0", () => {
    it("count>0 时显示数字徽章", () => {
      render(<ReminderBadge count={5} />);
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("count=1 时显示正确数字", () => {
      render(<ReminderBadge count={1} />);
      expect(screen.getByText("1")).toBeInTheDocument();
    });

    it("大数字也能正确显示", () => {
      render(<ReminderBadge count={99} />);
      expect(screen.getByText("99")).toBeInTheDocument();
    });

    it("渲染数字徽章元素", () => {
      const { container } = render(<ReminderBadge count={3} />);
      const badge = container.querySelector(".absolute");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("3");
    });
  });

  describe("sent 状态", () => {
    it("sent=true 时 opacity 为 0.6", () => {
      render(<ReminderBadge count={5} sent />);
      const span = screen.getByText("5").parentElement;
      expect(span).toHaveStyle({ opacity: "0.6" });
    });

    it("sent=false 时 opacity 为 1", () => {
      render(<ReminderBadge count={5} sent={false} />);
      const span = screen.getByText("5").parentElement;
      expect(span).toHaveStyle({ opacity: "1" });
    });

    it("默认 sent 为 false", () => {
      render(<ReminderBadge count={5} />);
      const span = screen.getByText("5").parentElement;
      expect(span).toHaveStyle({ opacity: "1" });
    });

    it("sent=true 时仍然渲染内容", () => {
      render(<ReminderBadge count={5} sent />);
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByTestId("bell-icon")).toBeInTheDocument();
    });
  });

  describe("size 变体", () => {
    it("size=sm 时小尺寸", () => {
      render(<ReminderBadge count={1} size="sm" />);
      const bellIcon = screen.getByTestId("bell-icon");
      // sm: w-3 h-3
      expect(bellIcon).toHaveClass("w-3", "h-3");
    });

    it("size=md 时中尺寸（默认）", () => {
      render(<ReminderBadge count={1} size="md" />);
      const bellIcon = screen.getByTestId("bell-icon");
      // md: w-4 h-4 (默认)
      expect(bellIcon).toHaveClass("w-4", "h-4");
    });

    it("默认 size 为 md", () => {
      render(<ReminderBadge count={1} />);
      const bellIcon = screen.getByTestId("bell-icon");
      // 默认应该是 md 尺寸
      expect(bellIcon).toHaveClass("w-4", "h-4");
    });
  });

  describe("组合场景", () => {
    it("count>0, sent=true, size=sm", () => {
      render(<ReminderBadge count={3} sent size="sm" />);
      const span = screen.getByText("3").parentElement;
      expect(span).toHaveStyle({ opacity: "0.6" });
      const bellIcon = screen.getByTestId("bell-icon");
      expect(bellIcon).toHaveClass("w-3", "h-3");
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("count>0, sent=false, size=md (默认)", () => {
      render(<ReminderBadge count={7} />);
      const span = screen.getByText("7").parentElement;
      expect(span).toHaveStyle({ opacity: "1" });
      const bellIcon = screen.getByTestId("bell-icon");
      expect(bellIcon).toHaveClass("w-4", "h-4");
      expect(screen.getByText("7")).toBeInTheDocument();
    });
  });
});
