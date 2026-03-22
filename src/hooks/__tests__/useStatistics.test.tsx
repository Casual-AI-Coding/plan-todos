import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useStatistics } from "../useStatistics";
import type { Todo, Plan, Target, Milestone, Circulation } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getTodos: vi.fn(),
  getPlans: vi.fn(),
  getTargets: vi.fn(),
  getMilestones: vi.fn(),
  getCirculations: vi.fn(),
}));

import {
  getTodos,
  getPlans,
  getTargets,
  getMilestones,
  getCirculations,
} from "@/lib/api";

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
const mockTodos: Todo[] = [
  {
    id: "todo-1",
    title: "Test Todo 1",
    content: "Content 1",
    due_date: "2024-01-15",
    status: "pending",
    priority: "P1",
    sort_order: 0,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockPlans: Plan[] = [
  {
    id: "plan-1",
    title: "Test Plan 1",
    description: "Description 1",
    status: "active",
    sort_order: 0,
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockTargets: Target[] = [
  {
    id: "target-1",
    title: "Test Target 1",
    description: "Description 1",
    status: "active",
    sort_order: 0,
    due_date: "2024-06-01",
    progress: 50,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockMilestones: Milestone[] = [
  {
    id: "milestone-1",
    title: "Test Milestone 1",
    target_date: "2024-06-01",
    biz_type: null,
    biz_id: null,
    status: "pending",
    progress: 0,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockCirculations: Circulation[] = [
  {
    id: "circulation-1",
    title: "Test Circulation 1",
    content: "Description 1",
    circulation_type: "periodic",
    frequency: "daily",
    frequency_config: null,
    target_count: null,
    current_count: 0,
    streak_count: 0,
    best_streak: 0,
    last_completed_at: null,
    status: "active",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

describe("useStatistics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getTodos).mockReset();
    vi.mocked(getPlans).mockReset();
    vi.mocked(getTargets).mockReset();
    vi.mocked(getMilestones).mockReset();
    vi.mocked(getCirculations).mockReset();
  });

  describe("基本功能", () => {
    it("应该并行获取所有统计数据", async () => {
      vi.mocked(getTodos).mockResolvedValue(mockTodos);
      vi.mocked(getPlans).mockResolvedValue(mockPlans);
      vi.mocked(getTargets).mockResolvedValue(mockTargets);
      vi.mocked(getMilestones).mockResolvedValue(mockMilestones);
      vi.mocked(getCirculations).mockResolvedValue(mockCirculations);

      const { result } = renderHook(() => useStatistics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        todos: mockTodos,
        plans: mockPlans,
        targets: mockTargets,
        milestones: mockMilestones,
        circulations: mockCirculations,
      });

      // Verify all APIs were called
      expect(getTodos).toHaveBeenCalled();
      expect(getPlans).toHaveBeenCalled();
      expect(getTargets).toHaveBeenCalled();
      expect(getMilestones).toHaveBeenCalled();
      expect(getCirculations).toHaveBeenCalled();
    });

    it("应该并行调用所有 API", async () => {
      vi.mocked(getTodos).mockResolvedValue(mockTodos);
      vi.mocked(getPlans).mockResolvedValue(mockPlans);
      vi.mocked(getTargets).mockResolvedValue(mockTargets);
      vi.mocked(getMilestones).mockResolvedValue(mockMilestones);
      vi.mocked(getCirculations).mockResolvedValue(mockCirculations);

      renderHook(() => useStatistics(), {
        wrapper: createWrapper(),
      });

      // Wait for all promises to resolve
      await waitFor(() => {
        expect(getTodos).toHaveBeenCalled();
      });

      // All should be called
      expect(getTodos).toHaveBeenCalled();
      expect(getPlans).toHaveBeenCalled();
      expect(getTargets).toHaveBeenCalled();
      expect(getMilestones).toHaveBeenCalled();
      expect(getCirculations).toHaveBeenCalled();
    });

    it("加载中状态应该为 true", () => {
      vi.mocked(getTodos).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );
      vi.mocked(getPlans).mockImplementation(() => new Promise(() => {}));
      vi.mocked(getTargets).mockImplementation(() => new Promise(() => {}));
      vi.mocked(getMilestones).mockImplementation(() => new Promise(() => {}));
      vi.mocked(getCirculations).mockImplementation(
        () => new Promise(() => {}),
      );

      const { result } = renderHook(() => useStatistics(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("任何一个 API 错误时应该返回错误", async () => {
      vi.mocked(getTodos).mockRejectedValue(new Error("Failed to fetch todos"));
      vi.mocked(getPlans).mockResolvedValue(mockPlans);
      vi.mocked(getTargets).mockResolvedValue(mockTargets);
      vi.mocked(getMilestones).mockResolvedValue(mockMilestones);
      vi.mocked(getCirculations).mockResolvedValue(mockCirculations);

      const { result } = renderHook(() => useStatistics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  describe("空数据", () => {
    it("所有 API 返回空数组时应该正常工作", async () => {
      vi.mocked(getTodos).mockResolvedValue([]);
      vi.mocked(getPlans).mockResolvedValue([]);
      vi.mocked(getTargets).mockResolvedValue([]);
      vi.mocked(getMilestones).mockResolvedValue([]);
      vi.mocked(getCirculations).mockResolvedValue([]);

      const { result } = renderHook(() => useStatistics(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        todos: [],
        plans: [],
        targets: [],
        milestones: [],
        circulations: [],
      });
    });
  });

  describe("options", () => {
    it("应该支持自定义 options", async () => {
      vi.mocked(getTodos).mockResolvedValue(mockTodos);
      vi.mocked(getPlans).mockResolvedValue(mockPlans);
      vi.mocked(getTargets).mockResolvedValue(mockTargets);
      vi.mocked(getMilestones).mockResolvedValue(mockMilestones);
      vi.mocked(getCirculations).mockResolvedValue(mockCirculations);

      const { result } = renderHook(
        () =>
          useStatistics({
            staleTime: 1000 * 60 * 5, // 5 minutes
          }),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toBeDefined();
    });

    it("应该支持 enabled option", async () => {
      vi.mocked(getTodos).mockResolvedValue(mockTodos);
      vi.mocked(getPlans).mockResolvedValue(mockPlans);
      vi.mocked(getTargets).mockResolvedValue(mockTargets);
      vi.mocked(getMilestones).mockResolvedValue(mockMilestones);
      vi.mocked(getCirculations).mockResolvedValue(mockCirculations);

      const { result } = renderHook(
        () =>
          useStatistics({
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

      expect(getTodos).not.toHaveBeenCalled();
    });
  });
});
