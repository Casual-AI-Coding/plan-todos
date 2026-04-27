"use client";

import type { Todo, Task, Plan, Target, Milestone } from "@/lib/types";
import { Icons } from "@/components/ui/Icons";

export interface ViewsGanttProps {
  todos: Todo[];
  allTasks: Task[];
  plans: Plan[];
  targets: Target[];
  milestones: Milestone[];
  filters: {
    todo: boolean;
    task: boolean;
    plan: boolean;
    target: boolean;
    milestone: boolean;
  };
  ganttZoom: number;
  setGanttZoom: React.Dispatch<React.SetStateAction<number>>;
  onNavigate?: (type: string, id: string) => void;
}

const typeColors: Record<string, { bg: string; bgCompleted: string }> = {
  plan: { bg: "bg-purple-400", bgCompleted: "bg-purple-500" },
  task: { bg: "bg-teal-400", bgCompleted: "bg-teal-500" },
  target: { bg: "bg-orange-400", bgCompleted: "bg-orange-500" },
  todo: { bg: "bg-blue-400", bgCompleted: "bg-blue-500" },
  milestone: { bg: "bg-gray-400", bgCompleted: "bg-gray-500" },
};

export function ViewsGantt({
  todos,
  allTasks,
  plans,
  targets,
  milestones,
  filters,
  ganttZoom,
  setGanttZoom,
  onNavigate,
}: ViewsGanttProps) {
  const today = new Date();
  const monthsToShow = ganttZoom;
  const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endDate = new Date(
    today.getFullYear(),
    today.getMonth() + monthsToShow - 1,
    0,
  );
  const totalDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const months: {
    label: string;
    startPercent: number;
    widthPercent: number;
  }[] = [];
  let currentMonth = startDate.getMonth();
  let currentYear = startDate.getFullYear();
  const monthNames = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];

  while (
    currentYear < today.getFullYear() + 2 ||
    (currentYear === today.getFullYear() + 1 &&
      currentMonth <= endDate.getMonth())
  ) {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);

    const startPercent = Math.max(
      0,
      ((monthStart.getTime() - startDate.getTime()) /
        (totalDays * 24 * 60 * 60 * 1000)) *
        100,
    );
    const endPercent = Math.min(
      100,
      ((monthEnd.getTime() - startDate.getTime()) /
        (totalDays * 24 * 60 * 60 * 1000)) *
        100,
    );

    months.push({
      label: monthNames[currentMonth],
      startPercent,
      widthPercent: endPercent - startPercent,
    });

    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
  }

  const getPosition = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const days = (date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    if (days < 0 || days > totalDays) return null;
    return (days / totalDays) * 100;
  };

  const getWidth = (startDateStr: string | null, endDateStr: string | null) => {
    if (!startDateStr || !endDateStr) return null;
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const days = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (days <= 0) return null;
    return (days / totalDays) * 100;
  };

  const isToday = (dateStr: string | null | undefined) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    return date.toDateString() === today.toDateString();
  };

  const allItems: {
    type: string;
    title: string;
    start?: string | null;
    end?: string | null;
    due?: string | null;
    status: string;
    progress?: number;
    id?: string;
  }[] = [];

  if (filters.plan) {
    plans.forEach((p) => {
      const pos = getPosition(p.start_date);
      if (pos !== null) {
        allItems.push({
          type: "plan",
          title: p.title,
          start: p.start_date,
          end: p.end_date,
          status: p.status,
          progress: 100,
          id: p.id,
        });
      }
    });
  }

  if (filters.task) {
    allTasks.forEach((t) => {
      const pos = getPosition(t.start_date);
      if (pos !== null) {
        allItems.push({
          type: "task",
          title: t.title,
          start: t.start_date,
          end: t.end_date,
          status: t.status,
          id: t.id,
        });
      }
    });
  }

  if (filters.target) {
    targets.forEach((t) => {
      const pos = getPosition(t.due_date);
      if (pos !== null) {
        allItems.push({
          type: "target",
          title: t.title,
          due: t.due_date,
          status: t.status,
          progress: t.progress,
          id: t.id,
        });
      }
    });
  }

  if (filters.todo) {
    todos
      .filter((t) => t.due_date)
      .forEach((t) => {
        const pos = getPosition(t.due_date);
        if (pos !== null) {
          allItems.push({
            type: "todo",
            title: t.title,
            due: t.due_date,
            status: t.status,
            id: t.id,
          });
        }
      });
  }

  if (filters.milestone) {
    milestones
      .filter((m) => m.target_date)
      .forEach((m) => {
        const pos = getPosition(m.target_date);
        if (pos !== null) {
          allItems.push({
            type: "milestone",
            title: m.title,
            due: m.target_date,
            status: m.status,
            progress: m.progress,
            id: m.id,
          });
        }
      });
  }

  const getTypeColor = (type: string, status: string) => {
    const completed = status === "done" || status === "completed";
    const colors = typeColors[type] || typeColors.todo;
    return completed ? colors.bgCompleted : colors.bg;
  };

  const timelineWidth = Math.max(800, 100 * ganttZoom);

  return (
    <div
      className="w-full p-4 rounded-lg"
      style={{ backgroundColor: "var(--color-bg-hover)" }}
    >
      <div className="flex items-center gap-3 mb-4 px-2">
        <Icons.GanttChart size={16} style={{ color: "var(--color-primary)" }} />
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          显示范围:
        </span>
        <input
          type="range"
          min="1"
          max="12"
          value={ganttZoom}
          onChange={(e) => setGanttZoom(Number(e.target.value))}
          className="w-32 h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{ backgroundColor: "var(--color-bg-hover)" }}
        />
        <span
          className="text-xs w-12"
          style={{ color: "var(--color-text)" }}
        >
          {ganttZoom} 个月
        </span>
      </div>

      <div className="overflow-hidden">
        <div style={{ width: `${timelineWidth}px` }}>
          <div className="relative h-8 border-b mb-2" style={{ borderColor: "var(--color-border)" }}>
            {months.map((month, i) => (
              <div
                key={i}
                className="absolute text-xs pl-1 font-medium border-l"
                style={{
                  left: `${month.startPercent}%`,
                  width: `${month.widthPercent}%`,
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                }}
              >
                {month.label}
              </div>
            ))}
          </div>

          <div
            className="relative space-y-1 p-2 rounded"
            style={{ backgroundColor: "var(--color-bg-card)" }}
          >
            {allItems.map((item, idx) => {
              const startPos = item.start
                ? getPosition(item.start)
                : item.due
                  ? getPosition(item.due)
                  : null;
              const width =
                item.start && item.end ? getWidth(item.start, item.end) : 5;

              if (startPos === null) return null;

              return (
                <div
                  key={`${item.type}-${idx}`}
                  className="flex items-center h-8 group cursor-pointer rounded transition-colors"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                  onClick={() => onNavigate?.(item.type, item.id || "")}
                >
                  <div
                    className="w-28 flex-shrink-0 text-xs truncate pr-2 font-medium flex items-center gap-1"
                    style={{ color: "var(--color-text)" }}
                  >
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        item.type === "plan"
                          ? "bg-purple-500"
                          : item.type === "task"
                            ? "bg-teal-500"
                            : item.type === "target"
                              ? "bg-orange-500"
                              : item.type === "todo"
                                ? "bg-blue-500"
                                : "bg-gray-500"
                      }`}
                    ></span>
                    {item.title}
                  </div>
                  <div
                    className="flex-1 h-full relative rounded"
                    style={{ backgroundColor: "var(--color-bg-hover)" }}
                  >
                    <div
                      className={`absolute h-6 top-1 rounded ${getTypeColor(item.type, item.status)}`}
                      style={{
                        left: `${startPos}%`,
                        width: `${Math.max(width || 5, 5)}%`,
                        minWidth: "20px",
                        boxShadow: "var(--shadow-sm)",
                      }}
                    >
                      {item.progress !== undefined && item.progress < 100 && (
                        <div
                          className="absolute h-full bg-white/30 rounded-sm"
                          style={{
                            width: `${100 - item.progress}%`,
                            right: 0,
                          }}
                        ></div>
                      )}
                    </div>
                    {isToday(item.start || item.due) && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 z-10"
                        style={{
                          left: `${startPos}%`,
                          backgroundColor: "var(--color-error)",
                        }}
                      ></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center mt-4 text-xs" style={{ color: "var(--color-text-muted)" }}>
            <div className="w-28 flex-shrink-0 flex items-center gap-1">
              <Icons.Calendar size={14} style={{ color: "var(--color-error)" }} />
              今日
            </div>
            <div className="flex-1 relative h-4">
              <div
                className="absolute w-0.5 top-0 bottom-0 flex flex-col items-center"
                style={{
                  left: `${((today.getTime() - startDate.getTime()) / (totalDays * 24 * 60 * 60 * 1000)) * 100}%`,
                  backgroundColor: "var(--color-error)",
                }}
              >
                <span className="-mt-4 text-[10px] whitespace-nowrap" style={{ color: "var(--color-error)" }}>
                  今天
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 justify-center text-xs">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-purple-400"></span>
              <span style={{ color: "var(--color-text-muted)" }}>计划</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-orange-400"></span>
              <span style={{ color: "var(--color-text-muted)" }}>目标</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-blue-400"></span>
              <span style={{ color: "var(--color-text-muted)" }}>待办</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-gray-400"></span>
              <span style={{ color: "var(--color-text-muted)" }}>里程碑</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-1 rounded" style={{ backgroundColor: "var(--color-error)" }}></span>
              <span style={{ color: "var(--color-text-muted)" }}>今日</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
