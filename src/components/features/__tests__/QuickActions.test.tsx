import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { QuickActions } from "../QuickActions";

// Mock Card component
vi.mock("@/components/ui", () => ({
  Card: vi.fn(
    ({
      children,
      className,
      ...props
    }: {
      children: React.ReactNode;
      className?: string;
    }) => (
      <div data-testid="card" className={className} {...props}>
        {children}
      </div>
    ),
  ),
}));

// Mock ProgressRing component
vi.mock("@/components/ui/ProgressRing", () => ({
  ProgressRing: vi.fn(
    ({
      value,
      size,
      strokeWidth,
      label,
    }: {
      value: number;
      size?: number;
      strokeWidth?: number;
      label?: string;
    }) => (
      <div
        data-testid="progress-ring"
        data-value={value}
        data-size={size}
        data-stroke-width={strokeWidth}
        data-label={label}
      >
        <span data-testid="progress-value">{value}%</span>
        <span data-testid="progress-label">{label}</span>
      </div>
    ),
  ),
}));

// Mock ProgressRing component
vi.mock("@/components/ui/ProgressRing", () => ({
  ProgressRing: vi.fn(({ value, size, strokeWidth, label }) => (
    <div
      data-testid="progress-ring"
      data-value={value}
      data-size={size}
      data-stroke-width={strokeWidth}
      data-label={label}
    >
      <span data-testid="progress-value">{value}%</span>
      <span data-testid="progress-label">{label}</span>
    </div>
  )),
}));

describe("QuickActions", () => {
  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("渲染三个 ProgressRing 组件", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );
      const progressRings = screen.getAllByTestId("progress-ring");
      expect(progressRings).toHaveLength(3);
    });

    it("渲染三个 Card 组件", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );
      const cards = screen.getAllByTestId("card");
      expect(cards).toHaveLength(3);
    });
  });

  describe("Props 传递", () => {
    it("传递 productivityScore 给效率评分", () => {
      render(
        <QuickActions
          productivityScore={85}
          todayProgress={60}
          streakProgress={90}
        />,
      );

      const progressRings = screen.getAllByTestId("progress-ring");
      const efficiencyRing = progressRings[0];

      expect(efficiencyRing).toHaveAttribute("data-value", "85");
      expect(efficiencyRing).toHaveAttribute("data-label", "效率");
    });

    it("传递 todayProgress 给今日进度", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={75}
          streakProgress={90}
        />,
      );

      const progressRings = screen.getAllByTestId("progress-ring");
      const todayRing = progressRings[1];

      expect(todayRing).toHaveAttribute("data-value", "75");
      expect(todayRing).toHaveAttribute("data-label", "完成");
    });

    it("传递 streakProgress 给30天连续", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={95}
        />,
      );

      const progressRings = screen.getAllByTestId("progress-ring");
      const streakRing = progressRings[2];

      expect(streakRing).toHaveAttribute("data-value", "95");
      expect(streakRing).toHaveAttribute("data-label", "连续");
    });

    it("使用默认的 size 和 strokeWidth", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );

      const progressRings = screen.getAllByTestId("progress-ring");
      progressRings.forEach((ring) => {
        expect(ring).toHaveAttribute("data-size", "100");
        expect(ring).toHaveAttribute("data-stroke-width", "8");
      });
    });
  });

  describe("标签文本", () => {
    it("显示效率评分标签", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );

      const labels = screen.getAllByTestId("progress-label");
      expect(labels[0]).toHaveTextContent("效率");
    });

    it("显示完成标签", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );

      const labels = screen.getAllByTestId("progress-label");
      expect(labels[1]).toHaveTextContent("完成");
    });

    it("显示连续标签", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );

      const labels = screen.getAllByTestId("progress-label");
      expect(labels[2]).toHaveTextContent("连续");
    });

    it("显示下方说明文本", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );

      expect(screen.getByText("效率评分")).toBeInTheDocument();
      expect(screen.getByText("今日进度")).toBeInTheDocument();
      expect(screen.getByText("30天连续")).toBeInTheDocument();
    });
  });

  describe("边界值测试", () => {
    it("处理0值", () => {
      render(
        <QuickActions
          productivityScore={0}
          todayProgress={0}
          streakProgress={0}
        />,
      );

      const progressRings = screen.getAllByTestId("progress-ring");
      expect(progressRings[0]).toHaveAttribute("data-value", "0");
      expect(progressRings[1]).toHaveAttribute("data-value", "0");
      expect(progressRings[2]).toHaveAttribute("data-value", "0");
    });

    it("处理100值", () => {
      render(
        <QuickActions
          productivityScore={100}
          todayProgress={100}
          streakProgress={100}
        />,
      );

      const progressRings = screen.getAllByTestId("progress-ring");
      expect(progressRings[0]).toHaveAttribute("data-value", "100");
      expect(progressRings[1]).toHaveAttribute("data-value", "100");
      expect(progressRings[2]).toHaveAttribute("data-value", "100");
    });

    it("处理负数（虽然不应该出现）", () => {
      render(
        <QuickActions
          productivityScore={-10}
          todayProgress={-5}
          streakProgress={0}
        />,
      );

      const progressRings = screen.getAllByTestId("progress-ring");
      expect(progressRings[0]).toHaveAttribute("data-value", "-10");
      expect(progressRings[1]).toHaveAttribute("data-value", "-5");
    });
  });

  describe("布局测试", () => {
    it("使用 grid 布局", () => {
      const { container } = render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );

      const grid = container.firstChild;
      expect(grid).toHaveClass("grid");
      expect(grid).toHaveClass("grid-cols-3");
    });

    it("Card 有正确的 className", () => {
      render(
        <QuickActions
          productivityScore={80}
          todayProgress={60}
          streakProgress={90}
        />,
      );

      const cards = screen.getAllByTestId("card");
      cards.forEach((card) => {
        expect(card).toHaveClass("flex");
        expect(card).toHaveClass("flex-col");
        expect(card).toHaveClass("items-center");
        expect(card).toHaveClass("justify-center");
        expect(card).toHaveClass("py-6");
      });
    });
  });
});
