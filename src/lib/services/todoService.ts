import type { Todo } from "@/lib/types";

export function filterTodosByPriority(todos: Todo[], priority: string): Todo[] {
  return todos.filter((t) => t.priority === priority);
}

export function groupTodosByStatus(todos: Todo[]): Record<string, Todo[]> {
  return todos.reduce(
    (acc, todo) => {
      const status = todo.status || "pending";
      if (!acc[status]) acc[status] = [];
      acc[status].push(todo);
      return acc;
    },
    {} as Record<string, Todo[]>,
  );
}

export function filterTodosByTag(todos: Todo[], tag: string): Todo[] {
  return todos.filter((t) => t.tags?.some((t) => t.name === tag));
}

export function getTodosDueSoon(todos: Todo[], days: number = 3): Todo[] {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return todos.filter((t) => {
    if (!t.due_date) return false;
    const dueDate = new Date(t.due_date);
    return dueDate >= now && dueDate <= future;
  });
}

export function sortTodosByPriority(todos: Todo[]): Todo[] {
  const priorityOrder: Record<string, number> = {
    P0: 0,
    P1: 1,
    P2: 2,
    P3: 3,
  };
  return [...todos].sort((a, b) => {
    const aPriority = priorityOrder[a.priority || "P3"] ?? 3;
    const bPriority = priorityOrder[b.priority || "P3"] ?? 3;
    return aPriority - bPriority;
  });
}
