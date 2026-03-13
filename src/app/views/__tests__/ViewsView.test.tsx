import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ViewsView } from "@/app/views/ViewsView";

vi.mock("@/hooks/useTodos", () => ({
  useTodos: vi.fn(),
}));

vi.mock("@/hooks/usePlans", () => ({
  usePlans: vi.fn(),
}));

vi.mock("@/hooks/useTargets", () => ({
  useTargets: vi.fn(),
}));

vi.mock("@/hooks/useMilestones", () => ({
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
    const { useTodos } = require("@/hooks/useTodos");
    vi.mocked(useTodos).mockReturnValue({
      data: mockTodos,
      isLoading: false,
    } as any);

    const { usePlans } = require("@/hooks/usePlans");
    vi.mocked(usePlans).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { useTargets } = require("@/hooks/useTargets");
    vi.mocked(useTargets).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { useMilestones } = require("@/hooks/useMilestones");
    vi.mocked(useMilestones).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    const { useTasks } = require("@/hooks/useTasks");
    vi.mocked(useTasks).mockReturnValue({
      data: [],
      isLoading: false,
    } as any);

    render(<ViewsView />);
    // The ViewsView may render different views based on state
    expect(screen.getByText("视图")).toBeInTheDocument();
  });
});
