import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EntityCountCard } from "../EntityCountCard";

describe("EntityCountCard", () => {
  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(<EntityCountCard count={5} label="待办" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("显示计数数值", () => {
      render(<EntityCountCard count={10} label="待办" />);
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("显示标签文本", () => {
      render(<EntityCountCard count={3} label="待办" />);
      expect(screen.getByText("待办")).toBeInTheDocument();
    });
  });

  describe("Props 传递", () => {
    it("正确传递 count 属性", () => {
      render(<EntityCountCard count={42} label="完成" />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("正确传递 label 属性", () => {
      render(<EntityCountCard count={5} label="进行中" />);
      expect(screen.getByText("进行中")).toBeInTheDocument();
    });

    it("计数使用主色", () => {
      render(<EntityCountCard count={7} label="测试" />);
      const countElement = screen.getByText("7");
      expect(countElement).toHaveStyle({ color: "var(--color-primary)" });
    });

    it("标签使用次要颜色", () => {
      render(<EntityCountCard count={1} label="标签" />);
      const labelElement = screen.getByText("标签");
      expect(labelElement).toHaveStyle({ color: "var(--color-text-muted)" });
    });
  });

  describe("数值边界", () => {
    it("显示零值", () => {
      render(<EntityCountCard count={0} label="无" />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("显示大数值", () => {
      render(<EntityCountCard count={999} label="多" />);
      expect(screen.getByText("999")).toBeInTheDocument();
    });

    it("显示负数", () => {
      render(<EntityCountCard count={-1} label="负" />);
      expect(screen.getByText("-1")).toBeInTheDocument();
    });
  });

  describe("文本样式", () => {
    it("计数使用大号字体", () => {
      render(<EntityCountCard count={5} label="标签" />);
      const countElement = screen.getByText("5");
      expect(countElement).toHaveClass("text-xl", "font-bold");
    });

    it("标签使用小号字体", () => {
      render(<EntityCountCard count={3} label="标签" />);
      const labelElement = screen.getByText("标签");
      expect(labelElement).toHaveClass("text-xs");
    });
  });

  describe("布局", () => {
    it("内容居中对齐", () => {
      const { container } = render(<EntityCountCard count={1} label="标签" />);
      const card = container.querySelector(".text-center");
      expect(card).toBeInTheDocument();
    });

    it("使用紧凑的内边距", () => {
      const { container } = render(<EntityCountCard count={1} label="标签" />);
      const card = container.querySelector(".py-3");
      expect(card).toBeInTheDocument();
    });
  });

  describe("组合场景", () => {
    it("完整属性渲染", () => {
      render(<EntityCountCard count={25} label="已完成" />);

      expect(screen.getByText("25")).toBeInTheDocument();
      expect(screen.getByText("已完成")).toBeInTheDocument();

      const countElement = screen.getByText("25");
      expect(countElement).toHaveClass("text-xl", "font-bold");
      expect(countElement).toHaveStyle({ color: "var(--color-primary)" });
    });
  });
});
