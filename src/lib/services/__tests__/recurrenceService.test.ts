import { describe, it, expect } from "vitest";
import {
  validateRecurrence,
  calculateNextDueDate,
  createNextOccurrence,
} from "../recurrenceService";
import type { Recurrence, Todo } from "@/lib/types/todo";

describe("validateRecurrence", () => {
  it("should validate daily recurrence", () => {
    const recurrence: Recurrence = { type: "daily", interval: 1 };
    expect(validateRecurrence(recurrence)).toBe(true);
  });

  it("should throw for invalid interval", () => {
    const recurrence = { type: "daily", interval: 0 };
    expect(() => validateRecurrence(recurrence as Recurrence)).toThrow(
      "positive integer",
    );
  });

  it("should throw for negative interval", () => {
    const recurrence = { type: "daily", interval: -1 };
    expect(() => validateRecurrence(recurrence as Recurrence)).toThrow(
      "positive integer",
    );
  });

  it("should validate weekly recurrence with daysOfWeek", () => {
    const recurrence: Recurrence = {
      type: "weekly",
      interval: 1,
      daysOfWeek: [0, 1, 2],
    };
    expect(validateRecurrence(recurrence)).toBe(true);
  });

  it("should not throw for weekly without daysOfWeek (optional)", () => {
    // daysOfWeek is optional for weekly recurrence
    const recurrence: Recurrence = { type: "weekly", interval: 1 };
    expect(validateRecurrence(recurrence)).toBe(true);
  });

  it("should throw for empty daysOfWeek", () => {
    const recurrence: Recurrence = {
      type: "weekly",
      interval: 1,
      daysOfWeek: [],
    };
    expect(() => validateRecurrence(recurrence)).toThrow("non-empty array");
  });

  it("should throw for invalid day of week", () => {
    const recurrence: Recurrence = {
      type: "weekly",
      interval: 1,
      daysOfWeek: [7],
    };
    expect(() => validateRecurrence(recurrence)).toThrow(
      "Invalid day of week: 7",
    );
  });

  it("should validate monthly recurrence with dayOfMonth", () => {
    const recurrence: Recurrence = {
      type: "monthly",
      interval: 1,
      dayOfMonth: 15,
    };
    expect(validateRecurrence(recurrence)).toBe(true);
  });

  it("should throw for invalid dayOfMonth", () => {
    const recurrence: Recurrence = {
      type: "monthly",
      interval: 1,
      dayOfMonth: 32,
    };
    expect(() => validateRecurrence(recurrence)).toThrow(
      "dayOfMonth must be an integer between 1 and 31",
    );
  });

  it("should validate recurrence with endDate", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      endDate: "2025-12-31",
    };
    expect(validateRecurrence(recurrence)).toBe(true);
  });

  it("should throw for invalid endDate", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      endDate: "invalid-date",
    };
    expect(() => validateRecurrence(recurrence)).toThrow(
      "Invalid endDate format",
    );
  });

  it("should validate recurrence with maxOccurrences", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      maxOccurrences: 10,
    };
    expect(validateRecurrence(recurrence)).toBe(true);
  });

  it("should throw for invalid maxOccurrences", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      maxOccurrences: 0,
    };
    expect(() => validateRecurrence(recurrence)).toThrow(
      "maxOccurrences must be a positive integer",
    );
  });

  it("should validate yearly recurrence", () => {
    const recurrence: Recurrence = { type: "yearly", interval: 1 };
    expect(validateRecurrence(recurrence)).toBe(true);
  });

  it("should validate custom recurrence", () => {
    const recurrence: Recurrence = { type: "custom", interval: 3 };
    expect(validateRecurrence(recurrence)).toBe(true);
  });
});

