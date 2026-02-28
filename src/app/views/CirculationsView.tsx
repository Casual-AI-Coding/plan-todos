"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, Button, Modal, Input } from "@/components/ui";
import { CheckinConfirm } from "@/components/ui/CheckinConfirm";
import { EmptyStateCard } from "@/components/ui/EmptyStateCard";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CirculationDetailView } from "./CirculationDetailView";
import {
  CirculationForm,
  type CirculationFormData,
} from "@/components/features/CirculationForm";
import {
  CirculationCard,
  type TodayStats,
} from "@/components/features/CirculationCard";
import {
  useCirculations,
  useCreateCirculation,
  useUpdateCirculation,
  useDeleteCirculation,
  useCheckinCirculation,
  useUndoCheckinCirculation,
} from "@/hooks/useCirculations";
import {
  type Circulation,
  type CirculationType,
  type PeriodicFrequency,
} from "@/lib/api";

type ViewMode = "today" | "settings";
type SettingsTab = "periodic" | "count";
type PeriodicSubTab = "daily" | "weekly" | "monthly";

interface CirculationsViewProps {
  mode?: ViewMode;
}

// Sortable Card Component
interface SortableCardProps {
  circulation: Circulation;
  todayStats: Record<string, TodayStats>;
  isCompletedToday: boolean;
  onCheckin: () => void;
  onUndo: () => void;
  onViewDetail: () => void;
  index?: number;
}

function SortableCard({
  circulation,
  todayStats,
  isCompletedToday,
  onCheckin,
  onUndo,
  onViewDetail,
  index,
}: SortableCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const delay = 30 + (index || 0) * 60;
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [index]);

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

  // Spring-like animation easing
  const springEasing = isVisible
    ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
    : "cubic-bezier(0.22, 1, 0.36, 1)";

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        transition: `all 500ms ${springEasing}`,
      }}
      className={`col-span-1 ${
        isVisible
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-8 scale-90"
      }`}
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

