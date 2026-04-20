"use client";

import { Card, ProgressBar } from "@/components/ui";
import type { Todo, Task, Plan, Target, Milestone } from "@/lib/types";
import { ItemTooltip } from "./ItemTooltip";

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
  hoveredItem: {
    type: string;
    data: Todo | Task | Plan | Target | Milestone;
  } | null;
  setHoveredItem: (
    item: {
      type: string;
      data: Todo | Task | Plan | Target | Milestone;
    } | null,
  ) => void;
  hoverPosition: { x: number; y: number };
  setHoverPosition: (pos: { x: number; y: number }) => void;
}

export function ViewsBoard({
  todos,
  plans,
  targets,
  milestones,
  allTasks,
  filters,
  hoveredItem,
  setHoveredItem,
  hoverPosition,
  setHoverPosition,
}: ViewsBoardProps) {
  const columns = [
    { id: "pending", label: "待处理", color: "gray" },
    { id: "in-progress", label: "进行中", color: "orange" },
    { id: "done", label: "已完成", color: "green" },
  ];

  const getItemsByStatus = (status: string) => {
    const items: {
      type: string;
      data: Todo | Task | Plan | Target | Milestone;
    }[] = [];

    if (filters.todo)
      todos
        .filter((t) => t.status === status)
        .forEach((t) => items.push({ type: "todo", data: t }));
    if (filters.task)
      allTasks
        .filter((t) => t.status === status)
        .forEach((t) => items.push({ type: "task", data: t }));
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
        .forEach((p) => items.push({ type: "plan", data: p }));
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
        .forEach((t) => items.push({ type: "target", data: t }));
    if (filters.milestone)
      milestones
        .filter(
          (m) => m.status === (status === "done" ? "completed" : "pending"),
        )
        .forEach((m) => items.push({ type: "milestone", data: m }));

    return items;
  };

  const handleMouseEnter = (
    e: React.MouseEvent,
    item: { type: string; data: Todo | Task | Plan | Target | Milestone },
  ) => {
    setHoveredItem(item);
    setHoverPosition({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => setHoveredItem(null);

  return (
    <div className="relative h-full">
      <ItemTooltip hoveredItem={hoveredItem} hoverPosition={hoverPosition} />
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
            <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0 scroll-smooth scrollbar-hide-column">
              {getItemsByStatus(col.id).map((item, idx) => (
                <div
                  key={`${item.type}-${idx}`}
                  onMouseEnter={(e) => handleMouseEnter(e, item)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Card className="p-2 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span
                        className={`text-[10px] px-1 py-0.5 rounded ${
                          item.type === "todo"
                            ? "bg-blue-100 text-blue-700"
                            : item.type === "task"
                              ? "bg-teal-100 text-teal-700"
                              : item.type === "plan"
                                ? "bg-purple-100 text-purple-700"
                                : item.type === "target"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.type}
                      </span>
                    </div>
                    <div className="font-medium text-xs">
                      {"title" in item.data ? item.data.title : ""}
                    </div>
                    {"progress" in item.data && (
                      <div className="mt-1.5">
                        <ProgressBar
                          value={item.data.progress}
                          color={
                            col.color === "green"
                              ? "teal"
                              : (col.color as "gray" | "orange" | "teal")
                          }
                          size="sm"
                        />
                      </div>
                    )}
                  </Card>
                </div>
              ))}
              {getItemsByStatus(col.id).length === 0 && (
                <p className="text-gray-400 text-sm text-center py-4">无</p>
              )}
            </div>
            <style jsx global>{`
              .scrollbar-hide-column::-webkit-scrollbar {
                display: none;
              }
              .scrollbar-hide-column {
                -ms-overflow-style: none;
                scrollbar-width: none;
                scroll-behavior: smooth;
              }
            `}</style>
          </div>
        ))}
      </div>
    </div>
  );
}
