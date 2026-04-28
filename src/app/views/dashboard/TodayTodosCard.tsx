"use client";

import { motion, AnimatePresence } from "framer-motion";
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
      <AnimatePresence mode="popLayout">
        <div className="space-y-2">
          {todos.map((todo, idx) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{
                duration: 0.2,
                delay: idx * 0.05,
                layout: { type: "spring", stiffness: 500, damping: 30 }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-2 rounded cursor-pointer"
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
                transition={{ duration: 0.3 }}
              >
                {todo.title}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>
    </SectionCard>
  );
}