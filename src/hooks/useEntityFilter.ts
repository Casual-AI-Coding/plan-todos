import { useMemo } from "react";
import type { Plan, Target } from "@/lib/types";

type PlanFilterCriteria = {
  plans: Plan[];
  tagFilters: string[];
  showArchived?: boolean;
};

export function useFilteredPlans({
  plans,
  tagFilters,
  showArchived = false,
}: PlanFilterCriteria) {
  return useMemo(() => {
    return plans.filter((p) => {
      if (!showArchived && p.status === "archived") return false;

      if (tagFilters.length > 0) {
        type PlanWithTags = Plan & { tags?: { id: string }[] };
        const planWithTags = p as PlanWithTags;
        const hasTag = tagFilters.some((tagId) =>
          planWithTags.tags?.some((tag) => tag.id === tagId),
        );
        if (!hasTag) return false;
      }

      return true;
    });
  }, [plans, tagFilters, showArchived]);
}

type TargetFilterCriteria = {
  targets: Target[];
  tagFilters: string[];
  showArchived?: boolean;
};

export function useFilteredTargets({
  targets,
  tagFilters,
  showArchived = false,
}: TargetFilterCriteria) {
  return useMemo(() => {
    return targets.filter((t) => {
      if (!showArchived && t.status === "archived") return false;

      if (tagFilters.length > 0) {
        type TargetWithTags = Target & { tags?: { id: string }[] };
        const targetWithTags = t as TargetWithTags;
        const hasTag = tagFilters.some((tagId) =>
          targetWithTags.tags?.some((tag) => tag.id === tagId),
        );
        if (!hasTag) return false;
      }

      return true;
    });
  }, [targets, tagFilters, showArchived]);
}
