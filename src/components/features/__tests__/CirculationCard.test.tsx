import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CirculationCard } from "../CirculationCard";
import type { Circulation } from "@/lib/types";

// Mock dnd-kit hooks
vi.mock("@dnd-kit/sortable", () => ({
  useSortable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  })),
  SortableContext: vi.fn(({ children }) => children),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: {
    Transform: {
      toString: vi.fn(() => ""),
    },
  },
}));

// Mock Button component
vi.mock("@/components/ui/Button", () => ({
  Button: vi.fn(({ children, onClick, variant, size, className, ...props }) => (
    <button
      data-testid="button"
      data-variant={variant}
      data-size={size}
      onClick={onClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  )),
}));

const mockCirculation: Circulation = {
  id: "cir-1",
  title: "每日运动",
  content: null,
  circulation_type: "periodic",
  frequency: "daily",
  frequency_config: null,
  target_count: null,
  current_count: 0,
  streak_count: 5,
  best_streak: 10,
  last_completed_at: "2024-01-15T10:00:00Z",
  status: "active",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T10:00:00Z",
};

const mockTodayStats: Record<string, { count: number; progress: number }> = {};

describe("CirculationCard", () => {
  const mockOnCheckin = vi.fn();
  const mockOnUndo = vi.fn();
  const mockOnViewDetail = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("渲染测试", () => {
    it("组件正确渲染", () => {
      const { container } = render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it("显示标题", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("每日运动")).toBeInTheDocument();
    });

    it("显示周期打卡图标", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("🔄")).toBeInTheDocument();
    });
  });

  describe("周期打卡状态", () => {
    it("未完成时显示待打卡状态", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("○ 待打卡")).toBeInTheDocument();
    });

    it("已完成时显示已完成状态", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={true}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("✓ 已完成")).toBeInTheDocument();
    });

    it("显示连续天数", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("5")).toBeInTheDocument(); // streak_count
      expect(screen.getByText("连续天数")).toBeInTheDocument();
    });

    it("显示最佳记录", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("10")).toBeInTheDocument(); // best_streak
      expect(screen.getByText("最佳记录")).toBeInTheDocument();
    });
  });

  describe("计数打卡", () => {
    const countCirculation: Circulation = {
      ...mockCirculation,
      circulation_type: "count",
      target_count: 10,
      current_count: 3,
    };

    it("显示计数打卡图标", () => {
      render(
        <CirculationCard
          circulation={countCirculation}
          todayStats={{ "cir-1": { count: 5, progress: 10 } }}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("📊")).toBeInTheDocument();
    });

    it("显示今日次数", () => {
      render(
        <CirculationCard
          circulation={countCirculation}
          todayStats={{ "cir-1": { count: 5, progress: 10 } }}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("今日次数")).toBeInTheDocument();
    });

    it("显示今日进度", () => {
      render(
        <CirculationCard
          circulation={countCirculation}
          todayStats={{ "cir-1": { count: 5, progress: 10 } }}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("+10")).toBeInTheDocument();
      expect(screen.getByText("今日进度")).toBeInTheDocument();
    });

    it("显示总进度条", () => {
      render(
        <CirculationCard
          circulation={countCirculation}
          todayStats={{ "cir-1": { count: 5, progress: 10 } }}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );
      expect(screen.getByText("总进度")).toBeInTheDocument();
      expect(screen.getByText("3 / 10")).toBeInTheDocument();
    });
  });

  describe("交互行为", () => {
    it("点击标题调用 onViewDetail", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      const title = screen.getByText("每日运动");
      fireEvent.click(title);

      expect(mockOnViewDetail).toHaveBeenCalledTimes(1);
    });

    it("未完成时显示打卡按钮", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      const checkinButton = screen.getByText("立即打卡");
      expect(checkinButton).toBeInTheDocument();
    });

    it("已完成时显示撤销按钮", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={true}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      expect(screen.getByText("撤销打卡")).toBeInTheDocument();
    });

    it("点击打卡按钮调用 onCheckin", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      const checkinButton = screen.getByText("立即打卡");
      fireEvent.click(checkinButton);

      expect(mockOnCheckin).toHaveBeenCalledTimes(1);
    });

    it("点击撤销按钮调用 onUndo", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={true}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      const undoButton = screen.getByText("撤销打卡");
      fireEvent.click(undoButton);

      expect(mockOnUndo).toHaveBeenCalledTimes(1);
    });

    it("计数打卡显示打卡+1按钮", () => {
      const countCirculation: Circulation = {
        ...mockCirculation,
        circulation_type: "count",
      };

      render(
        <CirculationCard
          circulation={countCirculation}
          todayStats={{ "cir-1": { count: 5, progress: 10 } }}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      expect(screen.getByText("打卡 +1")).toBeInTheDocument();
    });

    it("点击详情按钮调用 onViewDetail", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      const detailButton = screen.getByText("详情");
      fireEvent.click(detailButton);

      expect(mockOnViewDetail).toHaveBeenCalledTimes(1);
    });
  });

  describe("空状态/默认值", () => {
    it("无今日数据时显示0", () => {
      const countCirculation: Circulation = {
        ...mockCirculation,
        circulation_type: "count",
      };

      render(
        <CirculationCard
          circulation={countCirculation}
          todayStats={{}}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      expect(screen.getByText("0")).toBeInTheDocument(); // 今日次数
      expect(screen.getByText("+0")).toBeInTheDocument(); // 今日进度
    });

    it("无上次打卡时间时不显示上次打卡区域", () => {
      const circulationNoLastComplete: Circulation = {
        ...mockCirculation,
        last_completed_at: null,
      };

      render(
        <CirculationCard
          circulation={circulationNoLastComplete}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      expect(screen.queryByText("上次打卡")).not.toBeInTheDocument();
    });

    it("有上次打卡时间时显示", () => {
      render(
        <CirculationCard
          circulation={mockCirculation}
          todayStats={mockTodayStats}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      expect(screen.getByText("上次打卡")).toBeInTheDocument();
    });
  });

  describe("无目标计数时", () => {
    it("无 target_count 时不显示总进度", () => {
      const circulationNoTarget: Circulation = {
        ...mockCirculation,
        circulation_type: "count",
        target_count: null,
        current_count: 5,
      };

      render(
        <CirculationCard
          circulation={circulationNoTarget}
          todayStats={{ "cir-1": { count: 3, progress: 5 } }}
          isCompletedToday={false}
          onCheckin={mockOnCheckin}
          onUndo={mockOnUndo}
          onViewDetail={mockOnViewDetail}
        />,
      );

      expect(screen.queryByText("总进度")).not.toBeInTheDocument();
    });
  });
});
