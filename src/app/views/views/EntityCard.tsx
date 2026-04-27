"use client";

import { ProgressBar } from "@/components/ui";
import { ENTITY_TYPE_CONFIG } from "./types";
import type { EntityItem } from "./types";

interface EntityCardProps {
  item: EntityItem;
  onHover?: (item: EntityItem, event: React.MouseEvent) => void;
  onLeave?: () => void;
  onClick?: (type: string, id: string) => void;
  showProgress?: boolean;
  progressColor?: "gray" | "orange" | "teal";
  showIcon?: boolean;
}

export function EntityCard({
  item,
  onHover,
  onLeave,
  onClick,
  showProgress = true,
  progressColor = "teal",
  showIcon = true,
}: EntityCardProps) {
  const config = ENTITY_TYPE_CONFIG[item.type];
  const hasProgress = "progress" in item.data;
  const title = "title" in item.data ? item.data.title : "";
  const id = "id" in item.data ? item.data.id : "";
  const IconComponent = config.icon;

  return (
    <div
      className="p-2.5 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 hover:border-opacity-80"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: config.borderColor,
      }}
      onMouseEnter={(e) => onHover?.(item, e)}
      onMouseLeave={() => onLeave?.()}
      onClick={() => onClick?.(item.type, id)}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {showIcon && IconComponent && (
          <IconComponent
            size={14}
            style={{ color: config.accentColor }}
            className="shrink-0"
          />
        )}
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.textColor}`}
        >
          {config.label}
        </span>
      </div>
      <div
        className="font-medium text-sm truncate"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </div>
      {showProgress && hasProgress && (
        <div className="mt-2">
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
