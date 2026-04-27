import { renderHook, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import { useTodoViewState } from "../todoViewState";
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

describe("useTodoViewState", () => {
  it("returns the expected default view state", () => {
    const { result } = renderHook(() => useTodoViewState());

    expect(result.current.filter).toBe("all");
    expect(result.current.priorityFilter).toBe("all");
    expect(result.current.tagFilters).toEqual([]);
    expect(result.current.showPriorityDropdown).toBe(false);
    expect(result.current.showTagDropdown).toBe(false);
    expect(result.current.searchQuery).toBe("");
    expect(result.current.viewMode).toBe("list");
    expect(result.current.showForm).toBe(false);
    expect(result.current.editingTodo).toBeNull();
  });

  it("opens create form and clears any editing todo", () => {
    const todo = createTodo({ id: "editing" });
    const { result } = renderHook(() => useTodoViewState());

    act(() => {
      result.current.openEditForm(todo);
    });

    act(() => {
      result.current.openCreateForm();
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.editingTodo).toBeNull();
  });

  it("opens edit form with the provided todo and closes cleanly", () => {
    const todo = createTodo({ id: "todo-2", title: "Review PR" });
    const { result } = renderHook(() => useTodoViewState());

    act(() => {
      result.current.openEditForm(todo);
    });

    expect(result.current.showForm).toBe(true);
    expect(result.current.editingTodo).toEqual(todo);

    act(() => {
      result.current.closeForm();
    });

    expect(result.current.showForm).toBe(false);
    expect(result.current.editingTodo).toBeNull();
  });

  it("toggles dropdowns so only one stays open at a time and closeDropdowns resets both", () => {
    const { result } = renderHook(() => useTodoViewState());

    act(() => {
      result.current.togglePriorityDropdown();
    });

    expect(result.current.showPriorityDropdown).toBe(true);
    expect(result.current.showTagDropdown).toBe(false);

    act(() => {
      result.current.toggleTagDropdown();
    });

    expect(result.current.showPriorityDropdown).toBe(false);
    expect(result.current.showTagDropdown).toBe(true);

    act(() => {
      result.current.closeDropdowns();
    });

    expect(result.current.showPriorityDropdown).toBe(false);
    expect(result.current.showTagDropdown).toBe(false);
  });

  it("exposes setters for filter controls and view mode", () => {
    const { result } = renderHook(() => useTodoViewState());

    act(() => {
      result.current.setFilter("completed");
      result.current.setPriorityFilter("P1");
      result.current.setTagFilters(["tag-a"]);
      result.current.setSearchQuery("review");
      result.current.setViewMode("calendar");
    });

    expect(result.current.filter).toBe("completed");
    expect(result.current.priorityFilter).toBe("P1");
    expect(result.current.tagFilters).toEqual(["tag-a"]);
    expect(result.current.searchQuery).toBe("review");
    expect(result.current.viewMode).toBe("calendar");
  });
});
