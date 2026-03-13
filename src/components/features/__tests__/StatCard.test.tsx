import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StatCard } from "../StatCard";

describe("StatCard", () => {
  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(<StatCard value={10} label="测试标签" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("显示标签文本", () => {
      render(<StatCard value={10} label="今日待办" />);
      expect(screen.getByText("今日待办")).toBeInTheDocument();
    });

    it("显示数值", () => {
      render(<StatCard value={42} label="完成数" />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });
  });

  describe("Props 传递", () => {
    it("正确显示数字类型的值", () => {
      render(<StatCard value={100} label="总数" />);
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("正确显示字符串类型的值", () => {
      render(<StatCard value="N/A" label="状态" />);
      expect(screen.getByText("N/A")).toBeInTheDocument();
    });

    it("正确显示自定义颜色", () => {
      render(<StatCard value={5} label="标签" color="#FF5733" />);
      const valueElement = screen.getByText("5");
      expect(valueElement).toHaveStyle({ color: "#FF5733" });
    });

    it("使用默认主色", () => {
      render(<StatCard value={10} label="标签" />);
      const valueElement = screen.getByText("10");
      expect(valueElement).toHaveStyle({ color: "var(--color-primary)" });
    });
  });

  describe("size 变体", () => {
    it("size=lg 时使用大号字体", () => {
      render(<StatCard value={100} label="大标签" size="lg" />);
      const valueElement = screen.getByText("100");
      expect(valueElement).toHaveClass("text-3xl", "font-bold");
    });

    it("size=sm 时使用小号字体", () => {
      render(<StatCard value={100} label="小标签" size="sm" />);
      const valueElement = screen.getByText("100");
      expect(valueElement).toHaveClass("text-lg", "font-semibold");
    });

    it("默认 size 为 lg", () => {
      render(<StatCard value={50} label="默认标签" />);
      const valueElement = screen.getByText("50");
      expect(valueElement).toHaveClass("text-3xl", "font-bold");
    });
  });

  describe("数值格式化", () => {
    it("显示大数值", () => {
      render(<StatCard value={999999} label="大数" />);
      expect(screen.getByText("999999")).toBeInTheDocument();
    });

    it("显示零值", () => {
      render(<StatCard value={0} label="零" />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("显示负数", () => {
      render(<StatCard value={-5} label="负数" />);
      expect(screen.getByText("-5")).toBeInTheDocument();
    });

    it("显示小数", () => {
      render(<StatCard value={3.14} label="圆周率" />);
      expect(screen.getByText("3.14")).toBeInTheDocument();
    });
  });

  describe("组合场景", () => {
    it("大尺寸带自定义颜色", () => {
      render(
        <StatCard
          value={88}
          label="完成率"
          color="var(--color-success)"
          size="lg"
        />,
      );
      const valueElement = screen.getByText("88");
      expect(valueElement).toHaveClass("text-3xl", "font-bold");
      expect(valueElement).toHaveStyle({ color: "var(--color-success)" });
    });

    it("小尺寸带自定义颜色", () => {
      render(
        <StatCard
          value={25}
          label="小计"
          color="var(--color-warning)"
          size="sm"
        />,
      );
      const valueElement = screen.getByText("25");
      expect(valueElement).toHaveClass("text-lg", "font-semibold");
      expect(valueElement).toHaveStyle({ color: "var(--color-warning)" });
    });
  });
});
