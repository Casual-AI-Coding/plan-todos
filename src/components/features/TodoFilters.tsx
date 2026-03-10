"use client";

import type { Priority, Tag } from "@/lib/types";

export type FilterType = "all" | "today" | "upcoming" | "completed";

export interface TodoFiltersProps {
  filter: FilterType;
  priorityFilter: Priority | "all";
  tagFilters: string[];
  searchQuery: string;
  viewMode: "list" | "calendar";
  allTags: Tag[];
  showPriorityDropdown: boolean;
  showTagDropdown: boolean;
  onFilterChange: (filter: FilterType) => void;
  onPriorityFilterChange: (priority: Priority | "all") => void;
  onTagFilterChange: (tags: string[]) => void;
  onSearchChange: (query: string) => void;
  onViewModeChange: (mode: "list" | "calendar") => void;
  onPriorityDropdownToggle: () => void;
  onTagDropdownToggle: () => void;
}

export function TodoFilters({
  filter,
  priorityFilter,
  tagFilters,
  searchQuery,
  viewMode,
  allTags,
  showPriorityDropdown,
  showTagDropdown,
  onFilterChange,
  onPriorityFilterChange,
  onTagFilterChange,
  onSearchChange,
  onViewModeChange,
  onPriorityDropdownToggle,
  onTagDropdownToggle,
}: TodoFiltersProps) {
  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "全部" },
    { id: "today", label: "今日" },
    { id: "upcoming", label: "即将到期" },
    { id: "completed", label: "已完成" },
  ];

  return (
    <>
      {/* Row 1: Status tabs + View toggle */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex gap-1">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => onFilterChange(f.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? "bg-teal-100 text-teal-700"
                  : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onViewModeChange("list")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-teal-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            列表
          </button>
          <button
            onClick={() => onViewModeChange("calendar")}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-teal-500 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            日历
          </button>
        </div>
      </div>

      {/* Row 2: Priority dropdown + Tag dropdown + Search */}
      <div className="flex gap-2 mb-4 items-center">
        {/* Priority dropdown */}
        <div className="relative">
          <button
            onClick={onPriorityDropdownToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1 ${
              priorityFilter !== "all"
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {priorityFilter === "all" ? "优先级" : priorityFilter}
            <span className="text-xs">▼</span>
          </button>
          {showPriorityDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[120px]">
              {(["all", "P0", "P1", "P2", "P3"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => onPriorityFilterChange(p)}
                  className={`w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${
                    priorityFilter === p
                      ? "text-teal-600 font-medium"
                      : "text-gray-600"
                  }`}
                >
                  {p === "all"
                    ? "全部"
                    : p === "P0"
                      ? "P0 紧急"
                      : p === "P1"
                        ? "P1 重要"
                        : p === "P2"
                          ? "P2 普通"
                          : "P3 低"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tag dropdown */}
        <div className="relative">
          <button
            onClick={onTagDropdownToggle}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors flex items-center gap-1 ${
              tagFilters.length > 0
                ? "border-teal-500 bg-teal-50 text-teal-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {tagFilters.length === 0 ? "标签" : `+${tagFilters.length} 标签`}
            <span className="text-xs">▼</span>
          </button>
          {showTagDropdown && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 min-w-[150px]">
              {allTags.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">暂无标签</div>
              ) : (
                allTags.map((tag) => (
                  <button
                    key={tag.id}
                    onClick={() =>
                      onTagFilterChange(
                        tagFilters.includes(tag.id)
                          ? tagFilters.filter((t) => t !== tag.id)
                          : [...tagFilters, tag.id],
                      )
                    }
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center ${
                        tagFilters.includes(tag.id)
                          ? "bg-teal-500 border-teal-500"
                          : "border-gray-300"
                      }`}
                    >
                      {tagFilters.includes(tag.id) && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </span>
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span
                      className={
                        tagFilters.includes(tag.id) ? "font-medium" : ""
                      }
                    >
                      {tag.name}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="w-64 relative ml-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="搜索..."
            aria-label="搜索待办事项"
            className="w-full px-3 py-1.5 pr-8 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="清除搜索"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </>
  );
}
