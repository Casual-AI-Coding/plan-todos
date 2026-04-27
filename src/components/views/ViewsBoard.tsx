"use client";

import type { Todo, Task, Plan, Target, Milestone } from "@/lib/types";
import { EntityCard } from "@/app/views/views/EntityCard";
import type { EntityItem, EntityType } from "@/app/views/views/types";
import { Icons } from "@/components/ui/Icons";

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

const columns: {
  id: string;
  label: string;
  iconBgColor: string;
  dotBgColor: string;
  textColor: string;
}[] = [
  {
    id: "pending",
    label: "待处理",
    iconBgColor: "bg-gray-400",
    dotBgColor: "bg-gray-400",
    textColor: "text-gray-600",
  },
  {
    id: "in-progress",
    label: "进行中",
    iconBgColor: "bg-orange-500",
    dotBgColor: "bg-orange-500",
    textColor: "text-orange-600",
  },
  {
    id: "done",
    label: "已完成",
    iconBgColor: "bg-green-500",
    dotBgColor: "bg-green-500",
    textColor: "text-green-600",
  },
];

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
        {columns.map((col) => {
          const items = getItemsByStatus(col.id);
          const ColumnIcon =
            col.id === "pending"
              ? Icons.Circle
              : col.id === "in-progress"
                ? Icons.Timer
                : Icons.CheckCircle;

          return (
            <div
              key={col.id}
              className="rounded-lg p-4 flex flex-col h-[60vh] border"
              style={{
                backgroundColor: "var(--color-bg-hover)",
                borderColor: "var(--color-border)",
              }}
            >
              <div className="flex items-center gap-2 mb-4 flex-shrink-0">
                <div
                  className={`w-6 h-6 rounded ${col.iconBgColor} flex items-center justify-center`}
                >
                  <ColumnIcon size={14} className="text-white" />
                </div>
                <h3 className={`font-semibold ${col.textColor}`}>{col.label}</h3>
                <span
                  className="ml-auto text-sm px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: "var(--color-bg-hover)",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {items.length}
                </span>
              </div>
              <div className="space-y-2 overflow-y-auto flex-1 min-h-0 scroll-smooth scrollbar-hide">
                {items.map((item, idx) => (
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
                      col.id === "done" ? "teal" : col.id === "in-progress" ? "orange" : "gray"
                    }
                  />
                ))}
                {items.length === 0 && (
                  <div className="text-center py-8">
                    <p
                      className="text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      无
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
