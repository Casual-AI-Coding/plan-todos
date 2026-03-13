import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BatchUpdateResult } from "@/lib/types";
import type { BulkTodoStatus } from "@/lib/api/bulk";
import {
  bulkUpdateTodoStatus,
  bulkUpdateTaskStatus,
  bulkUpdateStepStatus,
  bulkDeleteTodos,
  bulkDeleteTasks,
  bulkDeleteSteps,
  bulkUpdateTodoPriority,
  bulkUpdateTaskPriority,
} from "@/lib/api/bulk";
// Use vi.hoisted to create mock reference before vi.mock
const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

describe("Bulk API Functions", () => {
  beforeEach(() => {
    // Set up Tauri environment
    Object.defineProperty(global, "window", {
      value: { __TAURI__: {} },
      writable: true,
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(global, "window", {
      value: {},
      writable: true,
    });
  });

  // ============================================================================
  // Non-Tauri Environment Tests
  // ============================================================================
  describe("Non-Tauri Environment", () => {
    beforeEach(() => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });
    });

    it("bulkUpdateTodoStatus throws error when not in Tauri", async () => {
      await expect(
        bulkUpdateTodoStatus(["todo-1", "todo-2"], "done"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("bulkUpdateTaskStatus throws error when not in Tauri", async () => {
      await expect(
        bulkUpdateTaskStatus(["task-1", "task-2"], "done"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("bulkUpdateStepStatus throws error when not in Tauri", async () => {
      await expect(
        bulkUpdateStepStatus(["step-1", "step-2"], "completed"),
      ).rejects.toThrow("This app must run in Tauri");
    });

    it("bulkDeleteTodos throws error when not in Tauri", async () => {
      await expect(bulkDeleteTodos(["todo-1", "todo-2"])).rejects.toThrow(
        "This app must run in Tauri",
      );
    });

    it("bulkDeleteTasks throws error when not in Tauri", async () => {
      await expect(bulkDeleteTasks(["task-1", "task-2"])).rejects.toThrow(
        "This app must run in Tauri",
      );
    });
  });

  // ============================================================================
  // bulkUpdateTodoStatus Tests
  // ============================================================================
  describe("bulkUpdateTodoStatus", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTodoStatus(["todo-1", "todo-2"], "done");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_todo_status", {
        ids: ["todo-1", "todo-2"],
        status: "done",
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle empty ids array", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 0,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTodoStatus([], "pending");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_todo_status", {
        ids: [],
        status: "pending",
      });
      expect(result.updated).toBe(0);
    });

    it("should handle failed items", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 1,
        failed: [{ id: "todo-2", error: "Not found" }],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTodoStatus(["todo-1", "todo-2"], "done");

      expect(result.updated).toBe(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].id).toBe("todo-2");
    });

    it("should handle invoke error", async () => {
      const error = new Error("Database error");
      mockInvoke.mockRejectedValue(error);

      await expect(bulkUpdateTodoStatus(["todo-1"], "done")).rejects.toThrow(
        "Database error",
      );
    });
  });

  // ============================================================================
  // bulkUpdateTaskStatus Tests
  // ============================================================================
  describe("bulkUpdateTaskStatus", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 3,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTaskStatus(
        ["task-1", "task-2", "task-3"],
        "done",
      );

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_task_status", {
        ids: ["task-1", "task-2", "task-3"],
        status: "done",
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle in-progress status", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 1,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTaskStatus(["task-1"], "in-progress");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_task_status", {
        ids: ["task-1"],
        status: "in-progress",
      });
      expect(result.updated).toBe(1);
    });

    it("should handle invoke error", async () => {
      const error = new Error("Tauri invoke failed");
      mockInvoke.mockRejectedValue(error);

      await expect(bulkUpdateTaskStatus(["task-1"], "done")).rejects.toThrow(
        "Tauri invoke failed",
      );
    });
  });

  // ============================================================================
  // bulkUpdateStepStatus Tests
  // ============================================================================
  describe("bulkUpdateStepStatus", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateStepStatus(
        ["step-1", "step-2"],
        "completed",
      );

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_step_status", {
        ids: ["step-1", "step-2"],
        status: "completed",
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle pending status", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 1,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateStepStatus(["step-1"], "pending");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_step_status", {
        ids: ["step-1"],
        status: "pending",
      });
      expect(result.updated).toBe(1);
    });

    it("should handle all items failing", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 0,
        failed: [
          { id: "step-1", error: "Invalid status" },
          { id: "step-2", error: "Invalid status" },
        ],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateStepStatus(
        ["step-1", "step-2"],
        "completed",
      );

      expect(result.updated).toBe(0);
      expect(result.failed).toHaveLength(2);
    });

    it("should handle invoke error", async () => {
      const error = new Error("Network error");
      mockInvoke.mockRejectedValue(error);

      await expect(
        bulkUpdateStepStatus(["step-1"], "completed"),
      ).rejects.toThrow("Network error");
    });
  });

  // ============================================================================
  // bulkDeleteTodos Tests
  // ============================================================================
  describe("bulkDeleteTodos", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTodos(["todo-1", "todo-2"]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_todos", {
        ids: ["todo-1", "todo-2"],
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle empty ids array", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 0,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTodos([]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_todos", {
        ids: [],
      });
      expect(result.updated).toBe(0);
    });

    it("should handle partial deletion failure", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 1,
        failed: [{ id: "todo-2", error: "Permission denied" }],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTodos(["todo-1", "todo-2"]);

      expect(result.updated).toBe(1);
      expect(result.failed[0].error).toBe("Permission denied");
    });

    it("should handle invoke error", async () => {
      const error = new Error("Delete failed");
      mockInvoke.mockRejectedValue(error);

      await expect(bulkDeleteTodos(["todo-1"])).rejects.toThrow(
        "Delete failed",
      );
    });
  });

  // ============================================================================
  // bulkDeleteTasks Tests
  // ============================================================================
  describe("bulkDeleteTasks", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 3,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTasks(["task-1", "task-2", "task-3"]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_tasks", {
        ids: ["task-1", "task-2", "task-3"],
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle single id deletion", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 1,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTasks(["task-1"]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_tasks", {
        ids: ["task-1"],
      });
      expect(result.updated).toBe(1);
    });

    it("should handle all items failing", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 0,
        failed: [
          { id: "task-1", error: "Already deleted" },
          { id: "task-2", error: "Already deleted" },
        ],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTasks(["task-1", "task-2"]);

      expect(result.updated).toBe(0);
      expect(result.failed).toHaveLength(2);
    });

    it("should handle invoke error", async () => {
      const error = new Error("Database connection lost");
      mockInvoke.mockRejectedValue(error);

      await expect(bulkDeleteTasks(["task-1"])).rejects.toThrow(
        "Database connection lost",
      );
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe("Edge Cases", () => {
    it("should handle all status values", async () => {
      const todoStatuses: BulkTodoStatus[] = ["pending", "in-progress", "done"];
      const mockResult: BatchUpdateResult = { updated: 1, failed: [] };
      mockInvoke.mockResolvedValue(mockResult);

      for (const status of todoStatuses) {
        await bulkUpdateTodoStatus(["todo-1"], status);
        expect(mockInvoke).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({ status }),
        );
      }
    });

    it("should handle large id arrays", async () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `todo-${i}`);
      const mockResult: BatchUpdateResult = {
        updated: 100,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTodos(largeArray);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_todos", {
        ids: largeArray,
      });
      expect(result.updated).toBe(100);
    });

    it("should handle special characters in ids", async () => {
      const specialIds = ["todo-1", "todo-with-dash", "todo_with_underscore"];
      const mockResult: BatchUpdateResult = {
        updated: 3,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTodos(specialIds);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_todos", {
        ids: specialIds,
      });
      expect(result.updated).toBe(3);
    });
  });

  // ===========================================================================
  // bulkDeleteSteps Tests
  // ===========================================================================
  describe("bulkDeleteSteps", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteSteps(["step-1", "step-2"]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_steps", {
        ids: ["step-1", "step-2"],
      });
      expect(result).toEqual(mockResult);
    });

    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(bulkDeleteSteps(["step-1"])).rejects.toThrow(
        "This app must run in Tauri",
      );
    });
  });

  // ===========================================================================
  // bulkUpdateTodoPriority Tests
  // ===========================================================================
  describe("bulkUpdateTodoPriority", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 3,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTodoPriority(
        ["todo-1", "todo-2", "todo-3"],
        "P1",
      );

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_todo_priority", {
        ids: ["todo-1", "todo-2", "todo-3"],
        priority: "P1",
      });
      expect(result).toEqual(mockResult);
    });

    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(bulkUpdateTodoPriority(["todo-1"], "P2")).rejects.toThrow(
        "This app must run in Tauri",
      );
    });
  });

  // ===========================================================================
  // bulkUpdateTaskPriority Tests
  // ===========================================================================
  describe("bulkUpdateTaskPriority", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BatchUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTaskPriority(["task-1", "task-2"], "P0");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_task_priority", {
        ids: ["task-1", "task-2"],
        priority: "P0",
      });
      expect(result).toEqual(mockResult);
    });

    it("should throw error when not in Tauri environment", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
      });

      await expect(bulkUpdateTaskPriority(["task-1"], "P3")).rejects.toThrow(
        "This app must run in Tauri",
      );
    });
  });
});