export function CirculationsView({ mode = "today" }: CirculationsViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(mode);

  // React Query for data fetching
  const { data: circulations = [], isLoading } = useCirculations();

  // Track if stats are being loaded
  const [statsLoading, setStatsLoading] = useState(false);

  // React Query mutations
  const createMutation = useCreateCirculation();
  const updateMutation = useUpdateCirculation();
  const deleteMutation = useDeleteCirculation();
  const checkinMutation = useCheckinCirculation();
  const undoMutation = useUndoCheckinCirculation();

  // Compute today's circulations using useMemo
  const todayCirculations = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    return circulations.filter((c) => {
      if (c.status !== "active") return false;
      if (c.circulation_type === "count") return true;
      if (c.frequency === "daily") return true;
      if (c.frequency === "weekly" && dayOfWeek === 1) return true;
      if (c.frequency === "monthly" && today.getDate() === 1) return true;
      return false;
    });
  }, [circulations]);

  // Ordered circulations for DnD - initialized from todayCirculations
  // Using state to preserve user's drag-and-drop order
  const [todayCirculationsOrdered, setTodayCirculationsOrdered] = useState<
    Circulation[]
  >([]);

  // Initialize ordered list when todayCirculations changes (only if empty or length differs)
  useEffect(() => {
    setTodayCirculationsOrdered((prev) => {
      // Only update if length differs (avoids unnecessary re-renders)
      if (prev.length !== todayCirculations.length) {
        return todayCirculations;
      }
      return prev;
    });
  }, [todayCirculations]);

  // Stats for count-type circulations (BATCHED - prevents N+1 query problem)
  const [todayStats, setTodayStats] = useState<Record<string, TodayStats>>({});

  // Settings tabs
  const [settingsTab, setSettingsTab] = useState<SettingsTab>("periodic");
  const [periodicSubTab, setPeriodicSubTab] = useState<PeriodicSubTab>("daily");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingCirculation, setEditingCirculation] =
    useState<Circulation | null>(null);
  const [title, setTitle] = useState("");
  const [circulationType, setCirculationType] =
    useState<CirculationType>("periodic");
  const [frequency, setFrequency] = useState<PeriodicFrequency>("daily");
  const [targetCount, setTargetCount] = useState<number | "">("");

  // Checkin state
  const [checkinTarget, setCheckinTarget] = useState<Circulation | null>(null);
  const [_checkinLoading, setCheckinLoading] = useState(false);

  // Detail modal state
  const [detailCirculation, setDetailCirculation] =
    useState<Circulation | null>(null);

  // Load today's stats for count-type circulations (BATCHED to prevent N+1 problem)
  useEffect(() => {
    const loadStats = async () => {
      const stats: Record<string, TodayStats> = {};
      const todayStr = new Date().toISOString().split("T")[0];
      const countCirculations = todayCirculations.filter(
        (c) => c.circulation_type === "count",
      );

      // Early return if no count-type circulations
      if (countCirculations.length === 0) {
        setTodayStats({});
        setStatsLoading(false);
        return;
      }

      setStatsLoading(true);

      try {
        // BATCH: Get all logs in a single Tauri command call
        const { getCirculationLogsBatch } = await import("@/lib/api");
        const allLogs = await getCirculationLogsBatch(
          countCirculations.map((c) => c.id),
          50,
        );

        // Process logs for each circulation
        countCirculations.forEach((c) => {
          const logs = allLogs[c.id] || [];
          const todayLogs = logs.filter((log) =>
            log.completed_at.startsWith(todayStr),
          );
          stats[c.id] = {
            count: todayLogs.length,
            progress: todayLogs.reduce((sum, log) => sum + (log.count || 0), 0),
          };
        });
      } catch (error) {
        console.error("Failed to load circulation stats:", error);
        // Set empty stats on error
        countCirculations.forEach((c) => {
          stats[c.id] = { count: 0, progress: 0 };
        });
      } finally {
        setStatsLoading(false);
      }

      setTodayStats(stats);
    };
    loadStats();
  }, [todayCirculations]);

  // Check if circulation was completed today
  const isCompletedToday = (c: Circulation): boolean => {
    if (!c.last_completed_at) return false;
    const today = new Date().toISOString().split("T")[0];
    return c.last_completed_at.startsWith(today);
  };

  // Handle checkin
  async function handleCheckin(
    circulation: Circulation,
    note: string = "",
    count?: number,
  ) {
    setCheckinLoading(true);
    try {
      await checkinMutation.mutateAsync({ id: circulation.id, note, count });
      setCheckinTarget(null);
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "打卡失败");
    } finally {
      setCheckinLoading(false);
    }
  }

  // Handle undo checkin
  async function handleUndo(circulation: Circulation) {
    if (!confirm("确定要撤销今天的打卡吗？")) return;
    try {
      await undoMutation.mutateAsync(circulation.id);
    } catch (e) {
      console.error(e);
    }
  }

  // Handle reorder circulations (drag and drop)
  function _handleReorderCirculations(newOrder: Circulation[]) {
    setTodayCirculationsOrdered(newOrder);
  }

  // Dnd-kit sensors - useSensors handles memoization internally
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = todayCirculationsOrdered.findIndex(
      (c) => c.id === active.id,
    );
    const newIndex = todayCirculationsOrdered.findIndex(
      (c) => c.id === over.id,
    );

    if (oldIndex !== -1 && newIndex !== -1) {
      setTodayCirculationsOrdered(
        arrayMove(todayCirculationsOrdered, oldIndex, newIndex),
      );
    }
  };

  // Handle create/update
  async function handleSaveForm(data: CirculationFormData) {
    try {
      if (editingCirculation) {
        await updateMutation.mutateAsync({
          id: editingCirculation.id,
          ...data,
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      closeForm();
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "保存失败");
    }
  }

  // Handle delete
  async function handleDelete(id: string) {
    if (!confirm("确定要删除这个打卡项吗？")) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {
      console.error(e);
    }
  }

  function openEdit(c: Circulation) {
    setEditingCirculation(c);
    setTitle(c.title);
    setCirculationType(c.circulation_type);
    setFrequency(c.frequency || "daily");
    setTargetCount(c.target_count || "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingCirculation(null);
    setTitle("");
    setCirculationType("periodic");
    setFrequency("daily");
    setTargetCount("");
  }

  // Filter circulations for settings
  const filteredCirculations =
    settingsTab === "periodic"
      ? circulations.filter(
          (c) =>
            c.circulation_type === "periodic" && c.frequency === periodicSubTab,
        )
      : circulations.filter((c) => c.circulation_type === "count");

  return (
    <div className="p-6">
      {/* Tab Navigation */}
      <div className="flex justify-between items-center mb-6">
        <h2
          className="text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          打卡
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "today" ? "primary" : "secondary"}
            onClick={() => setViewMode("today")}
          >
            今日打卡
          </Button>
          <Button
            variant={viewMode === "settings" ? "primary" : "secondary"}
            onClick={() => setViewMode("settings")}
          >
            打卡设置
          </Button>
          <Button onClick={() => setShowForm(true)}>+ 新建</Button>
        </div>
      </div>

      {/* Today View */}
      {viewMode === "today" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todayCirculationsOrdered.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {todayCirculations.length === 0 ? (
                <div className="w-full">
                  <Card>
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-lg">今日没有待打卡项</p>
                      <Button
                        className="mt-4"
                        onClick={() => setViewMode("settings")}
                      >
                        去创建打卡
                      </Button>
                    </div>
                  </Card>
                </div>
              ) : (
                (todayCirculationsOrdered.length > 0
                  ? todayCirculationsOrdered
                  : todayCirculations
                ).map((c, idx) => {
                  return (
                    <SortableCard
                      key={c.id}
                      circulation={c}
                      todayStats={todayStats}
                      isCompletedToday={isCompletedToday(c)}
                      onCheckin={() => setCheckinTarget(c)}
                      onUndo={() => handleUndo(c)}
                      onViewDetail={() => setDetailCirculation(c)}
                      index={idx}
                    />
                  );
                })
              )}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Settings View */}
      {viewMode === "settings" && (
        <>
          {/* Sub Tabs */}
          <div className="flex gap-2 mb-4">
            <div
              className="flex rounded-lg p-1"
              style={{ backgroundColor: "var(--color-bg-hover)" }}
            >
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  settingsTab === "periodic" ? "" : ""
                }`}
                style={{
                  backgroundColor:
                    settingsTab === "periodic"
                      ? "var(--color-bg-card)"
                      : "transparent",
                  color:
                    settingsTab === "periodic"
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)",
                  boxShadow:
                    settingsTab === "periodic" ? "var(--shadow-card)" : "none",
                }}
                onClick={() => setSettingsTab("periodic")}
              >
                周期打卡
              </button>
              <button
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  settingsTab === "count" ? "" : ""
                }`}
                style={{
                  backgroundColor:
                    settingsTab === "count"
                      ? "var(--color-bg-card)"
                      : "transparent",
                  color:
                    settingsTab === "count"
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)",
                  boxShadow:
                    settingsTab === "count" ? "var(--shadow-card)" : "none",
                }}
                onClick={() => setSettingsTab("count")}
              >
                计数打卡
              </button>
            </div>
          </div>

          {/* Periodic Sub Tabs */}
          {settingsTab === "periodic" && (
            <div className="flex gap-2 mb-4 ml-2">
              <button
                className={`px-3 py-1 rounded text-sm ${
                  periodicSubTab === "daily"
                    ? "bg-teal-100 text-teal-700"
                    : "text-gray-500"
                }`}
                onClick={() => setPeriodicSubTab("daily")}
              >
                每日
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  periodicSubTab === "weekly"
                    ? "bg-teal-100 text-teal-700"
                    : "text-gray-500"
                }`}
                onClick={() => setPeriodicSubTab("weekly")}
              >
                每周
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${
                  periodicSubTab === "monthly"
                    ? "bg-teal-100 text-teal-700"
                    : "text-gray-500"
                }`}
                onClick={() => setPeriodicSubTab("monthly")}
              >
                每月
              </button>
            </div>
          )}

          {/* List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredCirculations.length === 0 ? (
              <Card className="col-span-full">
                <EmptyStateCard
                  icon="🔄"
                  title="今日暂无打卡"
                  description="创建你的第一个打卡项来开始"
                  action={
                    <Button onClick={() => setShowForm(true)}>
                      + 创建打卡
                    </Button>
                  }
                />
              </Card>
            ) : (
              filteredCirculations.map((c) => (
                <Card key={c.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div
                        className="font-semibold cursor-pointer hover:text-teal-600"
                        style={{ color: "var(--color-text)" }}
                        onClick={() => setDetailCirculation(c)}
                      >
                        {c.title}
                        {c.status === "archived" && (
                          <span className="ml-2 text-xs text-gray-400">
                            (已归档)
                          </span>
                        )}
                      </div>
                      {c.circulation_type === "periodic" && (
                        <div className="text-sm text-gray-500 mt-1">
                          🔥 {c.streak_count} 天 · 最佳 {c.best_streak} 天
                        </div>
                      )}
                      {c.circulation_type === "count" && (
                        <div className="text-sm text-gray-500 mt-1">
                          📊 {c.current_count} / {c.target_count || "∞"}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs px-2 py-1"
                        onClick={() => setDetailCirculation(c)}
                      >
                        详情
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs px-2 py-1"
                        onClick={() => openEdit(c)}
                      >
                        编辑
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs px-2 py-1"
                        onClick={() => handleDelete(c.id)}
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </>
      )}

      {/* Create/Edit Form Modal */}
      <CirculationForm
        open={showForm}
        editingCirculation={editingCirculation}
        onClose={closeForm}
        onSave={handleSaveForm}
      />

      {/* Checkin Confirm Modal */}
      {checkinTarget && (
        <CheckinConfirm
          circulation={checkinTarget}
          open={!!checkinTarget}
          onConfirm={(note, count) => handleCheckin(checkinTarget, note, count)}
          onCancel={() => setCheckinTarget(null)}
        />
      )}

      {/* Detail Modal */}
      {detailCirculation && (
        <CirculationDetailView
          id={detailCirculation.id}
          onClose={() => setDetailCirculation(null)}
        />
      )}
    </div>
  );
}
