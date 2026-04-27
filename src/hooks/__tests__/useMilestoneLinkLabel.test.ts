import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import type { Circulation, Milestone, Plan, Target } from "@/lib/types";

import { useMilestoneLinkLabel } from "../useMilestoneLinkLabel";

function createMilestone(overrides: Partial<Milestone> = {}): Milestone {
  return {
    id: overrides.id ?? "milestone-1",
    title: overrides.title ?? "Milestone",
    target_date: overrides.target_date ?? null,
    biz_type:
      Object.prototype.hasOwnProperty.call(overrides, "biz_type")
        ? overrides.biz_type ?? null
        : "plan",
    biz_id:
      Object.prototype.hasOwnProperty.call(overrides, "biz_id")
        ? overrides.biz_id ?? null
        : "entity-1",
    status: overrides.status ?? "pending",
    progress: overrides.progress ?? 0,
    created_at: overrides.created_at ?? "2026-01-01",
    updated_at: overrides.updated_at ?? "2026-01-01",
  };
}

function createPlan(overrides: Partial<Plan> = {}): Plan {
  return {
    id: overrides.id ?? "plan-1",
    title: overrides.title ?? "Plan title",
    description: overrides.description ?? null,
    start_date: overrides.start_date ?? null,
    end_date: overrides.end_date ?? null,
    status: overrides.status ?? "active",
    sort_order: overrides.sort_order ?? 0,
    created_at: overrides.created_at ?? "2026-01-01",
    updated_at: overrides.updated_at ?? "2026-01-01",
    reminder_times: overrides.reminder_times,
  };
}

function createTarget(overrides: Partial<Target> = {}): Target {
  return {
    id: overrides.id ?? "target-1",
    title: overrides.title ?? "Target title",
    description: overrides.description ?? null,
    due_date: overrides.due_date ?? null,
    status: overrides.status ?? "active",
    progress: overrides.progress ?? 0,
    sort_order: overrides.sort_order ?? 0,
    created_at: overrides.created_at ?? "2026-01-01",
    updated_at: overrides.updated_at ?? "2026-01-01",
    reminder_times: overrides.reminder_times,
  };
}

function createCirculation(overrides: Partial<Circulation> = {}): Circulation {
  return {
    id: overrides.id ?? "circulation-1",
    title: overrides.title ?? "Circulation title",
    content: overrides.content ?? null,
    circulation_type: overrides.circulation_type ?? "periodic",
    frequency: overrides.frequency ?? "daily",
    frequency_config: overrides.frequency_config ?? null,
    target_count: overrides.target_count ?? null,
    current_count: overrides.current_count ?? 0,
    streak_count: overrides.streak_count ?? 0,
    best_streak: overrides.best_streak ?? 0,
    last_completed_at: overrides.last_completed_at ?? null,
    status: overrides.status ?? "active",
    created_at: overrides.created_at ?? "2026-01-01",
    updated_at: overrides.updated_at ?? "2026-01-01",
  };
}

describe("useMilestoneLinkLabel", () => {
  const plans = [createPlan({ id: "plan-1", title: "Quarterly plan" })];
  const targets = [createTarget({ id: "target-1", title: "Ship v1" })];
  const circulations = [
    createCirculation({ id: "circulation-1", title: "Daily review" }),
  ];

  it("returns the linked plan label and icon", () => {
    const milestone = createMilestone({ biz_type: "plan", biz_id: "plan-1" });

    const { result } = renderHook(() =>
      useMilestoneLinkLabel(milestone, plans, targets, circulations),
    );

    expect(result.current).toEqual({ icon: "🚀", label: "Quarterly plan" });
  });

  it("falls back to the default plan label when the plan is missing", () => {
    const milestone = createMilestone({ biz_type: "plan", biz_id: "missing-plan" });

    const { result } = renderHook(() =>
      useMilestoneLinkLabel(milestone, plans, targets, circulations),
    );

    expect(result.current).toEqual({ icon: "🚀", label: "Plan" });
  });

  it("returns the linked target label and icon", () => {
    const milestone = createMilestone({ biz_type: "target", biz_id: "target-1" });

    const { result } = renderHook(() =>
      useMilestoneLinkLabel(milestone, plans, targets, circulations),
    );

    expect(result.current).toEqual({ icon: "🎯", label: "Ship v1" });
  });

  it("returns the task label and icon", () => {
    const milestone = createMilestone({ biz_type: "task", biz_id: "task-1" });

    const { result } = renderHook(() =>
      useMilestoneLinkLabel(milestone, plans, targets, circulations),
    );

    expect(result.current).toEqual({ icon: "📋", label: "Task" });
  });

  it("returns the linked circulation label and icon", () => {
    const milestone = createMilestone({
      biz_type: "circulation",
      biz_id: "circulation-1",
    });

    const { result } = renderHook(() =>
      useMilestoneLinkLabel(milestone, plans, targets, circulations),
    );

    expect(result.current).toEqual({ icon: "🔄", label: "Daily review" });
  });

  it("falls back to the default circulation label when the circulation is missing", () => {
    const milestone = createMilestone({
      biz_type: "circulation",
      biz_id: "missing-circulation",
    });

    const { result } = renderHook(() =>
      useMilestoneLinkLabel(milestone, plans, targets, circulations),
    );

    expect(result.current).toEqual({ icon: "🔄", label: "Circulation" });
  });

  it("returns the unlinked fallback for unknown biz types", () => {
    const milestone = createMilestone({ biz_type: "unknown", biz_id: "entity-1" });

    const { result } = renderHook(() =>
      useMilestoneLinkLabel(milestone, plans, targets, circulations),
    );

    expect(result.current).toEqual({ icon: "", label: "未关联" });
  });

  it("returns the unlinked fallback when biz_type is null", () => {
    const milestone = createMilestone({ biz_type: null, biz_id: null });

    const { result } = renderHook(() =>
      useMilestoneLinkLabel(milestone, plans, targets, circulations),
    );

    expect(result.current).toEqual({ icon: "", label: "未关联" });
  });
});
