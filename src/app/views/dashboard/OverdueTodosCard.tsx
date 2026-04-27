"use client";

import { Checkbox } from "@/components/ui";
import { SectionCard } from "./SectionCard";
import type { StatisticsTodoStatus } from "@/lib/types";

interface OverdueTodo {
  id: string;
  title: string;
  status: StatisticsTodoStatus;
  due_date: string | null;
}

interface OverdueTodosCardProps {
  todos: OverdueTodo[];
  onToggle: (id: string, status: StatisticsTodoStatus) => void;
}

function daysOverdue(dueDate: string | null): number {
  if (!dueDate) return 0;
  const now = new Date();
  const due = new Date(dueDate);
  const diffMs = now.getTime() - due.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export function OverdueTodosCard({ todos, onToggle }: OverdueTodosCardProps) {
  if (todos.length === 0) return null;

  return (
    <SectionCard title="已过期" titleColor="var(--color-error)">
      <div className="space-y-2">
        {todos.map((todo) => {
          const days = daysOverdue(todo.due_date);
          return (
            <div
              key={todo.id}
              className="flex items-center gap-3 p-2 rounded cursor-pointer transition-colors"
              style={{
                backgroundColor: "var(--color-error-bg, rgba(239,68,68,0.08))",
                borderLeft: "3px solid var(--color-error)",
              }}
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
              <div className="flex-1 min-w-0">
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
              {days > 0 && (
                <span
                  className="text-xs font-medium shrink-0"
                  style={{ color: "var(--color-error)" }}
                >
                  超期{days}天
                </span>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
