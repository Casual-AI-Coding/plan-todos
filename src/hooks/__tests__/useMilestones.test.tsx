import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useMilestones,
  useMilestone,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  usePlansForMilestone,
  useTargetsForMilestone,
  useCirculationsForMilestone,
  milestoneKeys,
} from "@/hooks/useMilestones";
import type { Milestone, Plan, Target, Circulation } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getMilestones: vi.fn(),
  getPlans: vi.fn(),
  getTargets: vi.fn(),
  getCirculations: vi.fn(),
  createMilestone: vi.fn(),
  updateMilestone: vi.fn(),
  deleteMilestone: vi.fn(),
}));

import {
  getMilestones,
  getPlans,
  getTargets,
  getCirculations,
  createMilestone,
  updateMilestone,
  deleteMilestone,
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
const mockMilestones: Milestone[] = [
  {
    id: "milestone-1",
    title: "Test Milestone 1",
    target_date: "2024-12-31",
    status: "pending",
    biz_type: "plan",
    biz_id: "plan-1",
    progress: 50,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "milestone-2",
    title: "Test Milestone 2",
    target_date: "2024-06-30",
    status: "completed",
    biz_type: "target",
    biz_id: "target-1",
    progress: 100,
    created_at: "2024-01-01",
    updated_at: "2024-02-01",
  },
];

const mockPlans: Plan[] = [
  {
    id: "plan-1",
    title: "Test Plan",
    description: "Description",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    status: "active",
    sort_order: 0,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockTargets: Target[] = [
  {
    id: "target-1",
    title: "Test Target",
    description: "Description",
    due_date: "2024-12-31",
    status: "active",
    progress: 50,
    sort_order: 0,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

const mockCirculations: Circulation[] = [
  {
    id: "circulation-1",
    title: "Test Circulation",
    content: null,
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

describe("useMilestones", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useMilestones (get all milestones)", () => {
    it("should return milestones on successful fetch", async () => {
      vi.mocked(getMilestones).mockResolvedValue(mockMilestones);

      const { result } = renderHook(() => useMilestones(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockMilestones);
      expect(getMilestones).toHaveBeenCalled();
    });

    it("should handle error when fetch fails", async () => {
      vi.mocked(getMilestones).mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => useMilestones(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("should show loading state initially", () => {
      vi.mocked(getMilestones).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useMilestones(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("useMilestone (get single milestone)", () => {
    it("should return milestone by id", async () => {
      vi.mocked(getMilestones).mockResolvedValue(mockMilestones);

      const { result } = renderHook(() => useMilestone("milestone-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockMilestones[0]);
    });

    it("should throw error when milestone not found", async () => {
      vi.mocked(getMilestones).mockResolvedValue([]);

      const { result } = renderHook(() => useMilestone("non-existent"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useMilestone(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(getMilestones).not.toHaveBeenCalled();
    });
  });

  describe("useCreateMilestone (create milestone)", () => {
    it("should create milestone successfully", async () => {
      const newMilestone: Milestone = {
        id: "new-milestone",
        title: "New Milestone",
        target_date: "2024-12-31",
        status: "pending",
        biz_type: null,
        biz_id: null,
        progress: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createMilestone).mockResolvedValue(newMilestone);
      vi.mocked(getMilestones).mockResolvedValue([
        ...mockMilestones,
        newMilestone,
      ]);

      const { result } = renderHook(() => useCreateMilestone(), {
        wrapper: createWrapper(),
      });

      let createdMilestone: Milestone | undefined;
      await act(async () => {
        createdMilestone = await result.current.mutateAsync({
          title: "New Milestone",
          target_date: "2024-12-31",
        });
      });

      expect(createdMilestone).toEqual(newMilestone);
      expect(createMilestone).toHaveBeenCalled();
    });

    it("should handle create error", async () => {
      vi.mocked(createMilestone).mockRejectedValue(
        new Error("Failed to create"),
      );

      const { result } = renderHook(() => useCreateMilestone(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ title: "New Milestone" });
        }),
      ).rejects.toThrow("Failed to create");
    });
  });

  describe("useUpdateMilestone (update milestone)", () => {
    it("should update milestone successfully", async () => {
      const updatedMilestone = { ...mockMilestones[0], title: "Updated Title" };
      vi.mocked(updateMilestone).mockResolvedValue(updatedMilestone);

      const { result } = renderHook(() => useUpdateMilestone(), {
        wrapper: createWrapper(),
      });

      let updated: Milestone | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "milestone-1",
          title: "Updated Title",
        });
      });

      expect(updated?.title).toBe("Updated Title");
      expect(updateMilestone).toHaveBeenCalled();
    });

    it("should update milestone status", async () => {
      const updatedMilestone = {
        ...mockMilestones[0],
        status: "completed" as const,
      };
      vi.mocked(updateMilestone).mockResolvedValue(updatedMilestone);

      const { result } = renderHook(() => useUpdateMilestone(), {
        wrapper: createWrapper(),
      });

      let updated: Milestone | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "milestone-1",
          status: "completed",
        });
      });

      expect(updated?.status).toBe("completed");
    });

    it("should handle update error", async () => {
      vi.mocked(updateMilestone).mockRejectedValue(
        new Error("Failed to update"),
      );

      const { result } = renderHook(() => useUpdateMilestone(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            id: "milestone-1",
            title: "Updated",
          });
        }),
      ).rejects.toThrow("Failed to update");
    });
  });

  describe("useDeleteMilestone (delete milestone)", () => {
    it("should delete milestone successfully", async () => {
      vi.mocked(deleteMilestone).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteMilestone(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("milestone-1");
      });

      expect(deleteMilestone).toHaveBeenCalled();
    });

    it("should handle delete error", async () => {
      vi.mocked(deleteMilestone).mockRejectedValue(
        new Error("Failed to delete"),
      );

      const { result } = renderHook(() => useDeleteMilestone(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("milestone-1");
        }),
      ).rejects.toThrow("Failed to delete");
    });
  });

  describe("usePlansForMilestone", () => {
    it("should return plans for milestone", async () => {
      vi.mocked(getPlans).mockResolvedValue(mockPlans);

      const { result } = renderHook(() => usePlansForMilestone(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPlans);
    });
  });

  describe("useTargetsForMilestone", () => {
    it("should return targets for milestone", async () => {
      vi.mocked(getTargets).mockResolvedValue(mockTargets);

      const { result } = renderHook(() => useTargetsForMilestone(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTargets);
    });
  });

  describe("useCirculationsForMilestone", () => {
    it("should return circulations for milestone", async () => {
      vi.mocked(getCirculations).mockResolvedValue(mockCirculations);

      const { result } = renderHook(() => useCirculationsForMilestone(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCirculations);
    });
  });

  describe("milestoneKeys", () => {
    it("should have correct query keys", () => {
      expect(milestoneKeys.milestones).toEqual(["milestones"]);
      expect(milestoneKeys.milestone("milestone-1")).toEqual([
        "milestones",
        "milestone-1",
      ]);
    });
  });
});
