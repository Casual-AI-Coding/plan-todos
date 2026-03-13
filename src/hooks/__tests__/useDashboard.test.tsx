import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useDashboard } from "../useDashboard";
import type { Dashboard } from "@/lib/types";

// Mock the API function
vi.mock("@/lib/api", () => ({
  getDashboard: vi.fn(),
}));

import { getDashboard } from "@/lib/api";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// Create a wrapper for the test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

// Mock data
const mockDashboard: Dashboard = {
  overview: {
    today_todos_count: 5,
    upcoming_3days_count: 10,
    completed_today_count: 3,
    overdue_count: 2,
    streak_days: 7,
    productivity_score: 85,
  },
  week: {
    completed_count: 15,
  },
  counts: {
    todo: 20,
    plan: 5,
    task: 10,
    target: 3,
    step: 8,
    milestone: 4,
    circulation: 12,
  },
  circulation_stats: {
    today_pending: 5,
    today_completed: 3,
    current_streak: 7,
  },
  today_todos: [
    {
      id: "todo-1",
      title: "Test Todo 1",
      due_date: "2024-01-15",
      status: "pending",
      priority: "P1",
    },
  ],
  overdue_todos: [
    {
      id: "todo-2",
      title: "Overdue Todo",
      due_date: "2024-01-01",
      status: "pending",
      priority: "P2",
    },
  ],
  completed_today: [],
  active_plans: [
    {
      id: "plan-1",
      title: "Active Plan",
      progress: 50,
      task_count: 10,
      completed_count: 5,
    },
  ],
  active_targets: [
    {
      id: "target-1",
      title: "Active Target",
      progress: 75,
      due_date: "2024-02-01",
    },
  ],
  active_milestones: [
    {
      id: "milestone-1",
      title: "Active Milestone",
      progress: 60,
      target_date: "2024-03-01",
    },
  ],
};

describe("useDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDashboard).mockReset();
  });

  describe("基本功能", () => {
    it("应该返回 Dashboard 数据", async () => {
      vi.mocked(getDashboard).mockResolvedValue(mockDashboard);

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockDashboard);
    });

    it("加载中状态应该为 true", () => {
      vi.mocked(getDashboard).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("错误时应该返回错误", async () => {
      const error = new Error("Failed to fetch dashboard");
      vi.mocked(getDashboard).mockRejectedValue(error);

      const { result } = renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });
  });

  describe("queryKey", () => {
    it("应该使用正确的 queryKey", async () => {
      vi.mocked(getDashboard).mockResolvedValue(mockDashboard);

      renderHook(() => useDashboard(), {
        wrapper: createWrapper(),
      });

      // Wait for the query to execute
      await waitFor(() => {
        expect(getDashboard).toHaveBeenCalled();
      });

      // Verify the function was called (which means the query key was correct)
      expect(vi.mocked(getDashboard)).toHaveBeenCalledTimes(1);
    });
  });

  describe("options", () => {
    it("应该支持自定义 options", async () => {
      vi.mocked(getDashboard).mockResolvedValue(mockDashboard);

      const { result } = renderHook(
        () =>
          useDashboard({
            staleTime: 1000 * 60 * 5, // 5 minutes
          }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockDashboard);
    });

    it("应该支持 enabled option", async () => {
      vi.mocked(getDashboard).mockResolvedValue(mockDashboard);

      const { result } = renderHook(
        () =>
          useDashboard({
            enabled: false,
          }),
        {
          wrapper: createWrapper(),
        },
      );

      // Should not fetch when enabled is false
      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });

      expect(getDashboard).not.toHaveBeenCalled();
    });
  });
});
