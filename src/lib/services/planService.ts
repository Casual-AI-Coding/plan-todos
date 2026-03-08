import type { Plan, Step } from "@/lib/types";

// Service-specific computed type for progress tracking
export interface PlanProgress {
  completed: number;
  total: number;
  percentage: number;
}

export function calculatePlanProgress(steps: Step[]): PlanProgress {
  if (!steps || steps.length === 0) {
    return { completed: 0, total: 0, percentage: 0 };
  }
  const completed = steps.filter((s) => s.status === "completed").length;
  const total = steps.length;
  const percentage = Math.round((completed / total) * 100);
  return { completed, total, percentage };
}

export function sortPlansByDeadline(plans: Plan[]): Plan[] {
  return [...plans].sort((a, b) => {
    if (!a.end_date && !b.end_date) return 0;
    if (!a.end_date) return 1;
    if (!b.end_date) return -1;
    return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
  });
}

export function filterPlansByStatus(
  plans: Plan[],
  status: Plan["status"],
): Plan[] {
  return plans.filter((p) => p.status === status);
}

export function getOverduePlans(plans: Plan[]): Plan[] {
  const now = new Date();
  return plans.filter((p) => {
    if (!p.end_date) return false;
    return new Date(p.end_date) < now;
  });
}
