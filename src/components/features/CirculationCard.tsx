"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Button } from "@/components/ui";
import type { Circulation } from "@/lib/api";

export interface TodayStats {
  count: number;
  progress: number;
}

export interface CirculationCardProps {
  circulation: Circulation;
  todayStats: Record<string, TodayStats>;
  isCompletedToday: boolean;
  onCheckin: () => void;
  onUndo: () => void;
  onViewDetail: () => void;
}

export function CirculationCard({
  circulation,
  todayStats,
  isCompletedToday,
  onCheckin,
  onUndo,
  onViewDetail,
}: CirculationCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: circulation.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto",
  };

  const isPeriodic = circulation.circulation_type === "periodic";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="col-span-1"
      {...attributes}
      {...listeners}
    >
      <Card className="hover:shadow-md transition-all cursor-grab active:cursor-grabbing">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div
              className="font-semibold cursor-pointer hover:opacity-80 truncate flex items-center gap-1"
              onClick={onViewDetail}
              title={circulation.title}
            >
              {isPeriodic ? (
                <span className="text-lg">🔄</span>
              ) : (
                <span className="text-lg">📊</span>
              )}
              <span style={{ color: "var(--color-text)" }}>
                {circulation.title}
              </span>
            </div>
            {/* Status Badge */}
            <div className="flex items-center gap-1">
              {isPeriodic ? (
                isCompletedToday ? (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "var(--color-success)",
                      color: "var(--color-text-inverse)",
                      opacity: 0.9,
                    }}
                  >
                    ✓ 已完成
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "var(--color-warning)",
                      color: "var(--color-text-inverse)",
                      opacity: 0.9,
                    }}
                  >
                    ○ 待打卡
                  </span>
                )
              ) : (
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: "var(--color-accent)",
                    color: "var(--color-text-inverse)",
                    opacity: 0.9,
                  }}
                >
                  计数打卡
                </span>
              )}
            </div>
          </div>

          {/* Type Label */}
          <div
            className="text-xs mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            {isPeriodic
              ? "周期打卡"
              : `今日已打卡 ${todayStats[circulation.id]?.count || 0} 次 · 进度 +${todayStats[circulation.id]?.progress || 0}`}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {isPeriodic ? (
              <>
                <div
                  className="rounded-md p-2 text-center"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: "var(--color-primary)" }}
                  >
                    {circulation.streak_count}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    连续天数
                  </div>
                </div>
                <div
                  className="rounded-md p-2 text-center"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: "var(--color-warning)" }}
                  >
                    {circulation.best_streak}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    最佳记录
                  </div>
                </div>
              </>
            ) : (
              <>
                <div
                  className="rounded-md p-2 text-center"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {todayStats[circulation.id]?.count || 0}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    今日次数
                  </div>
                </div>
                <div
                  className="rounded-md p-2 text-center"
                  style={{ backgroundColor: "var(--color-bg-hover)" }}
                >
                  <div
                    className="text-xl font-bold"
                    style={{ color: "var(--color-success)" }}
                  >
                    +{todayStats[circulation.id]?.progress || 0}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    今日进度
                  </div>
                </div>
              </>
            )}
            {!isPeriodic && circulation.target_count && (
              <div
                className="col-span-2 rounded-md p-2"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    总进度
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--color-accent)" }}
                  >
                    {circulation.current_count} / {circulation.target_count}
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-2"
                  style={{ backgroundColor: "var(--color-border-light)" }}
                >
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min((circulation.current_count / circulation.target_count) * 100, 100)}%`,
                      backgroundColor: "var(--color-accent)",
                    }}
                  />
                </div>
              </div>
            )}
            {circulation.last_completed_at && (
              <div
                className="col-span-2 rounded-md p-2 text-center"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
              >
                <div className="text-sm" style={{ color: "var(--color-text)" }}>
                  {new Date(circulation.last_completed_at).toLocaleDateString(
                    "zh-CN",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  上次打卡
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-auto">
            {isPeriodic ? (
              isCompletedToday ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={onUndo}
                >
                  撤销打卡
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={onCheckin}
                >
                  立即打卡
                </Button>
              )
            ) : (
              <Button size="sm" className="flex-1 text-xs" onClick={onCheckin}>
                打卡 +1
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              className="text-xs px-3"
              onClick={onViewDetail}
            >
              详情
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
