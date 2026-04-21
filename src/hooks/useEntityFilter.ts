import { useMemo } from "react";
import type { Priority, Todo, Plan, Target } from "@/lib/types";

type TodoFilterMode = "all" | "today" | "upcoming" | "completed";

interface TodoFilterCriteria {
  todos: Todo[];
  filter: TodoFilterMode;
  priorityFilter: Priority | "all";
  tagFilters: string[];
  searchQuery: string;
}

export function useFilteredTodos({
  todos,
  filter,
  priorityFilter,
  tagFilters,
  searchQuery,
}: TodoFilterCriteria) {
  return useMemo(() => {
    const today = new Date().toISOString().split("T")[0];

    return todos.filter((t) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (
          !t.title.toLowerCase().includes(q) &&
          !t.content?.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      if (priorityFilter !== "all" && t.priority !== priorityFilter) {
        return false;
      }

      if (tagFilters.length > 0) {
        type TodoWithTags = Todo & { tags?: { id: string }[] };
        const todoWithTags = t as TodoWithTags;
        const hasTag = tagFilters.some((tagId) =>
          todoWithTags.tags?.some((tag) => tag.id === tagId),
        );
        if (!hasTag) return false;
      }

      if (filter === "today") return t.due_date?.startsWith(today);
      if (filter === "upcoming") return !!t.due_date && t.due_date > today;
      if (filter === "completed") return t.status === "done";

      return true;
    });
  }, [todos, filter, priorityFilter, tagFilters, searchQuery]);
}

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: "todo" | "task" | "plan" | "milestone";
}

export function useCalendarEvents(todos: Todo[]) {
  return useMemo<CalendarEvent[]>(
    () =>
      todos
        .filter((t) => t.due_date)
        .map((t) => ({
          id: t.id,
          title: t.title,
          date: t.due_date!,
          type: "todo" as const,
        })),
    [todos],
  );
}

type PlanFilterCriteria = {
  plans: Plan[];
  tagFilters: string[];
  showArchived?: boolean;
};

export function useFilteredPlans({
  plans,
  tagFilters,
  showArchived = false,
}: PlanFilterCriteria) {
  return useMemo(() => {
    return plans.filter((p) => {
      if (!showArchived && p.status === "archived") return false;

      if (tagFilters.length > 0) {
        type PlanWithTags = Plan & { tags?: { id: string }[] };
        const planWithTags = p as PlanWithTags;
        const hasTag = tagFilters.some((tagId) =>
          planWithTags.tags?.some((tag) => tag.id === tagId),
        );
        if (!hasTag) return false;
      }

      return true;
    });
  }, [plans, tagFilters, showArchived]);
}

type TargetFilterCriteria = {
  targets: Target[];
  tagFilters: string[];
  showArchived?: boolean;
};

export function useFilteredTargets({
  targets,
  tagFilters,
  showArchived = false,
}: TargetFilterCriteria) {
  return useMemo(() => {
    return targets.filter((t) => {
      if (!showArchived && t.status === "archived") return false;

      if (tagFilters.length > 0) {
        type TargetWithTags = Target & { tags?: { id: string }[] };
        const targetWithTags = t as TargetWithTags;
        const hasTag = tagFilters.some((tagId) =>
          targetWithTags.tags?.some((tag) => tag.id === tagId),
        );
        if (!hasTag) return false;
      }

      return true;
    });
  }, [targets, tagFilters, showArchived]);
}