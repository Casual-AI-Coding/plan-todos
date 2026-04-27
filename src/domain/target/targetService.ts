import type { Target } from "@/lib/types";
import type { ProgressCategory } from "@/domain/shared/domainTypes";

export interface TargetProgress {
  id: string;
  progress: number;
  isCompleted: boolean;
}

export const targetDomainService = {
  calculateProgress(target: Target): TargetProgress {
    const progress = Math.min(target.progress ?? 0, 100);
    return {
      id: target.id,
      progress: Math.round(progress),
      isCompleted: target.status === "completed" || target.progress >= 100,
    };
  },

  sortByProgress(targets: Target[]): number[] {
    return targets
      .map((t, i) => ({
        index: i,
        progress: t.progress ?? 0,
      }))
      .sort((a, b) => b.progress - a.progress)
      .map((t) => t.index);
  },

  getCompleted(targets: Target[]): Target[] {
    return targets.filter((t) => t.status === "completed" || t.progress >= 100);
  },

  getOverdue(targets: Target[]): Target[] {
    const now = new Date();
    return targets.filter((t) => {
      if (t.status === "completed" || t.progress >= 100) return false;
      if (!t.due_date) return false;
      return new Date(t.due_date) < now;
    });
  },

  getProgressCategory(progress: number): ProgressCategory {
    if (progress >= 100) return "completed";
    if (progress >= 80) return "near_completion";
    if (progress > 0) return "in_progress";
    return "not_started";
  },
};
