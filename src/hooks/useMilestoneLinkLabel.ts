import { useMemo } from "react";
import type { Milestone, Plan, Target, Circulation } from "@/lib/types";

interface LinkLabelResult {
  icon: string;
  label: string;
}

export function useMilestoneLinkLabel(
  milestone: Milestone,
  plans: Plan[],
  targets: Target[],
  circulations: Circulation[],
): LinkLabelResult {
  return useMemo(() => {
    switch (milestone.biz_type) {
      case "plan": {
        const plan = plans.find((p) => p.id === milestone.biz_id);
        return { icon: "🚀", label: plan?.title ?? "Plan" };
      }
      case "target": {
        const target = targets.find((t) => t.id === milestone.biz_id);
        return { icon: "🎯", label: target?.title ?? "Target" };
      }
      case "task":
        return { icon: "📋", label: "Task" };
      case "circulation": {
        const circ = circulations.find((c) => c.id === milestone.biz_id);
        return { icon: "🔄", label: circ?.title ?? "Circulation" };
      }
      default:
        return { icon: "", label: "未关联" };
    }
  }, [milestone.biz_type, milestone.biz_id, plans, targets, circulations]);
}