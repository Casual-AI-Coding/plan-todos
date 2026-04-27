import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { BulkUpdateResult } from "@/lib/api/bulk";
import {
  bulkUpdateTodos,
  bulkDeleteTodos,
  bulkArchiveTodos,
  bulkUpdatePlans,
  bulkDeletePlans,
  bulkUpdateTargets,
  bulkDeleteTargets,
  bulkAddTags,
  bulkRemoveTags,
} from "@/lib/api/bulk";
import type { BulkTagResult } from "@/lib/api/bulk";
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
  // bulkUpdateTodos Tests
  // ============================================================================
  describe("bulkUpdateTodos", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTodos(["todo-1", "todo-2"], {
        status: "done",
      });

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_todos", {
        ids: ["todo-1", "todo-2"],
        updates: { status: "done" },
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle empty ids array", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 0,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTodos([], { status: "pending" });

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_todos", {
        ids: [],
        updates: { status: "pending" },
      });
      expect(result.updated).toBe(0);
    });

    it("should handle multiple updates", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 1,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTodos(["todo-1"], {
        status: "in-progress",
        priority: "P1",
      });

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_todos", {
        ids: ["todo-1"],
        updates: { status: "in-progress", priority: "P1" },
      });
      expect(result.updated).toBe(1);
    });

    it("should handle failed items", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 1,
        failed: [{ id: "todo-2", error: "Not found" }],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTodos(["todo-1", "todo-2"], {
        status: "done",
      });

      expect(result.updated).toBe(1);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0].id).toBe("todo-2");
    });

    it("should handle invoke error", async () => {
      const error = new Error("Database error");
      mockInvoke.mockRejectedValue(error);

      await expect(
        bulkUpdateTodos(["todo-1"], { status: "done" }),
      ).rejects.toThrow("Database error");
    });
  });

  // ============================================================================
  // bulkDeleteTodos Tests
  // ============================================================================
  describe("bulkDeleteTodos", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BulkUpdateResult = {
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
      const mockResult: BulkUpdateResult = {
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
      const mockResult: BulkUpdateResult = {
        updated: 1,
        failed: [{ id: "todo-2", error: "Permission denied" }],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTodos(["todo-1", "todo-2"]);

      expect(result.updated).toBe(1);
      expect(result.failed[0].error).toBe("Permission denied");
    });
  });

  // ============================================================================
  // bulkArchiveTodos Tests
  // ============================================================================
  describe("bulkArchiveTodos", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 3,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkArchiveTodos(["todo-1", "todo-2", "todo-3"]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_archive_todos", {
        ids: ["todo-1", "todo-2", "todo-3"],
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle empty ids array", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 0,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkArchiveTodos([]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_archive_todos", {
        ids: [],
      });
      expect(result.updated).toBe(0);
    });
  });

  // ============================================================================
  // bulkUpdatePlans Tests
  // ============================================================================
  describe("bulkUpdatePlans", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdatePlans(["plan-1", "plan-2"], "done");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_plans", {
        ids: ["plan-1", "plan-2"],
        status: "done",
        archived: undefined,
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle archived parameter", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 1,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdatePlans(["plan-1"], undefined, true);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_plans", {
        ids: ["plan-1"],
        status: undefined,
        archived: true,
      });
      expect(result.updated).toBe(1);
    });
  });

  // ============================================================================
  // bulkDeletePlans Tests
  // ============================================================================
  describe("bulkDeletePlans", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeletePlans(["plan-1", "plan-2"]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_plans", {
        ids: ["plan-1", "plan-2"],
      });
      expect(result).toEqual(mockResult);
    });
  });

  // ============================================================================
  // bulkUpdateTargets Tests
  // ============================================================================
  describe("bulkUpdateTargets", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTargets(["target-1", "target-2"], "done");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_targets", {
        ids: ["target-1", "target-2"],
        status: "done",
        archived: undefined,
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle archived parameter", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 1,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkUpdateTargets(["target-1"], undefined, false);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_update_targets", {
        ids: ["target-1"],
        status: undefined,
        archived: false,
      });
      expect(result.updated).toBe(1);
    });
  });

  // ============================================================================
  // bulkDeleteTargets Tests
  // ============================================================================
  describe("bulkDeleteTargets", () => {
    it("should call invoke with correct parameters", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 2,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTargets(["target-1", "target-2"]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_targets", {
        ids: ["target-1", "target-2"],
      });
      expect(result).toEqual(mockResult);
    });

    it("should handle single id deletion", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 1,
        failed: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTargets(["target-1"]);

      expect(mockInvoke).toHaveBeenCalledWith("bulk_delete_targets", {
        ids: ["target-1"],
      });
      expect(result.updated).toBe(1);
    });

    it("should handle all items failing", async () => {
      const mockResult: BulkUpdateResult = {
        updated: 0,
        failed: [
          { id: "target-1", error: "Already deleted" },
          { id: "target-2", error: "Already deleted" },
        ],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkDeleteTargets(["target-1", "target-2"]);

      expect(result.updated).toBe(0);
      expect(result.failed).toHaveLength(2);
    });
  });

  // ============================================================================
  // Edge Cases
  // ============================================================================
  describe("Edge Cases", () => {
    it("should handle large id arrays", async () => {
      const largeArray = Array.from({ length: 100 }, (_, i) => `todo-${i}`);
      const mockResult: BulkUpdateResult = {
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
      const mockResult: BulkUpdateResult = {
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

  describe("bulkAddTags", () => {
    it("should call invoke with correct bulk_add_tags parameters", async () => {
      const mockResult: BulkTagResult = {
        entity_type: "todo",
        tag_id: "tag-1",
        success_count: 2,
        failed_ids: [],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkAddTags("todo", ["todo-1", "todo-2"], "tag-1");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_add_tags", {
        entity_type: "todo",
        entity_ids: ["todo-1", "todo-2"],
        tag_id: "tag-1",
      });
      expect(result).toEqual(mockResult);
    });
  });

  describe("bulkRemoveTags", () => {
    it("should call invoke with correct bulk_remove_tags parameters", async () => {
      const mockResult: BulkTagResult = {
        entity_type: "plan",
        tag_id: "tag-2",
        success_count: 1,
        failed_ids: ["plan-2"],
      };
      mockInvoke.mockResolvedValue(mockResult);

      const result = await bulkRemoveTags("plan", ["plan-1", "plan-2"], "tag-2");

      expect(mockInvoke).toHaveBeenCalledWith("bulk_remove_tags", {
        entity_type: "plan",
        entity_ids: ["plan-1", "plan-2"],
        tag_id: "tag-2",
      });
      expect(result).toEqual(mockResult);
    });
  });
});
