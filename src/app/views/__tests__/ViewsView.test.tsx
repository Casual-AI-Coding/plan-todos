/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ViewsView } from "@/app/views/ViewsView";
import { useTodos } from "@/domain/todo/todoQueries";
import { usePlans } from "@/domain/plan/planQueries";
import { useTargets } from "@/domain/target/targetQueries";
import { useMilestones } from "@/domain/milestone/milestoneQueries";
import { useTasks } from "@/hooks/useTasks";

vi.mock("@/domain/todo/todoQueries", () => ({
  useTodos: vi.fn(),
}));

vi.mock("@/domain/plan/planQueries", () => ({
  usePlans: vi.fn(),
}));

vi.mock("@/domain/target/targetQueries", () => ({
  useTargets: vi.fn(),
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

  it("renders views view", () => {
    vi.mocked(useTodos).mockReturnValue({
      data: mockTodos,
      isLoading: false,
    } as any);

    vi.mocked(usePlans).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(useTargets).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(useMilestones).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    vi.mocked(useTasks).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<ViewsView />);
    // The ViewsView may render different views based on state
    expect(screen.getByText("视图查看")).toBeInTheDocument();
  });
});
