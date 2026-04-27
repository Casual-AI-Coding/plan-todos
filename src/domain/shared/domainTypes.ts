/**
 * Domain Types - Shared Value Objects and Types
 *
 * Architecture rule: lib/types = persistence/data shapes, domain/types = domain behavior shapes.
 * This module re-exports lib/types and adds domain-specific value objects with runtime constants.
 */

export type {
  Priority,
  EntityType,
  CirculationType,
  PeriodicFrequency,
  ImportMode,
} from "@/lib/types/common";

// Re-export all entity types for convenience
export type {
  Todo,
  Recurrence,
  CreateTodoParams,
  UpdateTodoParams,
} from "@/lib/types/todo";

export type {
  Plan,
  CreatePlanParams,
  UpdatePlanParams,
} from "@/lib/types/plan";

export type {
  Target,
  CreateTargetParams,
  UpdateTargetParams,
} from "@/lib/types/target";

export type {
  Step,
  CreateStepParams,
  UpdateStepParams,
} from "@/lib/types/step";

export type {
  Milestone,
  CreateMilestoneParams,
  UpdateMilestoneParams,
} from "@/lib/types/milestone";

export type {
  Circulation,
  CirculationLog,
  CreateCirculationParams,
  UpdateCirculationParams,
} from "@/lib/types/circulation";

export type { Tag } from "@/lib/types/tag";
export type {
  Task,
  CreateTaskParams,
  UpdateTaskParams,
} from "@/lib/types/task";

export const TODO_STATUSES = ["pending", "in-progress", "done"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

export const PLAN_STATUSES = ["active", "completed", "archived"] as const;
export type PlanStatus = (typeof PLAN_STATUSES)[number];

export const TARGET_STATUSES = ["active", "completed", "archived"] as const;
export type TargetStatus = (typeof TARGET_STATUSES)[number];

export const MILESTONE_STATUSES = ["pending", "completed"] as const;
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];

export const CIRCULATION_STATUSES = ["active", "archived"] as const;
export type CirculationStatus = (typeof CIRCULATION_STATUSES)[number];

export const STEP_STATUSES = ["pending", "completed"] as const;
export type StepStatus = (typeof STEP_STATUSES)[number];

export const MILESTONE_BIZ_TYPES = [
  "plan",
  "task",
  "target",
  "circulation",
] as const;
export type MilestoneBizType = (typeof MILESTONE_BIZ_TYPES)[number];

export const PROGRESS_CATEGORIES = [
  "not_started",
  "in_progress",
  "near_completion",
  "completed",
] as const;
export type ProgressCategory = (typeof PROGRESS_CATEGORIES)[number];
