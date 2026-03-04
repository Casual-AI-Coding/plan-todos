import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getTodo,
  getTodos,
  getTodosByTag,
  createTodo,
  updateTodo,
  deleteTodo,
} from "@/lib/api/todos";
import type { Todo, CreateTodoParams, UpdateTodoParams } from "@/lib/types";

// Use vi.hoisted to create mock function before imports
const { mockInvoke } = vi.hoisted(() => ({
  mockInvoke: vi.fn(),
}));

// Mock @tauri-apps/api/core
vi.mock("@tauri-apps/api/core", () => ({
  invoke: mockInvoke,
}));

// Mock client module to control isTauri behavior
vi.mock("@/lib/api/client", () => ({
  isTauri: vi.fn(() => true),
  invoke: mockInvoke,
}));

import { isTauri } from "@/lib/api/client";

describe("Todo API", () => {
  beforeEach(() => {
    mockInvoke.mockReset();
    vi.clearAllMocks();
  });

  describe("getTodo", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(getTodo("test-id")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 获取 Todo",
      );
    });

    it("should call invoke with get_todo command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockTodo: Todo = {
        id: "test-id",
        title: "Test Todo",
        content: "Test content",
        due_date: "2024-01-01",
        status: "pending",
        priority: "P1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockTodo);

      const result = await getTodo("test-id");

      expect(mockInvoke).toHaveBeenCalledWith("get_todo", { id: "test-id" });
      expect(result).toEqual(mockTodo);
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(getTodo("test-id")).rejects.toThrow("Tauri error");
    });
  });

  describe("getTodos", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(getTodos()).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 获取 Todo 列表",
      );
    });

    it("should call invoke with get_todos command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockTodos: Todo[] = [
        {
          id: "test-id-1",
          title: "Test Todo 1",
          content: null,
          due_date: null,
          status: "pending",
          priority: "P1",
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
        {
          id: "test-id-2",
          title: "Test Todo 2",
          content: "Content 2",
          due_date: "2024-01-02",
          status: "done",
          priority: "P2",
          created_at: "2024-01-01",
          updated_at: "2024-01-02",
        },
      ];
      mockInvoke.mockResolvedValue(mockTodos);

      const result = await getTodos();

      expect(mockInvoke).toHaveBeenCalledWith("get_todos");
      expect(result).toEqual(mockTodos);
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(getTodos()).rejects.toThrow("Tauri error");
    });
  });

  describe("getTodosByTag", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(getTodosByTag("tag-1")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 获取标签下的 Todo 列表",
      );
    });

    it("should call invoke with get_todos_by_tag command when in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const mockTodos: Todo[] = [
        {
          id: "test-id-1",
          title: "Tagged Todo",
          content: null,
          due_date: null,
          status: "pending",
          priority: "P1",
          created_at: "2024-01-01",
          updated_at: "2024-01-01",
        },
      ];
      mockInvoke.mockResolvedValue(mockTodos);

      const result = await getTodosByTag("tag-1");

      expect(mockInvoke).toHaveBeenCalledWith("get_todos_by_tag", {
        tagId: "tag-1",
      });
      expect(mockTodos);
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(getTodosByTag("tag-1")).rejects.toThrow("Tauri error");
    });
  });

  describe("createTodo", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      const params: CreateTodoParams = { title: "New Todo" };

      await expect(createTodo(params)).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 创建 Todo",
      );
    });

    it("should call invoke with create_todo command with all params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: CreateTodoParams = {
        title: "New Todo",
        content: "Test content",
        due_date: "2024-01-01",
        priority: "P1",
      };
      const mockTodo: Todo = {
        id: "new-id",
        title: "New Todo",
        content: "Test content",
        due_date: "2024-01-01",
        status: "pending",
        priority: "P1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockTodo);

      const result = await createTodo(params);

      expect(mockInvoke).toHaveBeenCalledWith("create_todo", {
        title: "New Todo",
        content: "Test content",
        dueDate: "2024-01-01",
        priority: "P1",
      });
      expect(result).toEqual(mockTodo);
    });

    it("should call invoke with minimal params (only title)", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: CreateTodoParams = { title: "Minimal Todo" };
      const mockTodo: Todo = {
        id: "new-id",
        title: "Minimal Todo",
        content: null,
        due_date: null,
        status: "pending",
        priority: "P2",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockTodo);

      const result = await createTodo(params);

      expect(mockInvoke).toHaveBeenCalledWith("create_todo", {
        title: "Minimal Todo",
        content: null,
        dueDate: null,
        priority: null,
      });
      expect(result).toEqual(mockTodo);
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(createTodo({ title: "Test" })).rejects.toThrow(
        "Tauri error",
      );
    });
  });

  describe("updateTodo", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      const params: UpdateTodoParams = { title: "Updated Title" };

      await expect(updateTodo("test-id", params)).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 更新 Todo",
      );
    });

    it("should call invoke with update_todo command with all params", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: UpdateTodoParams = {
        title: "Updated Title",
        content: "Updated content",
        due_date: "2024-01-02",
        status: "done",
        priority: "P0",
      };
      const mockTodo: Todo = {
        id: "test-id",
        title: "Updated Title",
        content: "Updated content",
        due_date: "2024-01-02",
        status: "done",
        priority: "P0",
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
      };
      mockInvoke.mockResolvedValue(mockTodo);

      const result = await updateTodo("test-id", params);

      expect(mockInvoke).toHaveBeenCalledWith("update_todo", {
        id: "test-id",
        title: "Updated Title",
        content: "Updated content",
        dueDate: "2024-01-02",
        status: "done",
        priority: "P0",
      });
      expect(result).toEqual(mockTodo);
    });

    it("should call invoke with partial params (only title)", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: UpdateTodoParams = { title: "Just Title" };
      const mockTodo: Todo = {
        id: "test-id",
        title: "Just Title",
        content: null,
        due_date: null,
        status: "pending",
        priority: "P2",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      mockInvoke.mockResolvedValue(mockTodo);

      const result = await updateTodo("test-id", params);

      expect(mockInvoke).toHaveBeenCalledWith("update_todo", {
        id: "test-id",
        title: "Just Title",
        content: undefined,
        dueDate: undefined,
        status: undefined,
        priority: undefined,
      });
      expect(result).toEqual(mockTodo);
    });

    it("should call invoke with only status update", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const params: UpdateTodoParams = { status: "in-progress" };
      const mockTodo: Todo = {
        id: "test-id",
        title: "Test Todo",
        content: null,
        due_date: null,
        status: "in-progress",
        priority: "P2",
        created_at: "2024-01-01",
        updated_at: "2024-01-02",
      };
      mockInvoke.mockResolvedValue(mockTodo);

      const result = await updateTodo("test-id", params);

      expect(mockInvoke).toHaveBeenCalledWith("update_todo", {
        id: "test-id",
        title: undefined,
        content: undefined,
        dueDate: undefined,
        status: "in-progress",
        priority: undefined,
      });
      expect(result).toEqual(mockTodo);
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(updateTodo("test-id", { title: "Test" })).rejects.toThrow(
        "Tauri error",
      );
    });
  });

  describe("deleteTodo", () => {
    it("should throw error when not running in Tauri", async () => {
      vi.mocked(isTauri).mockReturnValue(false);

      await expect(deleteTodo("test-id")).rejects.toThrow(
        "此操作需要在 Tauri 环境中运行: 删除 Todo",
      );
    });

    it("should call invoke with delete_todo command", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      mockInvoke.mockResolvedValue(undefined);

      await deleteTodo("test-id");

      expect(mockInvoke).toHaveBeenCalledWith("delete_todo", {
        id: "test-id",
      });
    });

    it("should handle invoke error", async () => {
      vi.mocked(isTauri).mockReturnValue(true);
      const error = new Error("Tauri error");
      mockInvoke.mockRejectedValue(error);

      await expect(deleteTodo("test-id")).rejects.toThrow("Tauri error");
    });
  });
});
