import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Dashboard } from "@/app/views/Dashboard";

vi.mock("@/hooks/useDashboard", () => ({
  useDashboard: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getDashboard: vi.fn(),
}));

import { useDashboard } from "@/hooks/useDashboard";
import type { Dashboard as DashboardType, Priority } from "@/lib/types";

describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDashboard: DashboardType = {
    overview: {
      today_todos_count: 5,
      upcoming_3days_count: 3,
      completed_today_count: 2,
      overdue_count: 1,
      streak_days: 7,
      productivity_score: 75,
    },
    week: {
      completed_count: 12,
    },
    counts: {
      todo: 10,
      plan: 3,
      task: 15,
      target: 5,
      step: 20,
      milestone: 2,
      circulation: 4,
    },
    today_todos: [
      {
        id: "todo-1",
        title: "Test Todo 1",
        status: "pending",
        priority: "P2" as Priority,
        due_date: new Date().toISOString().split("T")[0],
      },
      {
        id: "todo-2",
        title: "Test Todo 2",
        status: "done",
        priority: "P1" as Priority,
        due_date: new Date().toISOString().split("T")[0],
      },
    ],
    overdue_todos: [
      {
        id: "overdue-1",
        title: "Overdue Todo",
        status: "pending",
        priority: "P0" as Priority,
        due_date: "2020-01-01",
      },
    ],
    completed_today: [
      {
        id: "completed-1",
        title: "Completed Today",
        status: "done",
        priority: "P3" as Priority,
        due_date: new Date().toISOString().split("T")[0],
      },
    ],
    active_plans: [
      {
        id: "plan-1",
        title: "Test Plan",
        progress: 50,
        task_count: 10,
        completed_count: 5,
      },
    ],
    active_targets: [
      {
        id: "target-1",
        title: "Test Target",
        progress: 75,
        due_date: "2026-12-31",
      },
    ],
    active_milestones: [
      {
        id: "milestone-1",
        title: "Test Milestone",
        progress: 60,
        target_date: "2026-06-30",
      },
    ],
    circulation_stats: {
      today_pending: 2,
      today_completed: 1,
      current_streak: 7,
    },
  };

  it("renders loading state", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load"),
    } as any);

    render(<Dashboard />);
    expect(screen.getByText(/加载失败/)).toBeInTheDocument();
  });

  it("renders dashboard with data", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("今日总览")).toBeInTheDocument();
  });

  it("displays today's todos count", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getAllByText("今日待办").length).toBeGreaterThan(0);
  });

  it("displays upcoming todos count", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("即将到期 (3天内)")).toBeInTheDocument();
  });

  it("displays completed today count", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("今日完成")).toBeInTheDocument();
  });

  it("displays entity counts", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("待办")).toBeInTheDocument();
    expect(screen.getByText("计划")).toBeInTheDocument();
    expect(screen.getByText("任务")).toBeInTheDocument();
    expect(screen.getByText("目标")).toBeInTheDocument();
  });

  it("displays today's todo items", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("Test Todo 1")).toBeInTheDocument();
    expect(screen.getByText("Test Todo 2")).toBeInTheDocument();
  });

  it("displays overdue section when there are overdue todos", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("已过期")).toBeInTheDocument();
    expect(screen.getByText("Overdue Todo")).toBeInTheDocument();
  });

  it("displays active plans section", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("进行中的计划")).toBeInTheDocument();
    expect(screen.getByText("Test Plan")).toBeInTheDocument();
  });

  it("displays active targets section", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("进行中的目标")).toBeInTheDocument();
    expect(screen.getByText("Test Target")).toBeInTheDocument();
  });

  it("displays active milestones section", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("进行中的里程碑")).toBeInTheDocument();
    expect(screen.getByText("Test Milestone")).toBeInTheDocument();
  });

  it("does not display overdue section when no overdue todos", () => {
    const dashboardWithoutOverdue = {
      ...mockDashboard,
      overdue_todos: [],
    };
    vi.mocked(useDashboard).mockReturnValue({
      data: dashboardWithoutOverdue,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.queryByText("已过期")).not.toBeInTheDocument();
  });

  it("does not display milestones section when no active milestones", () => {
    const dashboardWithoutMilestones = {
      ...mockDashboard,
      active_milestones: [],
    };
    vi.mocked(useDashboard).mockReturnValue({
      data: dashboardWithoutMilestones,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.queryByText("进行中的里程碑")).not.toBeInTheDocument();
  });

  it("displays circulation stats when available", () => {
    vi.mocked(useDashboard).mockReturnValue({
      data: mockDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("今日待打卡")).toBeInTheDocument();
    expect(screen.getByText("今日已完成")).toBeInTheDocument();
  });

  it("displays empty states when no data", () => {
    const emptyDashboard: DashboardType = {
      overview: {
        today_todos_count: 0,
        upcoming_3days_count: 0,
        completed_today_count: 0,
        overdue_count: 0,
        streak_days: 0,
        productivity_score: 0,
      },
      week: {
        completed_count: 0,
      },
      counts: {
        todo: 0,
        plan: 0,
        task: 0,
        target: 0,
        step: 0,
        milestone: 0,
        circulation: 0,
      },
      today_todos: [],
      overdue_todos: [],
      completed_today: [],
      active_plans: [],
      active_targets: [],
      active_milestones: [],
      circulation_stats: undefined,
    };
    vi.mocked(useDashboard).mockReturnValue({
      data: emptyDashboard,
      isLoading: false,
      error: null,
    } as any);

    render(<Dashboard />);
    expect(screen.getByText("暂无今日待办")).toBeInTheDocument();
    expect(screen.getByText("暂无进行中的计划")).toBeInTheDocument();
    expect(screen.getByText("暂无进行中的目标")).toBeInTheDocument();
  });
});
