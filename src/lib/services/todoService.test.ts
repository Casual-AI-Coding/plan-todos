// src/lib/services/todoService.test.ts
import { describe, it, expect } from "vitest";
import type { Todo, Tag } from "@/lib/types";
import {
  filterTodosByPriority,
  groupTodosByStatus,
  filterTodosByTag,
  getTodosDueSoon,
  sortTodosByPriority,
} from "./todoService";

const createMockTag = (name: string): Tag => ({
  id: Math.random().toString(36).substring(7),
  name,
  color: "#ffffff",
  description: null,
  created_at: "2024-01-01T00:00:00Z",
});

const createMockTodo = (overrides: Partial<Todo> = {}): Todo => ({
  id: "1",
  title: "Test Todo",
  content: null,
  due_date: null,
  status: "pending",
  priority: "P2",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  tags: [],
  ...overrides,
});

describe("todoService", () => {
  describe("filterTodosByPriority", () => {
    it("should filter todos by priority", () => {
      const todos = [
        createMockTodo({ id: "1", title: "Todo 1", priority: "P1" }),
        createMockTodo({ id: "2", title: "Todo 2", priority: "P2" }),
        createMockTodo({ id: "3", title: "Todo 3", priority: "P1" }),
      ];
      const result = filterTodosByPriority(todos, "P1");
      expect(result.length).toBe(2);
    });

    it("should return empty array when no match", () => {
      const todos = [
        createMockTodo({ id: "1", title: "Todo 1", priority: "P2" }),
      ];
      const result = filterTodosByPriority(todos, "P1");
      expect(result).toEqual([]);
    });
  });

  describe("groupTodosByStatus", () => {
    it("should group todos by status", () => {
      const todos = [
        createMockTodo({ id: "1", title: "Todo 1", status: "pending" }),
        createMockTodo({ id: "2", title: "Todo 2", status: "done" }),
        createMockTodo({ id: "3", title: "Todo 3", status: "pending" }),
      ];
      const result = groupTodosByStatus(todos);
      expect(result.pending?.length).toBe(2);
      expect(result.done?.length).toBe(1);
    });

    it("should default to pending for undefined status", () => {
      const todos = [
        createMockTodo({ id: "1", title: "Todo 1", status: "pending" }),
      ];
      const result = groupTodosByStatus(todos);
      expect(result.pending?.length).toBe(1);
    });

    it("should handle todo with no status (undefined)", () => {
      const todoWithoutStatus = {
        id: "1",
        title: "Todo without status",
        content: null,
        due_date: null,
        status: undefined,
        priority: "P2",
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z",
        tags: [],
      } as unknown as Todo;
      const result = groupTodosByStatus([todoWithoutStatus]);
      expect(result.pending?.length).toBe(1);
    });
  });

  describe("filterTodosByTag", () => {
    it("should filter todos by tag", () => {
      const todos = [
        createMockTodo({
          id: "1",
          title: "Todo 1",
          tags: [createMockTag("work"), createMockTag("urgent")],
        }),
        createMockTodo({
          id: "2",
          title: "Todo 2",
          tags: [createMockTag("personal")],
        }),
        createMockTodo({
          id: "3",
          title: "Todo 3",
          tags: [createMockTag("work")],
        }),
      ];
      const result = filterTodosByTag(todos, "work");
      expect(result.length).toBe(2);
    });

    it("should return empty array when no tags match", () => {
      const todos = [
        createMockTodo({
          id: "1",
          title: "Todo 1",
          tags: [createMockTag("personal")],
        }),
      ];
      const result = filterTodosByTag(todos, "work");
      expect(result).toEqual([]);
    });
  });

  describe("getTodosDueSoon", () => {
    it("should return todos due within specified days", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todos = [
        createMockTodo({
          id: "1",
          title: "Todo 1",
          due_date: tomorrow.toISOString(),
        }),
        createMockTodo({ id: "2", title: "Todo 2", due_date: "2099-12-31" }),
        createMockTodo({ id: "3", title: "Todo 3", due_date: null }),
      ];
      const result = getTodosDueSoon(todos, 3);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });

    it("should use default 3 days", () => {
      const twoDays = new Date();
      twoDays.setDate(twoDays.getDate() + 2);

      const todos = [
        createMockTodo({
          id: "1",
          title: "Todo 1",
          due_date: twoDays.toISOString(),
        }),
      ];
      const result = getTodosDueSoon(todos);
      expect(result.length).toBe(1);
    });
  });

  describe("sortTodosByPriority", () => {
    it("should sort todos by priority ascending", () => {
      const todos = [
        createMockTodo({ id: "1", title: "Todo 1", priority: "P3" }),
        createMockTodo({ id: "2", title: "Todo 2", priority: "P0" }),
        createMockTodo({ id: "3", title: "Todo 3", priority: "P1" }),
      ];
      const result = sortTodosByPriority(todos);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("3");
      expect(result[2].id).toBe("1");
    });

    it("should default to P3 for undefined priority", () => {
      const todos = [
        createMockTodo({ id: "1", title: "Todo 1", priority: "P0" }),
        createMockTodo({ id: "2", title: "Todo 2", priority: "P2" }),
      ];
      const result = sortTodosByPriority(todos);
      expect(result[0].id).toBe("1");
    });

    it("should handle invalid priority values", () => {
      const todos = [
        createMockTodo({ id: "1", title: "Todo 1", priority: "P3" }),
        createMockTodo({ id: "2", title: "Todo 2", priority: undefined }),
        createMockTodo({ id: "3", title: "Todo 3", priority: "P0" }),
      ] as Todo[];
      const result = sortTodosByPriority(todos);
      // P0 should be first, P3 and undefined should be treated as P3 (priority 3)
      expect(result[0].id).toBe("3");
    });
  });
});
