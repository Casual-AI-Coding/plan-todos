// src/lib/services/todoService.test.ts
import { describe, it, expect } from "vitest";
import {
  filterTodosByPriority,
  groupTodosByStatus,
  filterTodosByTag,
  getTodosDueSoon,
  sortTodosByPriority,
} from "./todoService";

describe("todoService", () => {
  describe("filterTodosByPriority", () => {
    it("should filter todos by priority", () => {
      const todos = [
        { id: "1", title: "Todo 1", priority: "P1" },
        { id: "2", title: "Todo 2", priority: "P2" },
        { id: "3", title: "Todo 3", priority: "P1" },
      ];
      const result = filterTodosByPriority(todos, "P1");
      expect(result.length).toBe(2);
    });

    it("should return empty array when no match", () => {
      const todos = [{ id: "1", title: "Todo 1", priority: "P2" }];
      const result = filterTodosByPriority(todos, "P1");
      expect(result).toEqual([]);
    });
  });

  describe("groupTodosByStatus", () => {
    it("should group todos by status", () => {
      const todos = [
        { id: "1", title: "Todo 1", status: "pending" },
        { id: "2", title: "Todo 2", status: "completed" },
        { id: "3", title: "Todo 3", status: "pending" },
      ];
      const result = groupTodosByStatus(todos);
      expect(result.pending?.length).toBe(2);
      expect(result.completed?.length).toBe(1);
    });

    it("should default to pending for undefined status", () => {
      const todos = [{ id: "1", title: "Todo 1" }];
      const result = groupTodosByStatus(todos);
      expect(result.pending?.length).toBe(1);
    });
  });

  describe("filterTodosByTag", () => {
    it("should filter todos by tag", () => {
      const todos = [
        { id: "1", title: "Todo 1", tags: ["work", "urgent"] },
        { id: "2", title: "Todo 2", tags: ["personal"] },
        { id: "3", title: "Todo 3", tags: ["work"] },
      ];
      const result = filterTodosByTag(todos, "work");
      expect(result.length).toBe(2);
    });

    it("should return empty array when no tags match", () => {
      const todos = [{ id: "1", title: "Todo 1", tags: ["personal"] }];
      const result = filterTodosByTag(todos, "work");
      expect(result).toEqual([]);
    });
  });

  describe("getTodosDueSoon", () => {
    it("should return todos due within specified days", () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const todos = [
        { id: "1", title: "Todo 1", dueDate: tomorrow.toISOString() },
        { id: "2", title: "Todo 2", dueDate: "2099-12-31" },
        { id: "3", title: "Todo 3" },
      ];
      const result = getTodosDueSoon(todos, 3);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe("1");
    });

    it("should use default 3 days", () => {
      const twoDays = new Date();
      twoDays.setDate(twoDays.getDate() + 2);

      const todos = [
        { id: "1", title: "Todo 1", dueDate: twoDays.toISOString() },
      ];
      const result = getTodosDueSoon(todos);
      expect(result.length).toBe(1);
    });
  });

  describe("sortTodosByPriority", () => {
    it("should sort todos by priority ascending", () => {
      const todos = [
        { id: "1", title: "Todo 1", priority: "P3" },
        { id: "2", title: "Todo 2", priority: "P0" },
        { id: "3", title: "Todo 3", priority: "P1" },
      ];
      const result = sortTodosByPriority(todos);
      expect(result[0].id).toBe("2");
      expect(result[1].id).toBe("3");
      expect(result[2].id).toBe("1");
    });

    it("should default to P3 for undefined priority", () => {
      const todos = [
        { id: "1", title: "Todo 1", priority: "P0" },
        { id: "2", title: "Todo 2" },
      ];
      const result = sortTodosByPriority(todos);
      expect(result[0].id).toBe("1");
    });
  });
});
