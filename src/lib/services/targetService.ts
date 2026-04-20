export { targetDomainService } from "@/domain/target/targetService";
export type { TargetProgress } from "@/domain/target/targetService";

import { targetDomainService } from "@/domain/target/targetService";

export const sortTargetsByProgress = targetDomainService.sortByProgress;
export const calculateTargetProgress = targetDomainService.calculateProgress;
export const getCompletedTargets = targetDomainService.getCompleted;
export const getOverdueTargets = targetDomainService.getOverdue;
export const getProgressCategory = targetDomainService.getProgressCategory;