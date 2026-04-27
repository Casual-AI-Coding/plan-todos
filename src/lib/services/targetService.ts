/**
 * Backward-compatible re-exports from domain layer.
 * New code should import from @/domain/target/targetService directly.
 */
export { targetDomainService } from "@/domain/target/targetService";
export type { TargetProgress } from "@/domain/target/targetService";

import { targetDomainService } from "@/domain/target/targetService";

/** @deprecated Import targetDomainService from @/domain/target/targetService directly. */
export const sortTargetsByProgress = targetDomainService.sortByProgress;
/** @deprecated Import targetDomainService from @/domain/target/targetService directly. */
export const calculateTargetProgress = targetDomainService.calculateProgress;
/** @deprecated Import targetDomainService from @/domain/target/targetService directly. */
export const getCompletedTargets = targetDomainService.getCompleted;
/** @deprecated Import targetDomainService from @/domain/target/targetService directly. */
export const getOverdueTargets = targetDomainService.getOverdue;
/** @deprecated Import targetDomainService from @/domain/target/targetService directly. */
export const getProgressCategory = targetDomainService.getProgressCategory;
