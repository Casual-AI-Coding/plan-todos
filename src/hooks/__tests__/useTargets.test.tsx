import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useTargets,
  useTarget,
  useTargetTags,
  useTargetSteps,
  useCreateTarget,
  useUpdateTarget,
  useDeleteTarget,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
  targetKeys,
} from "@/hooks/useTargets";
import type { Target, Step, Tag } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getTargets: vi.fn(),
  getSteps: vi.fn(),
  getEntityTags: vi.fn(),
  setEntityTags: vi.fn(),
  createTarget: vi.fn(),
  updateTarget: vi.fn(),
  deleteTarget: vi.fn(),
  createStep: vi.fn(),
  updateStep: vi.fn(),
  deleteStep: vi.fn(),
}));

import {
  getTargets,
  getSteps,
  getEntityTags,
  setEntityTags,
  createTarget,
  updateTarget,
  deleteTarget,
  createStep,
  updateStep,
  deleteStep,
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
const mockTargets: Target[] = [
  {
    id: "target-1",
    title: "Test Target 1",
    description: "Description 1",
    due_date: "2024-12-31",
    status: "active",
    progress: 50,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "target-2",
    title: "Test Target 2",
    description: "Description 2",
    due_date: "2024-06-30",
    status: "completed",
    progress: 100,
    created_at: "2024-01-01",
    updated_at: "2024-02-01",
  },
];

const mockSteps: Step[] = [
  {
    id: "step-1",
    target_id: "target-1",
    title: "Step 1",
    weight: 50,
    status: "completed",
    priority: "P1",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "step-2",
    target_id: "target-1",
    title: "Step 2",
    weight: 50,
    status: "pending",
    priority: "P2",
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

describe("useTargets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useTargets (get all targets)", () => {
    it("should return targets on successful fetch", async () => {
      vi.mocked(getTargets).mockResolvedValue(mockTargets);

      const { result } = renderHook(() => useTargets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTargets);
      expect(getTargets).toHaveBeenCalled();
    });

    it("should handle error when fetch fails", async () => {
      vi.mocked(getTargets).mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => useTargets(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("should show loading state initially", () => {
      vi.mocked(getTargets).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useTargets(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("useTarget (get single target)", () => {
    it("should return target by id", async () => {
      vi.mocked(getTargets).mockResolvedValue(mockTargets);

      const { result } = renderHook(() => useTarget("target-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTargets[0]);
    });

    it("should throw error when target not found", async () => {
      vi.mocked(getTargets).mockResolvedValue([]);

      const { result } = renderHook(() => useTarget("non-existent"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useTarget(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(getTargets).not.toHaveBeenCalled();
    });
  });

  describe("useTargetTags (get target tags)", () => {
    it("should return tags for a target", async () => {
      vi.mocked(getEntityTags).mockResolvedValue(mockTags);

      const { result } = renderHook(() => useTargetTags("target-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTags);
      expect(getEntityTags).toHaveBeenCalledWith("target", "target-1");
    });

    it("should not fetch when targetId is empty", () => {
      const { result } = renderHook(() => useTargetTags(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useTargetSteps (get target steps)", () => {
    it("should return steps for a target", async () => {
      vi.mocked(getSteps).mockResolvedValue(mockSteps);

      const { result } = renderHook(() => useTargetSteps("target-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSteps);
      expect(getSteps).toHaveBeenCalledWith("target-1");
    });

    it("should not fetch when targetId is empty", () => {
      const { result } = renderHook(() => useTargetSteps(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useCreateTarget (create target)", () => {
    it("should create target successfully", async () => {
      const newTarget: Target = {
        id: "new-target",
        title: "New Target",
        description: "New Description",
        due_date: "2024-12-31",
        status: "active",
        progress: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createTarget).mockResolvedValue(newTarget);
      vi.mocked(getTargets).mockResolvedValue([...mockTargets, newTarget]);

      const { result } = renderHook(() => useCreateTarget(), {
        wrapper: createWrapper(),
      });

      let createdTarget: Target | undefined;
      await act(async () => {
        createdTarget = await result.current.mutateAsync({
          title: "New Target",
          description: "New Description",
          due_date: "2024-12-31",
        });
      });

      expect(createdTarget).toEqual(newTarget);
      expect(createTarget).toHaveBeenCalled();
    });

    it("should create target with tags", async () => {
      const newTarget: Target = {
        id: "new-target",
        title: "New Target",
        description: null,
        due_date: null,
        status: "active",
        progress: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createTarget).mockResolvedValue(newTarget);
      vi.mocked(setEntityTags).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreateTarget(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          title: "New Target",
          tagIds: ["tag-1"],
        });
      });

      expect(createTarget).toHaveBeenCalled();
      expect(setEntityTags).toHaveBeenCalledWith("target", "new-target", [
        "tag-1",
      ]);
    });

    it("should handle create error", async () => {
      vi.mocked(createTarget).mockRejectedValue(new Error("Failed to create"));

      const { result } = renderHook(() => useCreateTarget(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ title: "New Target" });
        }),
      ).rejects.toThrow("Failed to create");
    });
  });

  describe("useUpdateTarget (update target)", () => {
    it("should update target successfully", async () => {
      const updatedTarget = { ...mockTargets[0], title: "Updated Title" };
      vi.mocked(updateTarget).mockResolvedValue(updatedTarget);

      const { result } = renderHook(() => useUpdateTarget(), {
        wrapper: createWrapper(),
      });

      let updated: Target | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "target-1",
          title: "Updated Title",
        });
      });

      expect(updated?.title).toBe("Updated Title");
      expect(updateTarget).toHaveBeenCalled();
    });

    it("should handle update error", async () => {
      vi.mocked(updateTarget).mockRejectedValue(new Error("Failed to update"));

      const { result } = renderHook(() => useUpdateTarget(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            id: "target-1",
            title: "Updated",
          });
        }),
      ).rejects.toThrow("Failed to update");
    });
  });

  describe("useDeleteTarget (delete target)", () => {
    it("should delete target successfully", async () => {
      vi.mocked(deleteTarget).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteTarget(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("target-1");
      });

      expect(deleteTarget).toHaveBeenCalled();
    });

    it("should handle delete error", async () => {
      vi.mocked(deleteTarget).mockRejectedValue(new Error("Failed to delete"));

      const { result } = renderHook(() => useDeleteTarget(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("target-1");
        }),
      ).rejects.toThrow("Failed to delete");
    });
  });

  describe("useCreateStep (create step)", () => {
    it("should create step successfully", async () => {
      const newStep: Step = {
        id: "new-step",
        target_id: "target-1",
        title: "New Step",
        weight: 50,
        status: "pending",
        priority: "P1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createStep).mockResolvedValue(newStep);

      const { result } = renderHook(() => useCreateStep(), {
        wrapper: createWrapper(),
      });

      let createdStep: Step | undefined;
      await act(async () => {
        createdStep = await result.current.mutateAsync({
          target_id: "target-1",
          title: "New Step",
          weight: 50,
        });
      });

      expect(createdStep).toEqual(newStep);
      expect(createStep).toHaveBeenCalled();
    });

    it("should handle create error", async () => {
      vi.mocked(createStep).mockRejectedValue(new Error("Failed to create"));

      const { result } = renderHook(() => useCreateStep(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            target_id: "target-1",
            title: "New Step",
            weight: 50,
          });
        }),
      ).rejects.toThrow("Failed to create");
    });
  });

  describe("useUpdateStep (update step)", () => {
    it("should update step successfully", async () => {
      const updatedStep = { ...mockSteps[0], title: "Updated Title" };
      vi.mocked(updateStep).mockResolvedValue(updatedStep);

      const { result } = renderHook(() => useUpdateStep(), {
        wrapper: createWrapper(),
      });

      let updated: Step | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "step-1",
          title: "Updated Title",
        });
      });

      expect(updated?.title).toBe("Updated Title");
      expect(updateStep).toHaveBeenCalled();
    });

    it("should handle update error", async () => {
      vi.mocked(updateStep).mockRejectedValue(new Error("Failed to update"));

      const { result } = renderHook(() => useUpdateStep(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: "step-1", title: "Updated" });
        }),
      ).rejects.toThrow("Failed to update");
    });
  });

  describe("useDeleteStep (delete step)", () => {
    it("should delete step successfully", async () => {
      vi.mocked(deleteStep).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteStep(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("step-1");
      });

      expect(deleteStep).toHaveBeenCalled();
    });

    it("should handle delete error", async () => {
      vi.mocked(deleteStep).mockRejectedValue(new Error("Failed to delete"));

      const { result } = renderHook(() => useDeleteStep(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("step-1");
        }),
      ).rejects.toThrow("Failed to delete");
    });
  });

  describe("targetKeys", () => {
    it("should have correct query keys", () => {
      expect(targetKeys.targets).toEqual(["targets"]);
      expect(targetKeys.target("target-1")).toEqual(["targets", "target-1"]);
      expect(targetKeys.targetTags("target-1")).toEqual([
        "targets",
        "target-1",
        "tags",
      ]);
      expect(targetKeys.targetSteps("target-1")).toEqual([
        "targets",
        "target-1",
        "steps",
      ]);
    });
  });
});
