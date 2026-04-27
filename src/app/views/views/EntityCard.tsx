"use client";

import { ProgressBar } from "@/components/ui";
import { ENTITY_TYPE_CONFIG } from "./types";
import type { EntityItem } from "./types";

interface EntityCardProps {
  item: EntityItem;
  onHover: (item: EntityItem, event: React.MouseEvent) => void;
  onLeave: () => void;
  onClick?: (type: string, id: string) => void;
  showProgress?: boolean;
  progressColor?: "gray" | "orange" | "teal";
}

export function EntityCard({
  item,
  onHover,
  onLeave,
  onClick,
  showProgress = true,
  progressColor = "teal",
}: EntityCardProps) {
  const config = ENTITY_TYPE_CONFIG[item.type];
  const hasProgress = "progress" in item.data;
  const title = "title" in item.data ? item.data.title : "";
  const id = "id" in item.data ? item.data.id : "";

  return (
    <div
      className="p-2 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
      onMouseEnter={(e) => onHover(item, e)}
      onMouseLeave={onLeave}
      onClick={() => onClick?.(item.type, id)}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span
          className={`text-[10px] px-1 py-0.5 rounded ${config.bgColor} ${config.textColor}`}
        >
          {config.label}
        </span>
      </div>
      <div
        className="font-medium text-xs truncate"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </div>
      {showProgress && hasProgress && (
        <div className="mt-1.5">
          <ProgressBar
            value={(item.data as { progress: number }).progress}
            color={progressColor}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}