describe("calculateNextDueDate", () => {
  it("should calculate next daily date", () => {
    const recurrence: Recurrence = { type: "daily", interval: 1 };
    const current = new Date("2024-01-15");
    const next = calculateNextDueDate(recurrence, current, 0);
    expect(next).not.toBeNull();
    expect(next!.getDate()).toBe(16);
  });

  it("should calculate next daily date with interval", () => {
    const recurrence: Recurrence = { type: "daily", interval: 2 };
    const current = new Date("2024-01-15");
    const next = calculateNextDueDate(recurrence, current, 0);
    expect(next).not.toBeNull();
    expect(next!.getDate()).toBe(17);
  });

  it("should calculate next weekly date", () => {
    const recurrence: Recurrence = {
      type: "weekly",
      interval: 1,
      daysOfWeek: [1],
    }; // Monday
    const current = new Date("2024-01-15"); // Monday
    const next = calculateNextDueDate(recurrence, current, 0);
    expect(next).not.toBeNull();
  });

  it("should calculate next monthly date", () => {
    const recurrence: Recurrence = { type: "monthly", interval: 1 };
    const current = new Date("2024-01-15");
    const next = calculateNextDueDate(recurrence, current, 0);
    expect(next).not.toBeNull();
    expect(next!.getMonth()).toBe(1); // February
  });

  it("should calculate next yearly date", () => {
    const recurrence: Recurrence = { type: "yearly", interval: 1 };
    const current = new Date("2024-01-15");
    const next = calculateNextDueDate(recurrence, current, 0);
    expect(next).not.toBeNull();
    expect(next!.getFullYear()).toBe(2025);
  });

  it("should return null when maxOccurrences reached", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      maxOccurrences: 3,
    };
    const current = new Date("2024-01-15");
    // index 3 means we've already had 3 occurrences (0,1,2), next would be 4th which exceeds limit
    const next = calculateNextDueDate(recurrence, current, 3);
    expect(next).toBeNull();
  });

  it("should return null when past endDate", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      endDate: "2024-01-14",
    };
    const current = new Date("2024-01-15");
    const next = calculateNextDueDate(recurrence, current, 0);
    expect(next).toBeNull();
  });

  it("should return null when equal to endDate", () => {
    const recurrence: Recurrence = {
      type: "daily",
      interval: 1,
      endDate: "2024-01-16",
    };
    const current = new Date("2024-01-15");
    const next = calculateNextDueDate(recurrence, current, 0);
    expect(next).toBeNull();
  });

  it("should return null for invalid currentDate", () => {
    const recurrence: Recurrence = { type: "daily", interval: 1 };
    const invalidDate = new Date("invalid");
    const next = calculateNextDueDate(recurrence, invalidDate, 0);
    expect(next).toBeNull();
  });

  it("should handle custom recurrence type", () => {
    const recurrence: Recurrence = { type: "custom", interval: 5 };
    const current = new Date("2024-01-15");
    const next = calculateNextDueDate(recurrence, current, 0);
    expect(next).not.toBeNull();
    expect(next!.getDate()).toBe(20); // Jan 15 + 5 days
  });
});

describe("createNextOccurrence", () => {
  const baseTodo: Todo = {
    id: "todo-1",
    title: "Recurring task",
    content: "Task content",
    due_date: "2024-01-15",
    status: "done",
    priority: "P2",
    created_at: "2024-01-01T00:00:00.000Z",
    updated_at: "2024-01-15T00:00:00.000Z",
    tags: [],
  };

  it("should create next occurrence from recurring todo", () => {
    const todo: Todo = {
      ...baseTodo,
      recurrence: { type: "daily", interval: 1 },
    };

    const next = createNextOccurrence(todo);
    expect(next).toBeDefined();
    expect(next!.title).toBe("Recurring task");
    expect(next!.recurrence_from).toBe("todo-1");
    expect(next!.recurrence_index).toBe(1);
    expect(next!.status).toBe("pending");
  });

  it("should create next occurrence with recurrence_from set to original todo id", () => {
    const todo: Todo = {
      ...baseTodo,
      id: "todo-2",
      recurrence: { type: "daily", interval: 1 },
      recurrence_from: "todo-1",
      recurrence_index: 1,
    };

    const next = createNextOccurrence(todo);
    expect(next).toBeDefined();
    expect(next!.recurrence_from).toBe("todo-1"); // Should preserve original
    expect(next!.recurrence_index).toBe(2);
  });

  it("should return null when todo has no recurrence", () => {
    const todo: Todo = {
      ...baseTodo,
      recurrence: undefined,
    };

    const next = createNextOccurrence(todo);
    expect(next).toBeNull();
  });

  it("should return null when todo has no due_date", () => {
    const todo: Todo = {
      ...baseTodo,
      due_date: null,
      recurrence: { type: "daily", interval: 1 },
    };

    const next = createNextOccurrence(todo);
    expect(next).toBeNull();
  });

  it("should return null when maxOccurrences is reached", () => {
    const todo: Todo = {
      ...baseTodo,
      recurrence: { type: "daily", interval: 1, maxOccurrences: 3 },
      recurrence_index: 2, // This is the 3rd occurrence (0, 1, 2)
    };

    const next = createNextOccurrence(todo);
    expect(next).toBeNull();
  });

  it("should preserve content in next occurrence", () => {
    const todo: Todo = {
      ...baseTodo,
      content: "Important task content",
      recurrence: { type: "daily", interval: 1 },
    };

    const next = createNextOccurrence(todo);
    expect(next!.content).toBe("Important task content");
  });

  it("should preserve priority in next occurrence", () => {
    const todo: Todo = {
      ...baseTodo,
      priority: "P1",
      recurrence: { type: "daily", interval: 1 },
    };

    const next = createNextOccurrence(todo);
    expect(next!.priority).toBe("P1");
  });

  it("should return null when next date exceeds endDate", () => {
    const todo: Todo = {
      ...baseTodo,
      due_date: "2024-01-14",
      recurrence: { type: "daily", interval: 1, endDate: "2024-01-15" },
    };

    const next = createNextOccurrence(todo);
    expect(next).toBeNull();
  });
});
