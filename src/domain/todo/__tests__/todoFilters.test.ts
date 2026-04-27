import { describe, it, expect, vi, afterEach } from "vitest";

import { filterTodos, toCalendarEvents } from "../todoFilters";
import type { Todo } from "@/lib/types";

function createTodo(overrides: Partial<Todo> = {}): Todo {
  return {
    id: overrides.id ?? "todo-1",
    title: overrides.title ?? "Write docs",
    content: overrides.content ?? "Document the feature",
    due_date: overrides.due_date ?? null,
    status: overrides.status ?? "pending",
    priority: overrides.priority ?? "P2",
    sort_order: overrides.sort_order ?? 0,
    created_at: overrides.created_at ?? "2026-04-27T09:00:00.000Z",
    updated_at: overrides.updated_at ?? "2026-04-27T09:00:00.000Z",
    tags: overrides.tags ?? [],
    reminder_times: overrides.reminder_times,
    recurrence: overrides.recurrence,
    recurrence_from: overrides.recurrence_from,
    recurrence_index: overrides.recurrence_index,
  };
}

describe("filterTodos", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("filters todos by case-insensitive search across title and content", () => {
    const todos = [
      createTodo({ id: "todo-1", title: "Write docs", content: "Alpha notes" }),
      createTodo({
        id: "todo-2",
        title: "Review PR",
        content: "Contains BETA feedback",
      }),
      createTodo({ id: "todo-3", title: "Ship release", content: null }),
    ];

    const result = filterTodos({
      todos,
      filter: "all",
      priorityFilter: "all",
      tagFilters: [],
      searchQuery: "beta",
    });

    expect(result.map((todo) => todo.id)).toEqual(["todo-2"]);
  });

  it("filters todos by priority and tag id", () => {
    const todos = [
      createTodo({
        id: "todo-1",
        priority: "P1",
        tags: [
          {
            id: "tag-a",
            name: "Work",
            color: "blue",
            description: null,
            created_at: "2026-04-27T09:00:00.000Z",
          },
        ],
      }),
      createTodo({
        id: "todo-2",
        priority: "P1",
        tags: [
          {
            id: "tag-b",
            name: "Home",
            color: "green",
            description: null,
            created_at: "2026-04-27T09:00:00.000Z",
          },
        ],
      }),
      createTodo({
        id: "todo-3",
        priority: "P2",
        tags: [
          {
            id: "tag-a",
            name: "Work",
            color: "blue",
            description: null,
            created_at: "2026-04-27T09:00:00.000Z",
          },
        ],
      }),
    ];

    const result = filterTodos({
      todos,
      filter: "all",
      priorityFilter: "P1",
      tagFilters: ["tag-a"],
      searchQuery: "",
    });

    expect(result.map((todo) => todo.id)).toEqual(["todo-1"]);
  });

  it("uses current date for today, upcoming, and completed filters", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-27T10:00:00.000Z"));

    const todos = [
      createTodo({
        id: "today",
        due_date: "2026-04-27T12:00:00.000Z",
        status: "pending",
      }),
      createTodo({ id: "upcoming", due_date: "2026-04-28", status: "pending" }),
      createTodo({ id: "done", due_date: "2026-04-20", status: "done" }),
      createTodo({
        id: "ignored",
        due_date: "2026-04-27",
        status: "in-progress",
      }),
    ];

    expect(
      filterTodos({
        todos,
        filter: "today",
        priorityFilter: "all",
        tagFilters: [],
        searchQuery: "",
      }).map((todo) => todo.id),
    ).toEqual(["today", "ignored"]);

    expect(
      filterTodos({
        todos,
        filter: "upcoming",
        priorityFilter: "all",
        tagFilters: [],
        searchQuery: "",
      }).map((todo) => todo.id),
    ).toEqual(["today", "upcoming"]);

    expect(
      filterTodos({
        todos,
        filter: "completed",
        priorityFilter: "all",
        tagFilters: [],
        searchQuery: "",
      }).map((todo) => todo.id),
    ).toEqual(["done"]);
  });
});

describe("toCalendarEvents", () => {
  it("maps only todos with due dates to todo calendar events", () => {
    const todos = [
      createTodo({ id: "todo-1", title: "Write docs", due_date: "2026-04-27" }),
      createTodo({ id: "todo-2", title: "No date", due_date: null }),
      createTodo({
        id: "todo-3",
        title: "Review PR",
        due_date: "2026-04-28T09:00:00.000Z",
      }),
    ];

    expect(toCalendarEvents(todos)).toEqual([
      { id: "todo-1", title: "Write docs", date: "2026-04-27", type: "todo" },
      {
        id: "todo-3",
        title: "Review PR",
        date: "2026-04-28T09:00:00.000Z",
        type: "todo",
      },
    ]);
  });
});
