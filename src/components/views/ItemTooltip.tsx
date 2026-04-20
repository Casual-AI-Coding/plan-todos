"use client";

import type { Todo, Task, Plan, Target, Milestone } from "@/lib/types";

interface ItemTooltipProps {
  hoveredItem: {
    type: string;
    data: Todo | Task | Plan | Target | Milestone;
  } | null;
  hoverPosition: { x: number; y: number };
}

const typeLabels: Record<string, string> = {
  todo: "待办",
  task: "任务",
  plan: "计划",
  target: "目标",
  milestone: "里程碑",
};

export function ItemTooltip({ hoveredItem, hoverPosition }: ItemTooltipProps) {
  if (!hoveredItem) return null;

  const data = hoveredItem.data;

  return (
    <div
      className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3 min-w-[200px]"
      style={{
        left: hoverPosition.x + 10,
        top: hoverPosition.y + 10,
        pointerEvents: "none",
      }}
    >
      <div
        className="font-medium text-sm mb-2"
        style={{ color: "var(--color-text)" }}
      >
        {typeLabels[hoveredItem.type]}详情
      </div>
      <div className="text-sm font-medium">
        {"title" in data ? data.title : ""}
      </div>
      {"description" in data && data.description && (
        <div className="text-xs text-gray-500 mt-1">{data.description}</div>
      )}
      {"status" in data && (
        <div className="text-xs mt-2">
          状态:{" "}
          <span
            className={`px-1.5 py-0.5 rounded ${
              data.status === "done" || data.status === "completed"
                ? "bg-green-100 text-green-700"
                : data.status === "in-progress" || data.status === "active"
                  ? "bg-orange-100 text-orange-700"
                  : "bg-gray-100 text-gray-600"
            }`}
          >
            {data.status}
          </span>
        </div>
      )}
      {"progress" in data && (
        <div className="mt-2">
          <div className="text-xs text-gray-500">进度: {data.progress}%</div>
          <div className="w-full h-1.5 bg-gray-200 rounded mt-1">
            <div
              className="h-full bg-teal-500 rounded"
              style={{ width: `${data.progress}%` }}
            ></div>
          </div>
        </div>
      )}
      {"due_date" in data && data.due_date && (
        <div className="text-xs text-gray-500 mt-1">📅 {data.due_date}</div>
      )}
      {"start_date" in data && data.start_date && (
        <div className="text-xs text-gray-500 mt-1">
          开始: {data.start_date}
        </div>
      )}
      {"end_date" in data && data.end_date && (
        <div className="text-xs text-gray-500 mt-1">结束: {data.end_date}</div>
      )}
    </div>
  );
}
