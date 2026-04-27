import type { Todo, Plan, Task, Target, Step, Milestone } from "@/lib/types";

export type ViewMode = "list" | "board" | "calendar" | "gantt";

export interface FilterState {
  todo: boolean;
  task: boolean;
  plan: boolean;
  target: boolean;
  milestone: boolean;
}

export interface HoveredItem {
  type: EntityType;
  data: Todo | Task | Plan | Target | Milestone;
}

export type EntityType = "todo" | "task" | "plan" | "target" | "milestone";

export interface EntityItem {
  type: EntityType;
  data: Todo | Task | Plan | Target | Milestone;
}

export interface ViewsData {
  todos: Todo[];
  plans: Plan[];
  targets: Target[];
  milestones: Milestone[];
  allTasks: Task[];
  tasksByPlan: Record<string, Task[]>;
  targetSteps: Record<string, Step[]>;
}

export const ENTITY_TYPE_CONFIG: Record<
  EntityType,
  { label: string; color: string; bgColor: string; textColor: string }
> = {
  todo: {
    label: "待办",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  task: {
    label: "任务",
    color: "teal",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
  },
  plan: {
    label: "计划",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  target: {
    label: "目标",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  milestone: {
    label: "里程碑",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
};
