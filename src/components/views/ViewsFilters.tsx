"use client";

import type { Todo, Task, Plan, Target, Milestone } from "@/lib/types";

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

const filterOptions = [
  { id: "plan", label: "计划", color: "purple" },
  { id: "task", label: "任务", color: "teal" },
  { id: "target", label: "目标", color: "orange" },
  { id: "todo", label: "待办", color: "blue" },
  { id: "milestone", label: "里程碑", color: "pink" },
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
          className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          全选
        </button>
        <button
          onClick={handleInvert}
          disabled={noneSelected}
          className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50"
        >
          取反
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        {filterOptions.map((item) => (
          <label
            key={item.id}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-sm cursor-pointer transition-all ${
              filters[item.id as keyof typeof filters]
                ? `bg-${item.color}-100 text-${item.color}-700 border border-${item.color}-300`
                : "bg-gray-50 text-gray-400 border border-gray-200"
            }`}
          >
            <input
              type="checkbox"
              checked={filters[item.id as keyof typeof filters]}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  [item.id]: !prev[item.id as keyof typeof prev],
                }))
              }
              className="sr-only"
            />
            <span className="w-3 h-3 rounded border flex items-center justify-center">
              {filters[item.id as keyof typeof filters] && (
                <span className="text-[10px]">✓</span>
              )}
            </span>
            {item.label}
          </label>
        ))}
      </div>
    </div>
  );
}
