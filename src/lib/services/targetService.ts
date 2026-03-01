// src/lib/services/targetService.ts
export interface Target {
  id: string;
  title: string;
  current: number;
  target: number;
}

export interface TargetProgress {
  id: string;
  progress: number;
  isCompleted: boolean;
}

export function sortTargetsByProgress(targets: Target[]): Target[] {
  return [...targets].sort((a, b) => {
    const aProgress = a.target > 0 ? a.current / a.target : 0;
    const bProgress = b.target > 0 ? b.current / b.target : 0;
    return bProgress - aProgress;
  });
}

export function calculateTargetProgress(target: Target): TargetProgress {
  const progress =
    target.target > 0
      ? Math.min((target.current / target.target) * 100, 100)
      : 0;
  return {
    id: target.id,
    progress: Math.round(progress),
    isCompleted: target.current >= target.target,
  };
}

export function getCompletedTargets(targets: Target[]): Target[] {
  return targets.filter((t) => t.current >= t.target);
}

export function getOverdueTargets(targets: Target[]): Target[] {
  return targets.filter((t) => t.current < t.target);
}

export function getProgressCategory(
  progress: number,
): "not_started" | "in_progress" | "near_completion" | "completed" {
  if (progress >= 100) return "completed";
  if (progress >= 80) return "near_completion";
  if (progress > 0) return "in_progress";
  return "not_started";
}
