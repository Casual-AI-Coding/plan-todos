"use client";

import type { Todo, Task, Target, Milestone } from "@/lib/types";
import type { EntityItem, HoveredItem } from "@/app/views/views/types";
import { Icons } from "@/components/ui/Icons";

export interface ViewsCalendarProps {
  todos: Todo[];
  allTasks: Task[];
  targets: Target[];
  milestones: Milestone[];
  filters: {
    todo: boolean;
    task: boolean;
    plan: boolean;
    target: boolean;
    milestone: boolean;
  };
  calendarDate: Date;
  setCalendarDate: React.Dispatch<React.SetStateAction<Date>>;
  hoveredItem: HoveredItem | null;
  setHoveredItem: (item: HoveredItem | null) => void;
  hoverPosition: { x: number; y: number };
  setHoverPosition: (pos: { x: number; y: number }) => void;
  onNavigate?: (type: string, id: string) => void;
}

export function ViewsCalendar({
  todos,
  allTasks,
  targets,
  milestones,
  filters,
  calendarDate,
  setCalendarDate,
  setHoveredItem,
  setHoverPosition,
  onNavigate,
}: ViewsCalendarProps) {
  const currentMonth = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();

  let firstDay = new Date(currentYear, currentMonth, 1).getDay();
  firstDay = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];

  const getItemsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const items: EntityItem[] = [];

    if (filters.todo)
      todos
        .filter((t) => t.due_date === dateStr)
        .forEach((t) => items.push({ type: "todo", data: t }));
    if (filters.task)
      allTasks
        .filter((t) => t.end_date === dateStr)
        .forEach((t) => items.push({ type: "task", data: t }));
    if (filters.target)
      targets
        .filter((t) => t.due_date === dateStr)
        .forEach((t) => items.push({ type: "target", data: t }));
    if (filters.milestone)
      milestones
        .filter((m) => m.target_date === dateStr)
        .forEach((m) => items.push({ type: "milestone", data: m }));

    return items;
  };

  const dayNames = ["一", "二", "三", "四", "五", "六", "日"];
  const today = new Date();

  const prevMonth = () =>
    setCalendarDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () =>
    setCalendarDate(new Date(currentYear, currentMonth + 1, 1));

  const isWeekend = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6;
  };

  return (
    <div className="space-y-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg transition-colors hover:opacity-70"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Icons.ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Icons.CalendarDays
            size={20}
            style={{ color: "var(--color-primary)" }}
          />
          <h3
            className="text-xl font-semibold"
            style={{ color: "var(--color-text)" }}
          >
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg transition-colors hover:opacity-70"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Icons.ChevronRight size={20} />
        </button>
      </div>

      {/* Day names header */}
      <div className="grid grid-cols-7 gap-1">
        {dayNames.map((day, i) => (
          <div
            key={day}
            className="text-center text-sm font-medium py-2"
            style={{
              color: i >= 5 ? "var(--color-error)" : "var(--color-text-muted)",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="h-24 rounded"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          ></div>
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const items = getItemsForDay(day);
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
          const isWeekendDay = isWeekend(day);

          return (
            <div
              key={day}
              className={`h-24 p-1 border rounded transition-colors ${
                isToday
                  ? "bg-teal-50 border-teal-300"
                  : isWeekendDay
                    ? "bg-red-50/50 border-red-100"
                    : "bg-white border-gray-200"
              }`}
            >
              <div
                className={`text-sm font-medium ${isToday ? "text-teal-600" : isWeekendDay ? "text-red-500" : "text-gray-700"}`}
              >
                {day}
              </div>
              <div className="mt-1 space-y-1 overflow-y-auto max-h-14">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                      item.type === "todo"
                        ? "bg-blue-100 text-blue-700"
                        : item.type === "task"
                          ? "bg-teal-100 text-teal-700"
                          : item.type === "target"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-purple-100 text-purple-700"
                    }`}
                    onMouseEnter={(e) => {
                      setHoveredItem(item);
                      setHoverPosition({ x: e.clientX, y: e.clientY });
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => onNavigate?.(item.type, "id" in item.data ? item.data.id : "")}
                  >
                    {"title" in item.data ? item.data.title : ""}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-100"></span>
          <span style={{ color: "var(--color-text-muted)" }}>待办</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-teal-100"></span>
          <span style={{ color: "var(--color-text-muted)" }}>任务</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-orange-100"></span>
          <span style={{ color: "var(--color-text-muted)" }}>目标</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-purple-100"></span>
          <span style={{ color: "var(--color-text-muted)" }}>里程碑</span>
        </div>
        <div className="flex items-center gap-1 ml-4">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-100"></span>
          <span style={{ color: "var(--color-text-muted)" }}>周末</span>
        </div>
      </div>
    </div>
  );
}
