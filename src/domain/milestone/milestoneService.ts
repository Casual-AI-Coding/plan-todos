import type { Milestone } from "@/lib/types";
import type { MilestoneStatus } from "../shared/domainTypes";

export const milestoneDomainService = {
  filterByStatus(milestones: Milestone[], status: MilestoneStatus): Milestone[] {
    return milestones.filter((m) => m.status === status);
  },

  sortByDueDate(milestones: Milestone[]): Milestone[] {
    return [...milestones].sort((a, b) => {
      if (!a.target_date && !b.target_date) return 0;
      if (!a.target_date) return 1;
      if (!b.target_date) return -1;
      return new Date(a.target_date).getTime() - new Date(b.target_date).getTime();
    });
  },

  getUpcoming(milestones: Milestone[], days: number = 7): Milestone[] {
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return milestones.filter((m) => {
      if (!m.target_date) return false;
      const dueDate = new Date(m.target_date);
      return dueDate >= now && dueDate <= future;
    });
  },

  getOverdue(milestones: Milestone[]): Milestone[] {
    const now = new Date();
    return milestones.filter((m) => {
      if (!m.target_date) return false;
      if (m.status === "completed") return false;
      return new Date(m.target_date) < now;
    });
  },

  getCompleted(milestones: Milestone[]): Milestone[] {
    return milestones.filter((m) => m.status === "completed");
  },
};