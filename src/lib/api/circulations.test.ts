// src/lib/api/circulations.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCirculation,
  getCirculations,
  getCirculationsByType,
  createCirculation,
  updateCirculation,
  deleteCirculation,
  checkinCirculation,
  undoCheckinCirculation,
  getCirculationLogs,
  getCirculationLogsBatch,
} from "./circulations";
import type {
  Circulation,
  CirculationLog,
  CreateCirculationParams,
  UpdateCirculationParams,
} from "@/lib/types";

// Mock @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// Get the mocked invoke function
const { invoke } = await import("@tauri-apps/api/core");

describe("circulations API", () => {
  const originalWindow = global.window;

  beforeEach(() => {
    // Set up Tauri environment
    Object.defineProperty(global, "window", {
      value: { __TAURI__: {} },
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.window = originalWindow;
  });

  // Test data
  const mockCirculation: Circulation = {
    id: "circulation-1",
    title: "Daily Exercise",
    content: "Exercise for 30 minutes",
    circulation_type: "periodic",
    frequency: "daily",
    frequency_config: '{"days":["Mon","Tue","Wed","Thu","Fri"]}',
    target_count: null,
    current_count: 5,
    streak_count: 3,
    best_streak: 10,
    last_completed_at: "2026-03-02T10:00:00Z",
    status: "active",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-03-02T10:00:00Z",
  };

  const mockCirculationLog: CirculationLog = {
    id: "log-1",
    circulation_id: "circulation-1",
    completed_at: "2026-03-02T10:00:00Z",
    note: "Great workout",
    period: "2026-W10",
    count: null,
  };

  describe("getCirculation", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(getCirculation("circulation-1")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 获取 Circulation",
      );
    });

    it("should call invoke with get_circulation command", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      const result = await getCirculation("circulation-1");

      expect(invoke).toHaveBeenCalledWith("get_circulation", {
        id: "circulation-1",
      });
      expect(result).toEqual(mockCirculation);
    });

    it("should propagate errors from invoke", async () => {
      vi.mocked(invoke).mockRejectedValue(new Error("Not found"));

      await expect(getCirculation("invalid")).rejects.toThrow("Not found");
    });
  });

  describe("getCirculations", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(getCirculations()).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 获取 Circulation 列表",
      );
    });

    it("should call invoke with get_circulations command", async () => {
      vi.mocked(invoke).mockResolvedValue([mockCirculation]);

      const result = await getCirculations();

      expect(invoke).toHaveBeenCalledWith("get_circulations");
      expect(result).toEqual([mockCirculation]);
    });

    it("should return empty array when no circulations exist", async () => {
      vi.mocked(invoke).mockResolvedValue([]);

      const result = await getCirculations();

      expect(result).toEqual([]);
    });
  });

  describe("getCirculationsByType", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(getCirculationsByType("periodic")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 获取指定类型的 Circulation 列表",
      );
    });

    it("should call invoke with get_circulations_by_type and type only", async () => {
      vi.mocked(invoke).mockResolvedValue([mockCirculation]);

      const result = await getCirculationsByType("periodic");

      expect(invoke).toHaveBeenCalledWith("get_circulations_by_type", {
        circulationType: "periodic",
        frequency: null,
      });
      expect(result).toEqual([mockCirculation]);
    });

    it("should call invoke with get_circulations_by_type with frequency", async () => {
      vi.mocked(invoke).mockResolvedValue([mockCirculation]);

      const result = await getCirculationsByType("periodic", "daily");

      expect(invoke).toHaveBeenCalledWith("get_circulations_by_type", {
        circulationType: "periodic",
        frequency: "daily",
      });
      expect(result).toEqual([mockCirculation]);
    });

    it("should return empty array when no matching circulations", async () => {
      vi.mocked(invoke).mockResolvedValue([]);

      const result = await getCirculationsByType("count");

      expect(result).toEqual([]);
    });
  });

  describe("createCirculation", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      const params: CreateCirculationParams = {
        title: "New Circulation",
        circulation_type: "periodic",
      };

      await expect(createCirculation(params)).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 创建 Circulation",
      );
    });

    it("should call invoke with create_circulation command", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      const params: CreateCirculationParams = {
        title: "Daily Exercise",
        circulation_type: "periodic",
        frequency: "daily",
      };

      const result = await createCirculation(params);

      expect(invoke).toHaveBeenCalledWith("create_circulation", {
        title: params.title,
        circulationType: params.circulation_type,
        frequency: params.frequency,
        frequencyConfig: null,
        targetCount: null,
      });
      expect(result).toEqual(mockCirculation);
    });

    it("should call invoke with all optional params", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      const params: CreateCirculationParams = {
        title: "Count Circulation",
        circulation_type: "count",
        frequency: undefined,
        frequency_config: '{"min":1,"max":10}',
        target_count: 100,
      };

      await createCirculation(params);

      expect(invoke).toHaveBeenCalledWith("create_circulation", {
        title: params.title,
        circulationType: params.circulation_type,
        frequency: null,
        frequencyConfig: params.frequency_config,
        targetCount: params.target_count,
      });
    });

    it("should propagate errors from invoke", async () => {
      vi.mocked(invoke).mockRejectedValue(new Error("Validation error"));

      const params: CreateCirculationParams = {
        title: "New",
        circulation_type: "periodic",
      };

      await expect(createCirculation(params)).rejects.toThrow(
        "Validation error",
      );
    });
  });

  describe("updateCirculation", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(updateCirculation("circulation-1", {})).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 更新 Circulation",
      );
    });

    it("should call invoke with update_circulation command", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      const data: UpdateCirculationParams = {
        title: "Updated Title",
      };

      const result = await updateCirculation("circulation-1", data);

      expect(invoke).toHaveBeenCalledWith("update_circulation", {
        id: "circulation-1",
        title: "Updated Title",
        circulationType: null,
        frequency: null,
        frequencyConfig: null,
        targetCount: null,
        status: null,
      });
      expect(result).toEqual(mockCirculation);
    });

    it("should call invoke with all optional params", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      const data: UpdateCirculationParams = {
        title: "Updated",
        circulation_type: "count",
        frequency: undefined,
        frequency_config: '{"key":"value"}',
        target_count: 50,
        status: "archived",
      };

      await updateCirculation("circulation-1", data);

      expect(invoke).toHaveBeenCalledWith("update_circulation", {
        id: "circulation-1",
        title: "Updated",
        circulationType: "count",
        frequency: null,
        frequencyConfig: '{"key":"value"}',
        targetCount: 50,
        status: "archived",
      });
    });

    it("should handle partial update with only status", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      const data: UpdateCirculationParams = {
        status: "archived",
      };

      await updateCirculation("circulation-1", data);

      expect(invoke).toHaveBeenCalledWith("update_circulation", {
        id: "circulation-1",
        title: null,
        circulationType: null,
        frequency: null,
        frequencyConfig: null,
        targetCount: null,
        status: "archived",
      });
    });
  });

  describe("deleteCirculation", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(deleteCirculation("circulation-1")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 删除 Circulation",
      );
    });

    it("should call invoke with delete_circulation command", async () => {
      vi.mocked(invoke).mockResolvedValue(undefined);

      await deleteCirculation("circulation-1");

      expect(invoke).toHaveBeenCalledWith("delete_circulation", {
        id: "circulation-1",
      });
    });

    it("should propagate errors from invoke", async () => {
      vi.mocked(invoke).mockRejectedValue(new Error("Delete failed"));

      await expect(deleteCirculation("circulation-1")).rejects.toThrow(
        "Delete failed",
      );
    });
  });

  describe("checkinCirculation", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(checkinCirculation("circulation-1")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 打卡 Circulation",
      );
    });

    it("should call invoke with checkin_circulation command", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      const result = await checkinCirculation("circulation-1");

      expect(invoke).toHaveBeenCalledWith("checkin_circulation", {
        id: "circulation-1",
        note: null,
        count: null,
      });
      expect(result).toEqual(mockCirculation);
    });

    it("should call invoke with note parameter", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      await checkinCirculation("circulation-1", "Great workout!");

      expect(invoke).toHaveBeenCalledWith("checkin_circulation", {
        id: "circulation-1",
        note: "Great workout!",
        count: null,
      });
    });

    it("should call invoke with count parameter", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      await checkinCirculation("circulation-1", undefined, 5);

      expect(invoke).toHaveBeenCalledWith("checkin_circulation", {
        id: "circulation-1",
        note: null,
        count: 5,
      });
    });

    it("should call invoke with both note and count", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      await checkinCirculation("circulation-1", "Morning run", 3);

      expect(invoke).toHaveBeenCalledWith("checkin_circulation", {
        id: "circulation-1",
        note: "Morning run",
        count: 3,
      });
    });
  });

  describe("undoCheckinCirculation", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(undoCheckinCirculation("circulation-1")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 撤销打卡",
      );
    });

    it("should call invoke with undo_checkin_circulation command", async () => {
      vi.mocked(invoke).mockResolvedValue(mockCirculation);

      const result = await undoCheckinCirculation("circulation-1");

      expect(invoke).toHaveBeenCalledWith("undo_checkin_circulation", {
        id: "circulation-1",
      });
      expect(result).toEqual(mockCirculation);
    });

    it("should propagate errors from invoke", async () => {
      vi.mocked(invoke).mockRejectedValue(new Error("No log to undo"));

      await expect(undoCheckinCirculation("circulation-1")).rejects.toThrow(
        "No log to undo",
      );
    });
  });

  describe("getCirculationLogs", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(getCirculationLogs("circulation-1")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 获取打卡记录",
      );
    });

    it("should call invoke with get_circulation_logs command", async () => {
      vi.mocked(invoke).mockResolvedValue([mockCirculationLog]);

      const result = await getCirculationLogs("circulation-1");

      expect(invoke).toHaveBeenCalledWith("get_circulation_logs", {
        circulationId: "circulation-1",
        limit: 20,
      });
      expect(result).toEqual([mockCirculationLog]);
    });

    it("should call invoke with custom limit", async () => {
      vi.mocked(invoke).mockResolvedValue([mockCirculationLog]);

      await getCirculationLogs("circulation-1", 50);

      expect(invoke).toHaveBeenCalledWith("get_circulation_logs", {
        circulationId: "circulation-1",
        limit: 50,
      });
    });

    it("should return empty array when no logs exist", async () => {
      vi.mocked(invoke).mockResolvedValue([]);

      const result = await getCirculationLogs("circulation-1");

      expect(result).toEqual([]);
    });
  });

  describe("getCirculationLogsBatch", () => {
    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(getCirculationLogsBatch(["circulation-1"])).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 批量获取打卡记录",
      );
    });

    it("should call invoke with get_circulation_logs_batch command", async () => {
      const batchResult: Record<string, CirculationLog[]> = {
        "circulation-1": [mockCirculationLog],
        "circulation-2": [],
      };
      vi.mocked(invoke).mockResolvedValue(batchResult);

      const result = await getCirculationLogsBatch([
        "circulation-1",
        "circulation-2",
      ]);

      expect(invoke).toHaveBeenCalledWith("get_circulation_logs_batch", {
        circulationIds: ["circulation-1", "circulation-2"],
        limit: 50,
      });
      expect(result).toEqual(batchResult);
    });

    it("should call invoke with custom limit", async () => {
      vi.mocked(invoke).mockResolvedValue({});

      await getCirculationLogsBatch(["circulation-1"], 100);

      expect(invoke).toHaveBeenCalledWith("get_circulation_logs_batch", {
        circulationIds: ["circulation-1"],
        limit: 100,
      });
    });

    it("should return empty object when no logs exist", async () => {
      vi.mocked(invoke).mockResolvedValue({});

      const result = await getCirculationLogsBatch(["circulation-1"]);

      expect(result).toEqual({});
    });

    it("should handle empty circulationIds array", async () => {
      vi.mocked(invoke).mockResolvedValue({});

      const result = await getCirculationLogsBatch([]);

      expect(invoke).toHaveBeenCalledWith("get_circulation_logs_batch", {
        circulationIds: [],
        limit: 50,
      });
      expect(result).toEqual({});
    });
  });
});
