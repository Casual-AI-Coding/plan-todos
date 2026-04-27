"use client";

import { Checkbox } from "@/components/ui";
import { Icons } from "@/components/ui/Icons";
import { SectionCard } from "./SectionCard";
import type { StatisticsTodoStatus } from "@/lib/types";

interface TodayTodo {
  id: string;
  title: string;
  status: StatisticsTodoStatus;
}

interface TodayTodosCardProps {
  todos: TodayTodo[];
  onToggle: (id: string, status: StatisticsTodoStatus) => void;
}

export function TodayTodosCard({ todos, onToggle }: TodayTodosCardProps) {
  return (
    <SectionCard
      title="今日待办"
      icon={Icons.CheckSquare}
      accentColor="var(--color-primary)"
      isEmpty={todos.length === 0}
      emptyMessage="暂无今日待办"
    >
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-2 rounded cursor-pointer hover:opacity-80 transition-all duration-200"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
            onClick={() => onToggle(todo.id, todo.status)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle(todo.id, todo.status);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <Checkbox checked={todo.status === "done"} />
            <span
              className={todo.status === "done" ? "line-through" : ""}
              style={{
                color:
                  todo.status === "done"
                    ? "var(--color-text-muted)"
                    : "var(--color-text)",
              }}
            >
              {todo.title}
            </span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
