import type { Priority, Todo } from "@/lib/types";

export type TodoFilterMode = "all" | "today" | "upcoming" | "completed";

export interface TodoFilterCriteria {
  todos: Todo[];
  filter: TodoFilterMode;
  priorityFilter: Priority | "all";
  tagFilters: string[];
  searchQuery: string;
}

export interface TodoCalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "todo";
}

export function filterTodos({
  todos,
  filter,
  priorityFilter,
  tagFilters,
  searchQuery,
}: TodoFilterCriteria): Todo[] {
  const today = new Date().toISOString().split("T")[0];

  return todos.filter((todo) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !todo.title.toLowerCase().includes(query) &&
        !todo.content?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }

    if (priorityFilter !== "all" && todo.priority !== priorityFilter) {
      return false;
    }

    if (tagFilters.length > 0) {
      const hasTag = tagFilters.some((tagId) =>
        todo.tags?.some((tag) => tag.id === tagId),
      );

      if (!hasTag) {
        return false;
      }
    }

    if (filter === "today") {
      return todo.due_date?.startsWith(today);
    }

    if (filter === "upcoming") {
      return !!todo.due_date && todo.due_date > today;
    }

    if (filter === "completed") {
      return todo.status === "done";
    }

    return true;
  });
}

export function toCalendarEvents(todos: Todo[]): TodoCalendarEvent[] {
  return todos
    .filter((todo) => todo.due_date)
    .map((todo) => ({
      id: todo.id,
      title: todo.title,
      date: todo.due_date!,
      type: "todo" as const,
    }));
}
