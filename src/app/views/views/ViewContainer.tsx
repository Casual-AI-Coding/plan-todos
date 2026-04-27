"use client";

import { Card } from "@/components/ui";
import { ViewsList } from "@/components/views/ViewsList";
import { ViewsBoard } from "@/components/views/ViewsBoard";
import { ViewsCalendar } from "@/components/views/ViewsCalendar";
import { ViewsGantt } from "@/components/views/ViewsGantt";
import { ItemTooltip } from "@/components/views/ItemTooltip";
import type { ViewsViewModel } from "./useViewsViewModel";
import type { EntityItem } from "./types";

type ViewContainerProps = ViewsViewModel;

export function ViewContainer({
  viewMode,
  filters,
  hoveredItem,
  hoverPosition,
  handleItemHover,
  calendarDate,
  setCalendarDate,
  ganttZoom,
  setGanttZoom,
  todos,
  plans,
  targets,
  milestones,
  allTasks,
  tasksByPlan,
  targetSteps,
  handleNavigateToEntity,
}: ViewContainerProps) {
  const handleSetHoveredItem = (item: EntityItem | null) => {
    handleItemHover(item);
  };

  const handleSetHoverPosition = (_pos: { x: number; y: number }) => {};

  return (
    <div className="relative">
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
            onNavigate={handleNavigateToEntity}
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
            setHoveredItem={handleSetHoveredItem}
            hoverPosition={hoverPosition}
            setHoverPosition={handleSetHoverPosition}
            onNavigate={handleNavigateToEntity}
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
            setHoveredItem={handleSetHoveredItem}
            hoverPosition={hoverPosition}
            setHoverPosition={handleSetHoverPosition}
            onNavigate={handleNavigateToEntity}
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
            onNavigate={handleNavigateToEntity}
          />
        )}
      </Card>
    </div>
  );
}
