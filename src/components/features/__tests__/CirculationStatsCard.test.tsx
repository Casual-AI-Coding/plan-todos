import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CirculationStatsCard } from "../CirculationStatsCard";

describe("CirculationStatsCard", () => {
  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(
        <CirculationStatsCard
          todayPending={3}
          todayCompleted={5}
          currentStreak={10}
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("显示三列布局", () => {
      const { container } = render(
        <CirculationStatsCard
          todayPending={1}
          todayCompleted={2}
          currentStreak={3}
        />,
      );
      const grid = container.querySelector(".grid-cols-3");
      expect(grid).toBeInTheDocument();
    });
  });

  describe("Props 传递", () => {
    it("正确显示待打卡数量", () => {
      render(
        <CirculationStatsCard
          todayPending={3}
          todayCompleted={5}
          currentStreak={10}
        />,
      );
      expect(screen.getByText("3")).toBeInTheDocument();
    });

    it("正确显示已完成数量", () => {
      render(
        <CirculationStatsCard
          todayPending={3}
          todayCompleted={5}
          currentStreak={10}
        />,
      );
      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("正确显示连续天数", () => {
      render(
        <CirculationStatsCard
          todayPending={3}
          todayCompleted={5}
          currentStreak={10}
        />,
      );
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("显示待打卡标签", () => {
      render(
        <CirculationStatsCard
          todayPending={1}
          todayCompleted={2}
          currentStreak={3}
        />,
      );
      expect(screen.getByText("今日待打卡")).toBeInTheDocument();
    });

    it("显示已完成标签", () => {
      render(
        <CirculationStatsCard
          todayPending={1}
          todayCompleted={2}
          currentStreak={3}
        />,
      );
      expect(screen.getByText("今日已完成")).toBeInTheDocument();
    });

    it("显示连续天数标签", () => {
      render(
        <CirculationStatsCard
          todayPending={1}
          todayCompleted={2}
          currentStreak={3}
        />,
      );
      expect(screen.getByText("当前最长连续")).toBeInTheDocument();
    });
  });

  describe("数值样式", () => {
    it("待打卡使用主色", () => {
      render(
        <CirculationStatsCard
          todayPending={2}
          todayCompleted={0}
          currentStreak={0}
        />,
      );
      const pendingElement = screen.getByText("2");
      expect(pendingElement).toHaveStyle({ color: "var(--color-primary)" });
    });

    it("已完成使用成功色", () => {
      render(
        <CirculationStatsCard
          todayPending={0}
          todayCompleted={5}
          currentStreak={0}
        />,
      );
      const completedElement = screen.getByText("5");
      expect(completedElement).toHaveStyle({ color: "var(--color-success)" });
    });

    it("连续天数使用警告色", () => {
      render(
        <CirculationStatsCard
          todayPending={0}
          todayCompleted={0}
          currentStreak={7}
        />,
      );
      const streakElement = screen.getByText("7");
      expect(streakElement).toHaveStyle({ color: "var(--color-warning)" });
    });

    it("数值使用大号字体", () => {
      render(
        <CirculationStatsCard
          todayPending={1}
          todayCompleted={2}
          currentStreak={3}
        />,
      );
      const pendingElement = screen.getByText("1");
      expect(pendingElement).toHaveClass("text-3xl", "font-bold");
    });
  });

  describe("零值处理", () => {
    it("待打卡为零时正常显示", () => {
      render(
        <CirculationStatsCard
          todayPending={0}
          todayCompleted={5}
          currentStreak={3}
        />,
      );
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("完成为零时正常显示", () => {
      render(
        <CirculationStatsCard
          todayPending={3}
          todayCompleted={0}
          currentStreak={5}
        />,
      );
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("连续天数为零时正常显示", () => {
      render(
        <CirculationStatsCard
          todayPending={3}
          todayCompleted={2}
          currentStreak={0}
        />,
      );
      expect(screen.getByText("0")).toBeInTheDocument();
    });
  });

  describe("大数值", () => {
    it("显示大数值", () => {
      render(
        <CirculationStatsCard
          todayPending={999}
          todayCompleted={888}
          currentStreak={777}
        />,
      );
      expect(screen.getByText("999")).toBeInTheDocument();
      expect(screen.getByText("888")).toBeInTheDocument();
      expect(screen.getByText("777")).toBeInTheDocument();
    });
  });

  describe("布局间距", () => {
    it("使用 gap-4 间距", () => {
      const { container } = render(
        <CirculationStatsCard
          todayPending={1}
          todayCompleted={2}
          currentStreak={3}
        />,
      );
      const grid = container.querySelector(".gap-4");
      expect(grid).toBeInTheDocument();
    });

    it("每列内容居中", () => {
      const { container } = render(
        <CirculationStatsCard
          todayPending={1}
          todayCompleted={2}
          currentStreak={3}
        />,
      );
      const centerDivs = container.querySelectorAll(".text-center");
      expect(centerDivs.length).toBe(3);
    });
  });

  describe("组合场景", () => {
    it("完整属性渲染", () => {
      render(
        <CirculationStatsCard
          todayPending={3}
          todayCompleted={7}
          currentStreak={14}
        />,
      );

      // 验证所有数值显示
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("7")).toBeInTheDocument();
      expect(screen.getByText("14")).toBeInTheDocument();

      // 验证所有标签显示
      expect(screen.getByText("今日待打卡")).toBeInTheDocument();
      expect(screen.getByText("今日已完成")).toBeInTheDocument();
      expect(screen.getByText("当前最长连续")).toBeInTheDocument();
    });

    it("全部为零的场景", () => {
      render(
        <CirculationStatsCard
          todayPending={0}
          todayCompleted={0}
          currentStreak={0}
        />,
      );

      // 有三个零值元素
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBe(3);
    });
  });
});
