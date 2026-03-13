import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  usePlans,
  usePlan,
  usePlanTags,
  usePlanTasks,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
  planKeys,
} from "@/hooks/usePlans";
import type { Plan, Task, Tag } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getPlans: vi.fn(),
  getTasksByPlan: vi.fn(),
  getEntityTags: vi.fn(),
  setEntityTags: vi.fn(),
  createPlan: vi.fn(),
  updatePlan: vi.fn(),
  deletePlan: vi.fn(),
}));

import {
  getPlans,
  getTasksByPlan,
  getEntityTags,
  setEntityTags,
  createPlan,
  updatePlan,
  deletePlan,
} from "@/lib/api";

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
const mockPlans: Plan[] = [
  {
    id: "plan-1",
    title: "Test Plan 1",
    description: "Description 1",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    status: "active",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "plan-2",
    title: "Test Plan 2",
    description: "Description 2",
    start_date: "2024-02-01",
    end_date: "2024-06-30",
    status: "completed",
    created_at: "2024-01-01",
    updated_at: "2024-02-01",
  },
];

const mockTasks: Task[] = [
  {
    id: "task-1",
    plan_id: "plan-1",
    title: "Task 1",
    description: "Task description 1",
    start_date: "2024-01-01",
    end_date: "2024-01-31",
    status: "pending",
    priority: "P1",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockTags: Tag[] = [
  {
    id: "tag-1",
    name: "Tag 1",
    color: "#FF0000",
    description: "Tag description 1",
    created_at: "2024-01-01",
  },
];

describe("usePlans", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("usePlans (get all plans)", () => {
    it("should return plans on successful fetch", async () => {
      vi.mocked(getPlans).mockResolvedValue(mockPlans);

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPlans);
      expect(getPlans).toHaveBeenCalled();
    });

    it("should handle error when fetch fails", async () => {
      vi.mocked(getPlans).mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("should show loading state initially", () => {
      vi.mocked(getPlans).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => usePlans(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("usePlan (get single plan)", () => {
    it("should return plan by id", async () => {
      vi.mocked(getPlans).mockResolvedValue(mockPlans);

      const { result } = renderHook(() => usePlan("plan-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPlans[0]);
    });

    it("should throw error when plan not found", async () => {
      vi.mocked(getPlans).mockResolvedValue([]);

      const { result } = renderHook(() => usePlan("non-existent"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => usePlan(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(getPlans).not.toHaveBeenCalled();
    });
  });

  describe("usePlanTags (get plan tags)", () => {
    it("should return tags for a plan", async () => {
      vi.mocked(getEntityTags).mockResolvedValue(mockTags);

      const { result } = renderHook(() => usePlanTags("plan-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTags);
      expect(getEntityTags).toHaveBeenCalledWith("plan", "plan-1");
    });

    it("should not fetch when planId is empty", () => {
      const { result } = renderHook(() => usePlanTags(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("usePlanTasks (get plan tasks)", () => {
    it("should return tasks for a plan", async () => {
      vi.mocked(getTasksByPlan).mockResolvedValue(mockTasks);

      const { result } = renderHook(() => usePlanTasks("plan-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTasks);
      expect(getTasksByPlan).toHaveBeenCalledWith("plan-1");
    });

    it("should not fetch when planId is empty", () => {
      const { result } = renderHook(() => usePlanTasks(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useCreatePlan (create plan)", () => {
    it("should create plan successfully", async () => {
      const newPlan: Plan = {
        id: "new-plan",
        title: "New Plan",
        description: "New Description",
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        status: "active",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createPlan).mockResolvedValue(newPlan);
      vi.mocked(setEntityTags).mockResolvedValue(undefined);
      vi.mocked(getPlans).mockResolvedValue([...mockPlans, newPlan]);

      const { result } = renderHook(() => useCreatePlan(), {
        wrapper: createWrapper(),
      });

      let createdPlan: Plan | undefined;
      await act(async () => {
        createdPlan = await result.current.mutateAsync({
          title: "New Plan",
          description: "New Description",
        });
      });

      expect(createdPlan).toEqual(newPlan);
      expect(createPlan).toHaveBeenCalled();
    });

    it("should create plan with tags", async () => {
      const newPlan: Plan = {
        id: "new-plan",
        title: "New Plan",
        description: null,
        start_date: null,
        end_date: null,
        status: "active",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createPlan).mockResolvedValue(newPlan);
      vi.mocked(setEntityTags).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreatePlan(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          title: "New Plan",
          tagIds: ["tag-1"],
        });
      });

      expect(createPlan).toHaveBeenCalled();
      expect(setEntityTags).toHaveBeenCalledWith("plan", "new-plan", ["tag-1"]);
    });

    it("should handle create error", async () => {
      vi.mocked(createPlan).mockRejectedValue(new Error("Failed to create"));

      const { result } = renderHook(() => useCreatePlan(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ title: "New Plan" });
        }),
      ).rejects.toThrow("Failed to create");
    });
  });

  describe("useUpdatePlan (update plan)", () => {
    it("should update plan successfully", async () => {
      const updatedPlan = { ...mockPlans[0], title: "Updated Title" };
      vi.mocked(updatePlan).mockResolvedValue(updatedPlan);

      const { result } = renderHook(() => useUpdatePlan(), {
        wrapper: createWrapper(),
      });

      let updated: Plan | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "plan-1",
          title: "Updated Title",
        });
      });

      expect(updated?.title).toBe("Updated Title");
      expect(updatePlan).toHaveBeenCalled();
    });

    it("should update plan with tags", async () => {
      const updatedPlan = { ...mockPlans[0], title: "Test Plan 1" };
      vi.mocked(updatePlan).mockResolvedValue(updatedPlan);
      vi.mocked(setEntityTags).mockResolvedValue(undefined);

      const { result } = renderHook(() => useUpdatePlan(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "plan-1",
          title: "Test Plan 1",
          tagIds: ["tag-1"],
        });
      });

      expect(updatePlan).toHaveBeenCalled();
      expect(setEntityTags).toHaveBeenCalledWith("plan", "plan-1", ["tag-1"]);
    });

    it("should handle update error", async () => {
      vi.mocked(updatePlan).mockRejectedValue(new Error("Failed to update"));

      const { result } = renderHook(() => useUpdatePlan(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: "plan-1", title: "Updated" });
        }),
      ).rejects.toThrow("Failed to update");
    });
  });

  describe("useDeletePlan (delete plan)", () => {
    it("should delete plan successfully", async () => {
      vi.mocked(deletePlan).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeletePlan(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("plan-1");
      });

      expect(deletePlan).toHaveBeenCalled();
    });

    it("should handle delete error", async () => {
      vi.mocked(deletePlan).mockRejectedValue(new Error("Failed to delete"));

      const { result } = renderHook(() => useDeletePlan(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("plan-1");
        }),
      ).rejects.toThrow("Failed to delete");
    });
  });

  describe("planKeys", () => {
    it("should have correct query keys", () => {
      expect(planKeys.plans).toEqual(["plans"]);
      expect(planKeys.plan("plan-1")).toEqual(["plans", "plan-1"]);
      expect(planKeys.planTags("plan-1")).toEqual(["plans", "plan-1", "tags"]);
      expect(planKeys.planTasks("plan-1")).toEqual([
        "plans",
        "plan-1",
        "tasks",
      ]);
    });
  });
});
