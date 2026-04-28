import { useState, useMemo, useCallback } from "react";
import { useTodos } from "@/domain/todo/todoQueries";
import { usePlans } from "@/domain/plan/planQueries";
import { useTargets, targetKeys } from "@/domain/target/targetQueries";
import { useMilestones } from "@/domain/milestone/milestoneQueries";
import { useTasks } from "@/hooks/useTasks";
import { getSteps } from "@/lib/api";
import { useQueries } from "@tanstack/react-query";
import { useNavigationStore } from "@/stores/navigation";
import type { Todo, Plan, Task, Target, Step, Milestone } from "@/lib/types";
import type { ViewMode, FilterState, HoveredItem, EntityItem } from "./types";

export interface ViewsViewModel {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  hoveredItem: HoveredItem | null;
  hoverPosition: { x: number; y: number };
  handleItemHover: (item: EntityItem | null, event?: React.MouseEvent) => void;
  calendarDate: Date;
  setCalendarDate: React.Dispatch<React.SetStateAction<Date>>;
  ganttZoom: number;
  setGanttZoom: React.Dispatch<React.SetStateAction<number>>;
  todos: Todo[];
  plans: Plan[];
  targets: Target[];
  milestones: Milestone[];
  allTasks: Task[];
  tasksByPlan: Record<string, Task[]>;
  targetSteps: Record<string, Step[]>;
  handleNavigateToEntity: (type: string, id: string) => void;
  isLoading: boolean;
}

export function useViewsViewModel(): ViewsViewModel {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<FilterState>({
    todo: true,
    task: true,
    plan: true,
    target: true,
    milestone: true,
  });
  const [hoveredItem, setHoveredItem] = useState<HoveredItem | null>(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [ganttZoom, setGanttZoom] = useState(3);
  const { navigate } = useNavigationStore();

  const { data: todos = [], isLoading: todosLoading } = useTodos();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: targets = [], isLoading: targetsLoading } = useTargets();
  const { data: milestones = [], isLoading: milestonesLoading } =
    useMilestones();
  const { data: allTasks = [], isLoading: tasksLoading } = useTasks();

  const tasksByPlan = useMemo(() => {
    const map: Record<string, typeof allTasks> = {};
    for (const task of allTasks) {
      if (task.plan_id) {
        if (!map[task.plan_id]) map[task.plan_id] = [];
        map[task.plan_id].push(task);
      }
    }
    return map;
  }, [allTasks]);

  const targetStepsResults = useQueries({
    queries: targets.map((target) => ({
      queryKey: targetKeys.targetSteps(target.id),
      queryFn: () => getSteps(target.id),
      enabled: !!target.id,
    })),
  });

  const targetSteps = useMemo(() => {
    const result: Record<string, Awaited<ReturnType<typeof getSteps>>> = {};
    targets.forEach((target, index) => {
      result[target.id] = targetStepsResults[index]?.data ?? [];
    });
    return result;
  }, [targets, targetStepsResults]);

  const handleItemHover = useCallback(
    (item: EntityItem | null, event?: React.MouseEvent) => {
      if (item) {
        setHoveredItem(item);
        if (event) {
          setHoverPosition({ x: event.clientX, y: event.clientY });
        }
      } else {
        setHoveredItem(null);
      }
    },
    [],
  );

  const handleNavigateToEntity = useCallback(
    (type: string, _id: string) => {
      const menuMap: Record<string, string> = {
        todo: "todos",
        plan: "plans",
        target: "targets",
        milestone: "milestones",
        task: "plans",
      };
      const menu = menuMap[type];
      if (menu) {
        navigate(menu);
      }
    },
    [navigate],
  );

  const isLoading =
    todosLoading ||
    plansLoading ||
    targetsLoading ||
    milestonesLoading ||
    tasksLoading;

  return {
    viewMode,
    setViewMode,
    filters,
    setFilters,
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
    isLoading,
  };
}
