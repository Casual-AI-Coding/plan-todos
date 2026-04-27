"use client";

import type { Todo, Task, Plan, Target, Milestone } from "@/lib/types";
import { EntityCard } from "@/app/views/views/EntityCard";
import type { EntityItem, EntityType } from "@/app/views/views/types";

export interface ViewsBoardProps {
  todos: Todo[];
  plans: Plan[];
  targets: Target[];
  milestones: Milestone[];
  allTasks: Task[];
  filters: {
    todo: boolean;
    task: boolean;
    plan: boolean;
    target: boolean;
    milestone: boolean;
  };
  hoveredItem: EntityItem | null;
  setHoveredItem: (item: EntityItem | null) => void;
  hoverPosition: { x: number; y: number };
  setHoverPosition: (pos: { x: number; y: number }) => void;
  onNavigate?: (type: string, id: string) => void;
}

export function ViewsBoard({
  todos,
  plans,
  targets,
  milestones,
  allTasks,
  filters,
  setHoveredItem,
  setHoverPosition,
  onNavigate,
}: ViewsBoardProps) {
  const columns = [
    { id: "pending", label: "待处理", color: "gray" },
    { id: "in-progress", label: "进行中", color: "orange" },
    { id: "done", label: "已完成", color: "green" },
  ];

  const getItemsByStatus = (status: string): EntityItem[] => {
    const items: EntityItem[] = [];

    if (filters.todo)
      todos
        .filter((t) => t.status === status)
        .forEach((t) => items.push({ type: "todo" as EntityType, data: t }));
    if (filters.task)
      allTasks
        .filter((t) => t.status === status)
        .forEach((t) => items.push({ type: "task" as EntityType, data: t }));
    if (filters.plan)
      plans
        .filter(
          (p) =>
            p.status ===
            (status === "done"
              ? "completed"
              : status === "pending"
                ? "active"
                : "active"),
        )
        .forEach((p) => items.push({ type: "plan" as EntityType, data: p }));
    if (filters.target)
      targets
        .filter(
          (t) =>
            t.status ===
            (status === "done"
              ? "completed"
              : status === "pending"
                ? "active"
                : "active"),
        )
        .forEach((t) => items.push({ type: "target" as EntityType, data: t }));
    if (filters.milestone)
      milestones
        .filter(
          (m) => m.status === (status === "done" ? "completed" : "pending"),
        )
        .forEach((m) =>
          items.push({ type: "milestone" as EntityType, data: m }),
        );

    return items;
  };

  return (
    <div className="relative h-full">
      <div className="grid grid-cols-3 gap-4 h-full">
        {columns.map((col) => (
          <div
            key={col.id}
            className="rounded-lg p-4 flex flex-col h-[60vh]"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          >
            <h3
              className="font-semibold mb-4 flex items-center gap-2 flex-shrink-0"
              style={{
                color: `#${col.color === "gray" ? "6B7280" : col.color === "orange" ? "F97316" : "22C55E"}`,
              }}
            >
              <span
                className={`w-3 h-3 rounded-full bg-${col.color}-500`}
              ></span>
              {col.label}
              <span
                className="ml-auto text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                {getItemsByStatus(col.id).length}
              </span>
            </h3>
            <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0 scroll-smooth scrollbar-hide">
              {getItemsByStatus(col.id).map((item, idx) => (
                <EntityCard
                  key={`${item.type}-${idx}`}
                  item={item}
                  onHover={(item, e) => {
                    setHoveredItem(item);
                    setHoverPosition({ x: e.clientX, y: e.clientY });
                  }}
                  onLeave={() => setHoveredItem(null)}
                  onClick={onNavigate}
                  progressColor={
                    col.color === "green"
                      ? "teal"
                      : (col.color as "gray" | "orange" | "teal")
                  }
                />
              ))}
              {getItemsByStatus(col.id).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">无</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
