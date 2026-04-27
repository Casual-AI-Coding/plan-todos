export { todoDomainService } from "./todo/todoService";
export { planDomainService } from "./plan/planService";
export { targetDomainService } from "./target/targetService";
export { milestoneDomainService } from "./milestone/milestoneService";
export { circulationDomainService } from "./circulation/circulationService";

export type { PlanProgress } from "./plan/planService";
export type { TargetProgress } from "./target/targetService";
export type { CirculationStats } from "./circulation/circulationService";

export {
  TODO_STATUSES,
  PLAN_STATUSES,
  TARGET_STATUSES,
  MILESTONE_STATUSES,
  CIRCULATION_STATUSES,
  STEP_STATUSES,
  MILESTONE_BIZ_TYPES,
  PROGRESS_CATEGORIES,
} from "./shared/domainTypes";

export type {
  TodoStatus,
  PlanStatus,
  TargetStatus,
  MilestoneStatus,
  CirculationStatus,
  StepStatus,
  MilestoneBizType,
  ProgressCategory,
} from "./shared/domainTypes";

export type { ValidationError } from "./shared/validation";
export {
  required,
  maxLength,
  validatePriority,
  validateStatus,
  validateTodo,
  VALID_PRIORITIES,
  VALID_STATUSES,
} from "./shared/validation";
