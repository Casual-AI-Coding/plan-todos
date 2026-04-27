"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui";
import { useTodos } from "@/domain/todo/todoQueries";
import { usePlans } from "@/domain/plan/planQueries";
import { useTargets, targetKeys } from "@/domain/target/targetQueries";
import { useMilestones } from "@/domain/milestone/milestoneQueries";
import { useTasks } from "@/hooks/useTasks";
import {
  getSteps,
  type Todo,
  type Plan,
  type Task,
  type Target,
  type Step,
  type Milestone,
} from "@/lib/api";
import { ViewsCalendar } from "@/components/views/ViewsCalendar";
import { ViewsGantt } from "@/components/views/ViewsGantt";
import { ViewsList } from "@/components/views/ViewsList";
import { ViewsBoard } from "@/components/views/ViewsBoard";
import { ViewsFilters } from "@/components/views/ViewsFilters";
import { ItemTooltip } from "@/components/views/ItemTooltip";
import { ViewModeSelector } from "./components/ViewModeSelector";
import { useQueries } from "@tanstack/react-query";

type ViewMode = "list" | "board" | "calendar" | "gantt";

interface FilterState {
  todo: boolean;
  task: boolean;
  plan: boolean;
  target: boolean;
  milestone: boolean;
}

export function ViewsView() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Hover state for tooltips
  const [hoveredItem, setHoveredItem] = useState<{
    type: string;
    data: Todo | Task | Plan | Target | Milestone;
  } | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    todo: true,
    task: true,
    plan: true,
    target: true,
    milestone: true,
  });

  // Calendar navigation state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Gantt timeline zoom state
  const [ganttZoom, setGanttZoom] = useState(3);

  // ==================== DATA FETCHING ====================
  const { data: todos = [] } = useTodos();
  const { data: plans = [] } = usePlans();
  const { data: targets = [] } = useTargets();
  const { data: milestones = [] } = useMilestones();
  const { data: allTasks = [] } = useTasks();

  // Group tasks by plan ID
  const tasksByPlan = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const task of allTasks) {
      if (task.plan_id) {
        if (!map[task.plan_id]) map[task.plan_id] = [];
        map[task.plan_id].push(task);
      }
    }
    return map;
  }, [allTasks]);

  // Load steps for all targets
  const targetStepsResults = useQueries({
    queries: targets.map((target) => ({
      queryKey: targetKeys.targetSteps(target.id),
      queryFn: () => getSteps(target.id),
      enabled: !!target.id,
    })),
  });

  // Transform results into Record<targetId, steps[]>
  const targetSteps: Record<string, Step[]> = {};
  targets.forEach((target, index) => {
    targetSteps[target.id] = targetStepsResults[index]?.data ?? [];
  });

  // ==================== RENDER ====================
  return (
    <div className="p-6">
      <h2
        className="text-2xl font-semibold mb-4"
        style={{ color: "var(--color-text)" }}
      >
        视图查看
      </h2>

      {/* View Mode Selector */}
      <ViewModeSelector viewMode={viewMode} onViewModeChange={setViewMode} />

      {/* Filters */}
      <ViewsFilters filters={filters} setFilters={setFilters} />

      {/* Global tooltip for board view */}
      <ItemTooltip hoveredItem={hoveredItem} hoverPosition={hoverPosition} />

      <Card>
        {viewMode === "list" && (
          <ViewsList
            todos={todos}
            plans={plans}
            targets={targets}
            milestones={milestones}
            tasksByPlan={tasksByPlan}
            targetSteps={targetSteps}
            filters={filters}
          />
        )}
        {viewMode === "board" && (
          <ViewsBoard
            todos={todos}
            plans={plans}
            targets={targets}
            milestones={milestones}
            allTasks={allTasks}
            filters={filters}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            hoverPosition={hoverPosition}
            setHoverPosition={setHoverPosition}
          />
        )}
        {viewMode === "calendar" && (
          <ViewsCalendar
            todos={todos}
            allTasks={allTasks}
            targets={targets}
            milestones={milestones}
            filters={filters}
            calendarDate={calendarDate}
            setCalendarDate={setCalendarDate}
            hoveredItem={hoveredItem}
            setHoveredItem={setHoveredItem}
            hoverPosition={hoverPosition}
            setHoverPosition={setHoverPosition}
          />
        )}
        {viewMode === "gantt" && (
          <ViewsGantt
            todos={todos}
            allTasks={allTasks}
            plans={plans}
            targets={targets}
            milestones={milestones}
            filters={filters}
            ganttZoom={ganttZoom}
            setGanttZoom={setGanttZoom}
          />
        )}
      </Card>
    </div>
  );
}
