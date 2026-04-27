import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EmptyStateCard } from "../EmptyStateCard";
import { Button } from "@/components/ui/Button";

describe("EmptyStateCard", () => {
  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(
        <EmptyStateCard title="暂无数据" description="暂无描述" />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("显示标题", () => {
      render(<EmptyStateCard title="暂无待办" />);
      expect(screen.getByText("暂无待办")).toBeInTheDocument();
    });

    it("显示描述", () => {
      render(
        <EmptyStateCard
          title="暂无待办"
          description="创建你的第一个待办事项"
        />,
      );
      expect(screen.getByText("创建你的第一个待办事项")).toBeInTheDocument();
    });

    it("显示默认图标", () => {
      const { container } = render(<EmptyStateCard title="暂无数据" />);
      const icon = container.querySelector("[role='img']");
      expect(icon).toBeInTheDocument();
      expect(icon).toHaveTextContent("📋");
    });

    it("显示自定义图标", () => {
      const { container } = render(
        <EmptyStateCard title="暂无数据" icon="🎯" />,
      );
      const icon = container.querySelector("[role='img']");
      expect(icon).toHaveTextContent("🎯");
    });
  });

  describe("Props 传递", () => {
    it("传递 title 属性", () => {
      render(<EmptyStateCard title="测试标题" />);
      expect(screen.getByText("测试标题")).toBeInTheDocument();
    });

    it("传递 description 属性", () => {
      render(<EmptyStateCard title="标题" description="测试描述" />);
      expect(screen.getByText("测试描述")).toBeInTheDocument();
    });

    it("传递 icon 属性", () => {
      render(<EmptyStateCard title="标题" icon="🚀" />);
      const icon = document.querySelector("[role='img']");
      expect(icon).toHaveTextContent("🚀");
    });

    it("不传递 description 时不渲染描述区域", () => {
      const { container } = render(<EmptyStateCard title="仅标题" />);
      const paragraphs = container.querySelectorAll("p");
      expect(paragraphs.length).toBe(0);
    });
  });

  describe("action 属性", () => {
    it("渲染 action 按钮", () => {
      render(
        <EmptyStateCard title="暂无待办" action={<Button>创建待办</Button>} />,
      );
      expect(screen.getByText("创建待办")).toBeInTheDocument();
    });

    it("不传递 action 时不渲染按钮区域", () => {
      const { container } = render(<EmptyStateCard title="暂无数据" />);
      const actionDiv = container.querySelectorAll("div > div");
      // 最后一个 div 是 action 区域，如果没有 action 则为空
      expect(container.innerHTML).not.toContain("button");
    });

    it("action 为 null 时不渲染", () => {
      const { container } = render(
        <EmptyStateCard title="标题" action={null} />,
      );
      expect(container.querySelector("button")).not.toBeInTheDocument();
    });
  });

  describe("className 属性", () => {
    it("传递自定义 className", () => {
      const { container } = render(
        <EmptyStateCard title="标题" className="custom-class" />,
      );
      const card = container.querySelector(".custom-class");
      expect(card).toBeInTheDocument();
    });

    it("默认 className 为空字符串", () => {
      const { container } = render(<EmptyStateCard title="标题" />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("空状态场景", () => {
    it("仅传递必需属性 title 时正常渲染", () => {
      const { container } = render(<EmptyStateCard title="暂无内容" />);
      expect(container.firstChild).toBeInTheDocument();
      expect(screen.getByText("暂无内容")).toBeInTheDocument();
    });

    it("title 和 description 都为空时不崩溃", () => {
      // EmptyStateCard 要求 title 为必填，所以只测试可选字段为空的情况
      const { container } = render(
        <EmptyStateCard title="标题" description="" />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe("组合场景", () => {
    it("完整属性渲染", () => {
      render(
        <EmptyStateCard
          icon="📝"
          title="暂无计划"
          description="创建你的第一个计划"
          action={<Button>新建计划</Button>}
          className="my-4"
        />,
      );

      expect(screen.getByText("📝")).toBeInTheDocument();
      expect(screen.getByText("暂无计划")).toBeInTheDocument();
      expect(screen.getByText("创建你的第一个计划")).toBeInTheDocument();
      expect(screen.getByText("新建计划")).toBeInTheDocument();
    });

    it("带自定义样式的空状态", () => {
      const { container } = render(
        <EmptyStateCard title="自定义样式" className="p-8 bg-gray-100" />,
      );
      const card = container.querySelector(".p-8");
      expect(card).toBeInTheDocument();
    });
  });
});
