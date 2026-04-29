import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSteps,
  getStepsByTarget,
  createStep,
  updateStep,
  deleteStep,
  reorderSteps,
} from "@/lib/api/steps";
import type { Step, CreateStepParams, UpdateStepParams } from "@/lib/types";

const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

vi.mock("@/lib/api/client", () => ({
  isTauri: vi.fn(() => true),
  invoke: mockInvoke,
}));

import { isTauri } from "@/lib/api/client";

describe("Step API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("getSteps", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getSteps("target-1")).rejects.toThrow(
        "This app must run in Tauri to get steps",
      );
    });

    it("should call getStepsByTarget internally", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockSteps: Step[] = [
        {
          id: "step-1",
          target_id: "target-1",
          title: "Step 1",
          weight: 1,
          status: "pending",
          priority: "P2",
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ];
      mockInvoke.mockResolvedValue(mockSteps);

      const result = await getSteps("target-1");

      expect(mockInvoke).toHaveBeenCalledWith("get_steps", {
        targetId: "target-1",
      });
      expect(result).toEqual(mockSteps);
    });
  });

  describe("getStepsByTarget", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getStepsByTarget("target-1")).rejects.toThrow(
        "This app must run in Tauri to get steps",
      );
    });

    it("should call invoke with get_steps command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue([]);

      await getStepsByTarget("target-1");

      expect(mockInvoke).toHaveBeenCalledWith("get_steps", {
        targetId: "target-1",
      });
    });
  });

  describe("createStep", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const params: CreateStepParams = {
        target_id: "target-1",
        title: "New Step",
        weight: 1,
      };
      await expect(createStep(params)).rejects.toThrow(
        "This app must run in Tauri to create steps",
      );
    });

    it("should call invoke with create_step command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: CreateStepParams = {
        target_id: "target-1",
        title: "New Step",
        weight: 1,
        priority: "P1",
      };
      mockInvoke.mockResolvedValue({
        id: "new-id",
        ...params,
        status: "pending",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      });

      await createStep(params);

      expect(mockInvoke).toHaveBeenCalledWith("create_step", {
        targetId: "target-1",
        title: "New Step",
        weight: 1,
        priority: "P1",
      });
    });

    it("should handle null priority", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: CreateStepParams = {
        target_id: "target-1",
        title: "Step",
        weight: 1,
      };
      mockInvoke.mockResolvedValue({});

      await createStep(params);

      expect(mockInvoke).toHaveBeenCalledWith("create_step", {
        targetId: "target-1",
        title: "Step",
        weight: 1,
        priority: null,
      });
    });
  });

  describe("updateStep", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(updateStep("step-1", { title: "Updated" })).rejects.toThrow(
        "This app must run in Tauri to update steps",
      );
    });

    it("should call invoke with update_step command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: UpdateStepParams = {
        title: "Updated",
        weight: 2,
        status: "completed",
        priority: "P3",
      };
      mockInvoke.mockResolvedValue({});

      await updateStep("step-1", params);

      expect(mockInvoke).toHaveBeenCalledWith("update_step", {
        id: "step-1",
        title: "Updated",
        weight: 2,
        status: "completed",
        priority: "P3",
      });
    });
  });

  describe("deleteStep", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(deleteStep("step-1")).rejects.toThrow(
        "This app must run in Tauri to delete steps",
      );
    });

    it("should call invoke with delete_step command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);

      await deleteStep("step-1");

      expect(mockInvoke).toHaveBeenCalledWith("delete_step", { id: "step-1" });
    });
  });

  describe("reorderSteps", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        reorderSteps("target-1", ["step-1", "step-2"]),
      ).rejects.toThrow("This app must run in Tauri to reorder steps");
    });

    it("should call invoke with reorder_steps command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);

      await reorderSteps("target-1", ["step-1", "step-2"]);

      expect(mockInvoke).toHaveBeenCalledWith("reorder_steps", {
        targetId: "target-1",
        stepIds: ["step-1", "step-2"],
      });
    });
  });
});
