"use client";

import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui";
import { Icons } from "@/components/ui/Icons";
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
    <SectionCard
      title="已过期"
      titleColor="var(--color-error)"
      icon={Icons.AlertTriangle}
      accentColor="var(--color-error)"
    >
      <div className="space-y-2">
        {todos.map((todo) => {
          const days = daysOverdue(todo.due_date);
          return (
            <motion.div
              key={todo.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 8px rgba(239, 68, 68, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-2 rounded cursor-pointer"
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
                <motion.span
                  animate={todo.status === "done" ? "done" : "pending"}
                  variants={{
                    done: {
                      textDecorationLine: "line-through",
                      color: "var(--color-text-muted)",
                    },
                    pending: {
                      textDecorationLine: "none",
                      color: "var(--color-text)",
                    },
                  }}
                >
                  {todo.title}
                </motion.span>
              </div>
              {days > 0 && (
                <motion.span
                  className="text-xs font-medium shrink-0 px-1.5 py-0.5 rounded"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    backgroundColor: "var(--color-error)",
                    color: "var(--color-text-inverse)",
                  }}
                >
                  超期{days}天
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </div>
    </SectionCard>
  );
}
