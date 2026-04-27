import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTarget,
  getTargets,
  createTarget,
  updateTarget,
  deleteTarget,
} from "@/lib/api/targets";
import type {
  Target,
  CreateTargetParams,
  UpdateTargetParams,
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

describe("Target API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("getTarget", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getTarget("target-1")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 获取 Target",
      );
    });

    it("should call invoke with get_target command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockTarget: Target = {
        id: "target-1",
        title: "Test Target",
        description: null,
        due_date: null,
        status: "active",
        progress: 0,
        sort_order: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockTarget);

      const result = await getTarget("target-1");

      expect(mockInvoke).toHaveBeenCalledWith("get_target", { id: "target-1" });
      expect(result).toEqual(mockTarget);
    });
  });

  describe("getTargets", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getTargets();
      expect(result).toEqual([]);
    });

    it("should call invoke with get_targets command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue([]);
      await getTargets();
      expect(mockInvoke).toHaveBeenCalledWith("get_targets");
    });
  });

  describe("createTarget", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const params: CreateTargetParams = { title: "New Target" };
      await expect(createTarget(params)).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 创建 Target",
      );
    });

    it("should call invoke with create_target command with all params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: CreateTargetParams = {
        title: "New Target",
        description: "Description",
        due_date: "2024-01-01",
      };
      mockInvoke.mockResolvedValue({
        id: "new-id",
        ...params,
        status: "active",
        sort_order: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      });

      await createTarget(params);

      expect(mockInvoke).toHaveBeenCalledWith("create_target", {
        title: "New Target",
        description: "Description",
        due_date: "2024-01-01",
      });
    });

    it("should handle null optional params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});

      await createTarget({ title: "Minimal" });

      expect(mockInvoke).toHaveBeenCalledWith("create_target", {
        title: "Minimal",
        description: null,
        due_date: null,
      });
    });
  });

  describe("updateTarget", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(
        updateTarget("target-1", { title: "Updated" }),
      ).rejects.toThrow("此操作需要在 Tauri 环境中运行: 更新 Target");
    });

    it("should call invoke with update_target command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: UpdateTargetParams = {
        title: "Updated",
        description: "New desc",
        due_date: "2024-01-02",
        status: "completed",
      };
      mockInvoke.mockResolvedValue({});

      await updateTarget("target-1", params);

      expect(mockInvoke).toHaveBeenCalledWith("update_target", {
        id: "target-1",
        title: "Updated",
        description: "New desc",
        due_date: "2024-01-02",
        status: "completed",
      });
    });
  });

  describe("deleteTarget", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(deleteTarget("target-1")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 删除 Target",
      );
    });

    it("should call invoke with delete_target command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);
      await deleteTarget("target-1");
      expect(mockInvoke).toHaveBeenCalledWith("delete_target", {
        id: "target-1",
      });
    });
  });
});
