/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ViewsView } from "@/app/views/ViewsView";

vi.mock("@/domain/todo/todoQueries", () => ({
  useTodos: vi.fn(),
}));

vi.mock("@/domain/plan/planQueries", () => ({
  usePlans: vi.fn(),
}));

vi.mock("@/domain/target/targetQueries", () => ({
  useTargets: vi.fn(),
  targetKeys: {
    targetSteps: (id: string) => ["targetSteps", id],
  },
}));

vi.mock("@/domain/milestone/milestoneQueries", () => ({
  useMilestones: vi.fn(),
}));

vi.mock("@/hooks/useTasks", () => ({
  useTasks: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  getSteps: vi.fn(),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueries: vi.fn(() => []),
}));

vi.mock("@/stores/navigation", () => ({
  useNavigationStore: vi.fn(() => ({
    navigate: vi.fn(),
  })),
}));

import { useTodos } from "@/domain/todo/todoQueries";
import { usePlans } from "@/domain/plan/planQueries";
import { useTargets } from "@/domain/target/targetQueries";
import { useMilestones } from "@/domain/milestone/milestoneQueries";
import { useTasks } from "@/hooks/useTasks";
import { useNavigationStore } from "@/stores/navigation";

describe("ViewsView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTodos = [
    {
      id: "todo-1",
      title: "Test Todo",
      status: "pending" as const,
      priority: "P1" as const,
      due_date: "2026-03-14",
      created_at: "2026-01-01",
      updated_at: "2026-03-14",
    },
  ];

  const mockPlans = [
    {
      id: "plan-1",
      title: "Test Plan",
      status: "active" as const,
      progress: 50,
      task_count: 10,
      completed_count: 5,
    },
  ];

  const mockTargets = [
    {
      id: "target-1",
      title: "Test Target",
      status: "active" as const,
      progress: 75,
      due_date: "2026-12-31",
    },
  ];

  const mockTasks = [
    {
      id: "task-1",
      title: "Test Task",
      status: "pending" as const,
      plan_id: "plan-1",
    },
  ];

  const mockMilestones = [
    {
      id: "milestone-1",
      title: "Test Milestone",
      status: "pending" as const,
      progress: 60,
      target_date: "2026-06-30",
    },
  ];

  function setupMocks(options: { loading?: boolean } = {}) {
    const { loading = false } = options;
    vi.mocked(useTodos).mockReturnValue({
      data: loading ? undefined : mockTodos,
      isLoading: loading,
    } as any);
    vi.mocked(usePlans).mockReturnValue({
      data: loading ? undefined : mockPlans,
      isLoading: loading,
    } as any);
    vi.mocked(useTargets).mockReturnValue({
      data: loading ? undefined : mockTargets,
      isLoading: loading,
    } as any);
    vi.mocked(useMilestones).mockReturnValue({
      data: loading ? undefined : mockMilestones,
      isLoading: loading,
    } as any);
    vi.mocked(useTasks).mockReturnValue({
      data: loading ? undefined : mockTasks,
      isLoading: loading,
    } as any);
  }

  it("renders views view with header", () => {
    setupMocks();
    render(<ViewsView />);
    expect(screen.getByText("视图查看")).toBeInTheDocument();
  });

  it("renders view mode buttons", () => {
    setupMocks();
    render(<ViewsView />);
    expect(screen.getByText("列表")).toBeInTheDocument();
    expect(screen.getByText("看板")).toBeInTheDocument();
    expect(screen.getByText("日历")).toBeInTheDocument();
    expect(screen.getByText("甘特图")).toBeInTheDocument();
  });

  it("renders list view by default with entity data", () => {
    setupMocks();
    render(<ViewsView />);
    expect(screen.getByText("Test Todo")).toBeInTheDocument();
    expect(screen.getByText("Test Plan")).toBeInTheDocument();
    expect(screen.getByText("Test Target")).toBeInTheDocument();
    expect(screen.getByText("Test Milestone")).toBeInTheDocument();
  });

  it("displays filter controls", () => {
    setupMocks();
    render(<ViewsView />);
    expect(screen.getByText("全选")).toBeInTheDocument();
    expect(screen.getByText("取反")).toBeInTheDocument();
  });

  it("switches to board view when clicking board button", () => {
    setupMocks();
    render(<ViewsView />);
    fireEvent.click(screen.getByText("看板"));
    expect(screen.getByText("待处理")).toBeInTheDocument();
    expect(screen.getByText("进行中")).toBeInTheDocument();
    expect(screen.getByText("已完成")).toBeInTheDocument();
  });

  it("switches to calendar view when clicking calendar button", () => {
    setupMocks();
    render(<ViewsView />);
    fireEvent.click(screen.getByText("日历"));
    expect(screen.getByText("日")).toBeInTheDocument();
    expect(screen.getByText("一")).toBeInTheDocument();
  });

  it("switches to gantt view when clicking gantt button", () => {
    setupMocks();
    render(<ViewsView />);
    fireEvent.click(screen.getByText("甘特图"));
    expect(screen.getByText("Test Todo")).toBeInTheDocument();
  });

  it("uses navigation store", () => {
    setupMocks();
    render(<ViewsView />);
    expect(useNavigationStore).toHaveBeenCalled();
  });
});
