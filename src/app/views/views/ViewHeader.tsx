"use client";

import { Button } from "@/components/ui";
import { ViewsFilters } from "@/components/views/ViewsFilters";
import type { ViewMode, FilterState } from "./types";

interface ViewHeaderProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "list", label: "列表" },
  { value: "board", label: "看板" },
  { value: "calendar", label: "日历" },
  { value: "gantt", label: "甘特图" },
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
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          视图查看
        </h2>
        <div className="flex gap-2">
          {VIEW_MODES.map((mode) => (
            <Button
              key={mode.value}
              variant={viewMode === mode.value ? "primary" : "secondary"}
              onClick={() => onViewModeChange(mode.value)}
            >
              {mode.label}
            </Button>
          ))}
        </div>
      </div>
      <ViewsFilters filters={filters} setFilters={setFilters} />
    </div>
  );
}
