"use client";

import type { HoveredItem } from "@/app/views/views/types";

interface ItemTooltipProps {
  hoveredItem: HoveredItem | null;
  hoverPosition: { x: number; y: number };
}

const typeLabels: Record<string, string> = {
  todo: "待办",
  task: "任务",
  plan: "计划",
  target: "目标",
  milestone: "里程碑",
};

const statusColors: Record<string, { bg: string; text: string }> = {
  done: { bg: "bg-green-100", text: "text-green-700" },
  completed: { bg: "bg-green-100", text: "text-green-700" },
  in_progress: { bg: "bg-orange-100", text: "text-orange-700" },
  active: { bg: "bg-orange-100", text: "text-orange-700" },
  pending: { bg: "bg-gray-100", text: "text-gray-600" },
};

export function ItemTooltip({ hoveredItem, hoverPosition }: ItemTooltipProps) {
  if (!hoveredItem) return null;

  const data = hoveredItem.data;
  const statusKey = String(data.status);
  const statusStyle = statusColors[statusKey] || statusColors.pending;

  return (
    <div
      className="fixed z-50 rounded-lg shadow-lg p-3 min-w-[200px] border"
      style={{
        left: hoverPosition.x + 10,
        top: hoverPosition.y + 10,
        pointerEvents: "none",
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
    >
      <div
        className="font-medium text-sm mb-2"
        style={{ color: "var(--color-primary)" }}
      >
        {typeLabels[hoveredItem.type]}详情
      </div>
      <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
        {"title" in data ? data.title : ""}
      </div>
      {"description" in data && data.description && (
        <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          {data.description}
        </div>
      )}
      {"status" in data && (
        <div className="text-xs mt-2">
          状态:{" "}
          <span className={`px-1.5 py-0.5 rounded ${statusStyle.bg} ${statusStyle.text}`}>
            {data.status}
          </span>
        </div>
      )}
      {"progress" in data && (
        <div className="mt-2">
          <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
            进度: {data.progress}%
          </div>
          <div
            className="w-full h-1.5 rounded mt-1"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          >
            <div
              className="h-full rounded"
              style={{
                width: `${data.progress}%`,
                backgroundColor: "var(--color-primary)",
              }}
            ></div>
          </div>
        </div>
      )}
      {"due_date" in data && data.due_date && (
        <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          📅 {data.due_date}
        </div>
      )}
      {"start_date" in data && data.start_date && (
        <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          开始: {data.start_date}
        </div>
      )}
      {"end_date" in data && data.end_date && (
        <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
          结束: {data.end_date}
        </div>
      )}
    </div>
  );
}
