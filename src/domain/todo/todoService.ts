import { PRIORITY_ORDER } from "@/config/constants";
import type { Todo } from "@/lib/types";
import type { TodoStatus } from "@/domain/shared/domainTypes";
import { TODO_STATUSES } from "@/domain/shared/domainTypes";

export const todoDomainService = {
  filterByPriority(todos: Todo[], priority: string): Todo[] {
    return todos.filter((t) => t.priority === priority);
  },

  groupByStatus(todos: Todo[]): Record<string, Todo[]> {
    return todos.reduce(
      (acc, todo) => {
        const status = todo.status || "pending";
        if (!acc[status]) acc[status] = [];
        acc[status].push(todo);
        return acc;
      },
      {} as Record<string, Todo[]>,
    );
  },

  filterByTag(todos: Todo[], tag: string): Todo[] {
    return todos.filter((t) => t.tags?.some((t) => t.name === tag));
  },

  getDueSoon(todos: Todo[], days: number = 3): Todo[] {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return todos.filter((t) => {
      if (!t.due_date) return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= now && dueDate <= future;
    });
  },

  sortByPriority(todos: Todo[]): Todo[] {
    return [...todos].sort((a, b) => {
      const aPriority = PRIORITY_ORDER[a.priority || "P3"] ?? 3;
      const bPriority = PRIORITY_ORDER[b.priority || "P3"] ?? 3;
      return aPriority - bPriority;
    });
  },

  isValidStatus(status: string): status is TodoStatus {
    return (TODO_STATUSES as readonly string[]).includes(status);
  },

  toReorderInput(
    todos: Array<Pick<Todo, "id"> & Partial<Pick<Todo, "sort_order">>>,
  ): Array<{ id: string; sort_order: number }> {
    return todos.map((todo, index) => ({
      id: todo.id,
      sort_order: index,
    }));
  },
};
