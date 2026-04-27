/**
 * Backward-compatible re-exports from domain layer.
 * New code should import from @/domain/plan/planService directly.
 */
export { planDomainService } from "@/domain/plan/planService";
export type { PlanProgress } from "@/domain/plan/planService";

import { planDomainService } from "@/domain/plan/planService";

/** @deprecated Import planDomainService from @/domain/plan/planService directly. */
export const calculatePlanProgress = planDomainService.calculateProgress;
/** @deprecated Import planDomainService from @/domain/plan/planService directly. */
export const sortPlansByDeadline = planDomainService.sortByDeadline;
/** @deprecated Import planDomainService from @/domain/plan/planService directly. */
export const filterPlansByStatus = planDomainService.filterByStatus;
/** @deprecated Import planDomainService from @/domain/plan/planService directly. */
export const getOverduePlans = planDomainService.getOverdue;
