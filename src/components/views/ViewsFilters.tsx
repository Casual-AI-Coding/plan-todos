"use client";

import { Icons } from "@/components/ui/Icons";
import type { LucideIcon } from "lucide-react";

export interface ViewsFiltersProps {
  filters: {
    todo: boolean;
    task: boolean;
    plan: boolean;
    target: boolean;
    milestone: boolean;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      todo: boolean;
      task: boolean;
      plan: boolean;
      target: boolean;
      milestone: boolean;
    }>
  >;
}

const filterOptions: {
  id: string;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: LucideIcon;
}[] = [
  {
    id: "plan",
    label: "计划",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    borderColor: "border-purple-300",
    icon: Icons.FolderOpen,
  },
  {
    id: "task",
    label: "任务",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
    borderColor: "border-teal-300",
    icon: Icons.Activity,
  },
  {
    id: "target",
    label: "目标",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-300",
    icon: Icons.Target,
  },
  {
    id: "todo",
    label: "待办",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-300",
    icon: Icons.LayoutGrid,
  },
  {
    id: "milestone",
    label: "里程碑",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    borderColor: "border-gray-300",
    icon: Icons.Flag,
  },
];

export function ViewsFilters({ filters, setFilters }: ViewsFiltersProps) {
  const allSelected = Object.values(filters).every((v) => v);
  const noneSelected = Object.values(filters).every((v) => !v);

  const handleSelectAll = () => {
    setFilters({
      todo: true,
      task: true,
      plan: true,
      target: true,
      milestone: true,
    });
  };

  const handleInvert = () => {
    setFilters({
      todo: !filters.todo,
      task: !filters.task,
      plan: !filters.plan,
      target: !filters.target,
      milestone: !filters.milestone,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      <div className="flex gap-2">
        <button
          onClick={handleSelectAll}
          disabled={allSelected}
          className="px-3 py-1.5 text-xs rounded-lg transition-colors"
          style={{
            backgroundColor: allSelected
              ? "var(--color-bg-hover)"
              : "var(--color-bg-card)",
            color: "var(--color-text-muted)",
            opacity: allSelected ? 0.5 : 1,
          }}
        >
          全选
        </button>
        <button
          onClick={handleInvert}
          disabled={noneSelected}
          className="px-3 py-1.5 text-xs rounded-lg transition-colors"
          style={{
            backgroundColor: noneSelected
              ? "var(--color-bg-hover)"
              : "var(--color-bg-card)",
            color: "var(--color-text-muted)",
            opacity: noneSelected ? 0.5 : 1,
          }}
        >
          取反
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {filterOptions.map((item) => {
          const isSelected = filters[item.id as keyof typeof filters];
          const IconComponent = item.icon;
          return (
            <label
              key={item.id}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm cursor-pointer transition-all ${
                isSelected
                  ? `${item.bgColor} ${item.textColor} ${item.borderColor}`
                  : "bg-gray-50 text-gray-400 border border-gray-200"
              } border`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    [item.id]: !prev[item.id as keyof typeof prev],
                  }))
                }
                className="sr-only"
              />
              <IconComponent size={14} className="shrink-0" />
              {item.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
