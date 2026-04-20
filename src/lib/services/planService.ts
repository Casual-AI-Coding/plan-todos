export { planDomainService } from "@/domain/plan/planService";
export type { PlanProgress } from "@/domain/plan/planService";

import { planDomainService } from "@/domain/plan/planService";

export const calculatePlanProgress = planDomainService.calculateProgress;
export const sortPlansByDeadline = planDomainService.sortByDeadline;
export const filterPlansByStatus = planDomainService.filterByStatus;
export const getOverduePlans = planDomainService.getOverdue;