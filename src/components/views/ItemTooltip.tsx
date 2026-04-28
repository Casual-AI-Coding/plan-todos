"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  return (
    <AnimatePresence>
      {hoveredItem && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 5 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          style={{
            left: Math.min(hoverPosition.x + 10, typeof window !== "undefined" ? window.innerWidth - 220 : 500),
            top: Math.min(hoverPosition.y + 10, typeof window !== "undefined" ? window.innerHeight - 200 : 500),
            pointerEvents: "none",
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
          }}
          className="fixed z-50 rounded-lg shadow-lg p-3 min-w-[200px] border"
        >
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="font-medium text-sm mb-2"
              style={{ color: "var(--color-primary)" }}
            >
              {typeLabels[hoveredItem.type]}详情
            </div>
            <div className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {"title" in hoveredItem.data ? hoveredItem.data.title : ""}
            </div>
            {"description" in hoveredItem.data && hoveredItem.data.description && (
              <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                {hoveredItem.data.description}
              </div>
            )}
            {"status" in hoveredItem.data && (
              <div className="text-xs mt-2">
                状态:{" "}
                <span className={`px-1.5 py-0.5 rounded ${statusColors[String(hoveredItem.data.status)]?.bg || "bg-gray-100"} ${statusColors[String(hoveredItem.data.status)]?.text || "text-gray-600"}`}>
                  {hoveredItem.data.status}
                </span>
              </div>
            )}
            {"progress" in hoveredItem.data && (
              <div className="mt-2">
                <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  进度: {hoveredItem.data.progress}%
                </div>
                <div className="w-full h-1.5 rounded mt-1" style={{ backgroundColor: "var(--color-bg-hover)" }}>
                  <motion.div
                    className="h-full rounded"
                    initial={{ width: 0 }}
                    animate={{ width: `${hoveredItem.data.progress}%` }}
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />
                </div>
              </div>
            )}
            {"due_date" in hoveredItem.data && hoveredItem.data.due_date && (
              <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                📅 {hoveredItem.data.due_date}
              </div>
            )}
            {"start_date" in hoveredItem.data && hoveredItem.data.start_date && (
              <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                开始: {hoveredItem.data.start_date}
              </div>
            )}
            {"end_date" in hoveredItem.data && hoveredItem.data.end_date && (
              <div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
                结束: {hoveredItem.data.end_date}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}