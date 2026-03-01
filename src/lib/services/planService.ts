// src/lib/services/planService.ts

export interface Plan {
  id: string;
  title: string;
  deadline?: string;
  steps?: Step[];
  status?: string;
}

export interface Step {
  id: string;
  status: "pending" | "in_progress" | "completed";
}

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
    if (!a.deadline && !b.deadline) return 0;
    if (!a.deadline) return 1;
    if (!b.deadline) return -1;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });
}

export function filterPlansByStatus(plans: Plan[], status: string): Plan[] {
  return plans.filter((p) => p.status === status);
}

export function getOverduePlans(plans: Plan[]): Plan[] {
  const now = new Date();
  return plans.filter((p) => {
    if (!p.deadline) return false;
    return new Date(p.deadline) < now;
  });
}
