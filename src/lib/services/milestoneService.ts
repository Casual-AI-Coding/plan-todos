// src/lib/services/milestoneService.ts

/** 里程碑状态类型 */
export type MilestoneStatus = "pending" | "in_progress" | "completed";

export interface Milestone {
  id: string;
  title: string;
  status?: MilestoneStatus;
  dueDate?: string;
}

export function filterMilestonesByStatus(
  milestones: Milestone[],
  status: MilestoneStatus,
): Milestone[] {
  return milestones.filter((m) => m.status === status);
}


export function sortMilestonesByDueDate(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function getUpcomingMilestones(
  milestones: Milestone[],
  days: number = 7,
): Milestone[] {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return milestones.filter((m) => {
    if (!m.dueDate) return false;
    const dueDate = new Date(m.dueDate);
    return dueDate >= now && dueDate <= future;
  });
}

export function getOverdueMilestones(milestones: Milestone[]): Milestone[] {
  const now = new Date();
  return milestones.filter((m) => {
    if (!m.dueDate) return false;
    if (m.status === "completed") return false;
    return new Date(m.dueDate) < now;
  });
}

export function getCompletedMilestones(milestones: Milestone[]): Milestone[] {
  return milestones.filter((m) => m.status === "completed");
}
