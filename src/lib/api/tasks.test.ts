import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getTask,
  getTasks,
  getTasksByPlan,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api/tasks";
import type { Task, CreateTaskParams, UpdateTaskParams } from "@/lib/types";

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

describe("Task API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("getTask", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(getTask("task-1")).rejects.toThrow(
        "This app must run in Tauri to get task",
      );
    });

    it("should call invoke with get_task command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockTask: Task = {
        id: "task-1",
        plan_id: "plan-1",
        title: "Test Task",
        description: null,
        start_date: null,
        end_date: null,
        status: "in-progress",
        priority: "P2",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockTask);

      const result = await getTask("task-1");

      expect(mockInvoke).toHaveBeenCalledWith("get_task", { id: "task-1" });
      expect(result).toEqual(mockTask);
    });
  });

  describe("getTasks", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getTasks();
      expect(result).toEqual([]);
    });

    it("should call invoke with get_tasks command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue([]);
      await getTasks();
      expect(mockInvoke).toHaveBeenCalledWith("get_tasks");
    });
  });

  describe("getTasksByPlan", () => {
    it("should return empty array when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const result = await getTasksByPlan("plan-1");
      expect(result).toEqual([]);
    });

    it("should call invoke with get_tasks_by_plan command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue([]);
      await getTasksByPlan("plan-1");
      expect(mockInvoke).toHaveBeenCalledWith("get_tasks_by_plan", {
        planId: "plan-1",
      });
    });
  });

  describe("createTask", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      const params: CreateTaskParams = { plan_id: "plan-1", title: "New Task" };
      await expect(createTask(params)).rejects.toThrow(
        "This app must run in Tauri to create tasks",
      );
    });

    it("should call invoke with create_task command with all params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: CreateTaskParams = {
        plan_id: "plan-1",
        title: "New Task",
        description: "Description",
        start_date: "2024-01-01",
        end_date: "2024-01-02",
        priority: "P0",
      };
      mockInvoke.mockResolvedValue({
        id: "new-id",
        ...params,
        status: "pending",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      });

      await createTask(params);

      expect(mockInvoke).toHaveBeenCalledWith("create_task", {
        planId: "plan-1",
        title: "New Task",
        description: "Description",
        startDate: "2024-01-01",
        endDate: "2024-01-02",
        priority: "P0",
      });
    });

    it("should handle null optional params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue({});

      await createTask({ plan_id: "plan-1", title: "Minimal" });

      expect(mockInvoke).toHaveBeenCalledWith("create_task", {
        planId: "plan-1",
        title: "Minimal",
        description: null,
        startDate: null,
        endDate: null,
        priority: null,
      });
    });
  });

  describe("updateTask", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(updateTask("task-1", { title: "Updated" })).rejects.toThrow(
        "This app must run in Tauri to update tasks",
      );
    });

    it("should call invoke with update_task command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: UpdateTaskParams = {
        title: "Updated",
        description: "New desc",
        start_date: "2024-01-01",
        end_date: "2024-01-02",
        status: "done",
        priority: "P3",
      };
      mockInvoke.mockResolvedValue({});

      await updateTask("task-1", params);

      expect(mockInvoke).toHaveBeenCalledWith("update_task", {
        id: "task-1",
        title: "Updated",
        description: "New desc",
        startDate: "2024-01-01",
        endDate: "2024-01-02",
        status: "done",
        priority: "P3",
      });
    });
  });

  describe("deleteTask", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);
      await expect(deleteTask("task-1")).rejects.toThrow(
        "This app must run in Tauri to delete tasks",
      );
    });

    it("should call invoke with delete_task command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);
      await deleteTask("task-1");
      expect(mockInvoke).toHaveBeenCalledWith("delete_task", { id: "task-1" });
    });
  });
});
