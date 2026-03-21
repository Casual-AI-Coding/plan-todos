/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { StatisticsView } from "@/app/views/StatisticsView";

vi.mock("@/hooks/useStatistics", () => ({
  useStatistics: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getTodos: vi.fn(),
  getPlans: vi.fn(),
  getTargets: vi.fn(),
  getMilestones: vi.fn(),
  getCirculations: vi.fn(),
}));

import { useStatistics } from "@/hooks/useStatistics";

describe("StatisticsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockData = {
    todos: [
      {
        id: "todo-1",
        title: "Test Todo",
        status: "done" as const,
        priority: "P1" as const,
        due_date: "2026-03-14",
        created_at: "2026-01-01",
        updated_at: "2026-03-14",
      },
      {
        id: "todo-2",
        title: "Test Todo 2",
        status: "pending" as const,
        priority: "P2" as const,
        due_date: "2026-03-15",
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ],
    plans: [
      {
        id: "plan-1",
        title: "Test Plan",
        status: "active" as const,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ],
    targets: [
      {
        id: "target-1",
        title: "Test Target",
        status: "active" as const,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ],
    milestones: [
      {
        id: "milestone-1",
        title: "Test Milestone",
        status: "active" as const,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ],
    circulations: [
      {
        id: "circulation-1",
        title: "Test Circulation",
        status: "active" as const,
        streak_count: 10,
        created_at: "2026-01-01",
        updated_at: "2026-01-01",
      },
    ],
  };

  it("renders loading state", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("加载中...")).toBeInTheDocument();
  });

  it("renders error state", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to load"),
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText(/加载失败/)).toBeInTheDocument();
  });

  it("renders statistics with data", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("数据统计")).toBeInTheDocument();
  });

  it("displays total todos count", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("总待办")).toBeInTheDocument();
  });

  it("displays completed todos count", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getAllByText("已完成").length).toBeGreaterThan(0);
  });

  it("displays active plans count", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("进行中计划")).toBeInTheDocument();
  });

  it("displays active targets count", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("进行中目标")).toBeInTheDocument();
  });

  it("displays plan statistics", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("计划统计")).toBeInTheDocument();
    expect(screen.getByText("总计划数")).toBeInTheDocument();
  });

  it("displays target statistics", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("目标统计")).toBeInTheDocument();
    expect(screen.getByText("总目标数")).toBeInTheDocument();
  });

  it("displays circulation statistics", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("打卡统计")).toBeInTheDocument();
  });

  it("displays completion rate progress bar", () => {
    vi.mocked(useStatistics).mockReturnValue({
      data: mockData,
      isLoading: false,
      error: null,
    } as any);

    render(<StatisticsView />);
    expect(screen.getByText("待办完成率")).toBeInTheDocument();
  });
});
