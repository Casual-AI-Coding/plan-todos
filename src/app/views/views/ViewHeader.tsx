"use client";

import { Button } from "@/components/ui";
import { ViewsFilters } from "@/components/views/ViewsFilters";
import { Icons } from "@/components/ui/Icons";
import type { ViewMode, FilterState } from "./types";
import type { LucideIcon } from "lucide-react";

interface ViewHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const VIEW_MODES: { value: ViewMode; label: string; icon: LucideIcon }[] = [
  { value: "list", label: "列表", icon: Icons.List },
  { value: "board", label: "看板", icon: Icons.LayoutGrid },
  { value: "calendar", label: "日历", icon: Icons.CalendarDays },
  { value: "gantt", label: "甘特图", icon: Icons.GanttChart },
];

export function ViewHeader({
  viewMode,
  onViewModeChange,
  filters,
  setFilters,
}: ViewHeaderProps) {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icons.Eye size={24} style={{ color: "var(--color-primary)" }} />
          <h2
            className="text-2xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            视图查看
          </h2>
        </div>
        <div className="flex gap-2">
          {VIEW_MODES.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <Button
                key={mode.value}
                variant={viewMode === mode.value ? "primary" : "secondary"}
                onClick={() => onViewModeChange(mode.value)}
                className="flex items-center gap-1.5"
              >
                <IconComponent size={16} />
                {mode.label}
              </Button>
            );
          })}
        </div>
      </div>
      <ViewsFilters filters={filters} setFilters={setFilters} />
    </div>
  );
}
