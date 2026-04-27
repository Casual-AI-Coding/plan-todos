import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getMilestone,
  getMilestones,
  getMilestonesByTarget,
  createMilestone,
  updateMilestone,
  deleteMilestone,
} from "@/lib/api/milestones";
import type {
  Milestone,
  CreateMilestoneParams,
  UpdateMilestoneParams,
} from "@/lib/types";

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

describe("Milestone API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("getMilestone", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getMilestone("test-id")).rejects.toThrow(
        "This app must run in Tauri to get milestone",
      );
    });

    it("should call invoke with get_milestone command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockMilestone: Milestone = {
        id: "test-id",
        title: "Test Milestone",
        target_date: "2024-01-01",
        status: "pending",
        progress: 0,
        biz_type: null,
        biz_id: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockMilestone);

      const result = await getMilestone("test-id");

      expect(mockInvoke).toHaveBeenCalledWith("get_milestone", {
        id: "test-id",
      });
      expect(result).toEqual(mockMilestone);
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockRejectedValue(new Error("Tauri error"));
      await expect(getMilestone("test-id")).rejects.toThrow("Tauri error");
    });
  });

  describe("getMilestones", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getMilestones();
      expect(result).toEqual([]);
      expect(mockInvoke).not.toHaveBeenCalled();
    });

    it("should call invoke with get_milestones command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockMilestones: Milestone[] = [
        {
          id: "test-id-1",
          title: "Milestone 1",
          target_date: null,
          status: "pending",
          progress: 50,
          biz_type: null,
          biz_id: null,
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ];
      mockInvoke.mockResolvedValue(mockMilestones);

      const result = await getMilestones();

      expect(mockInvoke).toHaveBeenCalledWith("get_milestones");
      expect(result).toEqual(mockMilestones);
    });
  });

  describe("getMilestonesByTarget", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getMilestonesByTarget("target-1");
      expect(result).toEqual([]);
    });

    it("should call invoke with get_milestones_by_target command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue([]);

      await getMilestonesByTarget("target-1");

      expect(mockInvoke).toHaveBeenCalledWith("get_milestones_by_target", {
        target_id: "target-1",
      });
    });
  });

  describe("createMilestone", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const params: CreateMilestoneParams = { title: "New Milestone" };
      await expect(createMilestone(params)).rejects.toThrow(
        "This app must run in Tauri to create milestones",
      );
    });

    it("should call invoke with create_milestone command with all params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: CreateMilestoneParams = {
        title: "New Milestone",
        target_date: "2024-01-01",
        biz_type: "plan",
        biz_id: "plan-1",
      };
      const mockMilestone: Milestone = {
        id: "new-id",
        title: "New Milestone",
        target_date: "2024-01-01",
        status: "pending",
        progress: 0,
        biz_type: "plan",
        biz_id: "plan-1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockMilestone);

      const result = await createMilestone(params);

      expect(mockInvoke).toHaveBeenCalledWith("create_milestone", {
        title: "New Milestone",
        target_date: "2024-01-01",
        biz_type: "plan",
        biz_id: "plan-1",
      });
      expect(result).toEqual(mockMilestone);
    });

    it("should call invoke with minimal params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: CreateMilestoneParams = { title: "Minimal" };
      mockInvoke.mockResolvedValue({
        id: "new-id",
        title: "Minimal",
        status: "pending",
        progress: 0,
        biz_type: null,
        biz_id: null,
        target_date: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      });

      await createMilestone(params);

      expect(mockInvoke).toHaveBeenCalledWith("create_milestone", {
        title: "Minimal",
        target_date: null,
        biz_type: null,
        biz_id: null,
      });
    });
  });

  describe("updateMilestone", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const params: UpdateMilestoneParams = { title: "Updated" };
      await expect(updateMilestone("test-id", params)).rejects.toThrow(
        "This app must run in Tauri to update milestones",
      );
    });

    it("should call invoke with update_milestone command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: UpdateMilestoneParams = {
        title: "Updated",
        target_date: "2024-01-02",
        status: "completed",
      };
      mockInvoke.mockResolvedValue({
        id: "test-id",
        ...params,
        progress: 100,
        biz_type: null,
        biz_id: null,
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
      });

      await updateMilestone("test-id", params);

      expect(mockInvoke).toHaveBeenCalledWith("update_milestone", {
        id: "test-id",
        title: "Updated",
        target_date: "2024-01-02",
        status: "completed",
      });
    });
  });

  describe("deleteMilestone", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(deleteMilestone("test-id")).rejects.toThrow(
        "This app must run in Tauri to delete milestones",
      );
    });

    it("should call invoke with delete_milestone command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);

      await deleteMilestone("test-id");

      expect(mockInvoke).toHaveBeenCalledWith("delete_milestone", {
        id: "test-id",
      });
    });
  });
});
