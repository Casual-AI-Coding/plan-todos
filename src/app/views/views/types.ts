import type { Todo, Plan, Task, Target, Step, Milestone } from "@/lib/types";

import type { LucideIcon } from "lucide-react";
import { Icons } from "@/components/ui/Icons";

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
  {
    label: string;
    color: string;
    bgColor: string;
    textColor: string;
    icon: LucideIcon;
    borderColor: string;
    accentColor: string;
  }
> = {
  todo: {
    label: "待办",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    icon: Icons.LayoutGrid,
    borderColor: "border-blue-200",
    accentColor: "var(--color-primary)",
  },
  task: {
    label: "任务",
    color: "teal",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
    icon: Icons.Activity,
    borderColor: "border-teal-200",
    accentColor: "var(--color-primary)",
  },
  plan: {
    label: "计划",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
    icon: Icons.FolderOpen,
    borderColor: "border-purple-200",
    accentColor: "var(--color-secondary)",
  },
  target: {
    label: "目标",
    color: "orange",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    icon: Icons.Target,
    borderColor: "border-orange-200",
    accentColor: "var(--color-cta)",
  },
  milestone: {
    label: "里程碑",
    color: "gray",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    icon: Icons.Flag,
    borderColor: "border-gray-200",
    accentColor: "var(--color-text-muted)",
  },
};
