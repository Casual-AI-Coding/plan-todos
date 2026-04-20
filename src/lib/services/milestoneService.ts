export { milestoneDomainService } from "@/domain/milestone/milestoneService";

import { milestoneDomainService } from "@/domain/milestone/milestoneService";

export const filterMilestonesByStatus = milestoneDomainService.filterByStatus;
export const sortMilestonesByDueDate = milestoneDomainService.sortByDueDate;
export const getUpcomingMilestones = milestoneDomainService.getUpcoming;
export const getOverdueMilestones = milestoneDomainService.getOverdue;
export const getCompletedMilestones = milestoneDomainService.getCompleted;