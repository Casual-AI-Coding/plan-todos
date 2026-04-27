import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import type { Plan, Target } from "@/lib/types";

import { useFilteredPlans, useFilteredTargets } from "../useEntityFilter";

type TaggedPlan = Plan & { tags?: { id: string }[] };
type TaggedTarget = Target & { tags?: { id: string }[] };

function createPlan(overrides: Partial<TaggedPlan> = {}): TaggedPlan {
  return {
    id: overrides.id ?? "plan-1",
    title: overrides.title ?? "Plan",
    description: overrides.description ?? null,
    start_date: overrides.start_date ?? null,
    end_date: overrides.end_date ?? null,
    status: overrides.status ?? "active",
    sort_order: overrides.sort_order ?? 0,
    created_at: overrides.created_at ?? "2026-01-01",
    updated_at: overrides.updated_at ?? "2026-01-01",
    reminder_times: overrides.reminder_times,
    tags: overrides.tags,
  };
}

function createTarget(overrides: Partial<TaggedTarget> = {}): TaggedTarget {
  return {
    id: overrides.id ?? "target-1",
    title: overrides.title ?? "Target",
    description: overrides.description ?? null,
    due_date: overrides.due_date ?? null,
    status: overrides.status ?? "active",
    progress: overrides.progress ?? 0,
    sort_order: overrides.sort_order ?? 0,
    created_at: overrides.created_at ?? "2026-01-01",
    updated_at: overrides.updated_at ?? "2026-01-01",
    reminder_times: overrides.reminder_times,
    tags: overrides.tags,
  };
}

describe("useFilteredPlans", () => {
  const plans = [
    createPlan({ id: "plan-a", title: "Active tagged", tags: [{ id: "tag-a" }] }),
    createPlan({ id: "plan-b", title: "Archived tagged", status: "archived", tags: [{ id: "tag-b" }] }),
    createPlan({ id: "plan-c", title: "Active untagged" }),
  ];

  it("returns all non-archived plans when no filters are applied", () => {
    const { result } = renderHook(() =>
      useFilteredPlans({ plans, tagFilters: [], showArchived: false }),
    );

    expect(result.current.map((plan) => plan.id)).toEqual(["plan-a", "plan-c"]);
  });

  it("includes archived plans when showArchived is true", () => {
    const { result } = renderHook(() =>
      useFilteredPlans({ plans, tagFilters: [], showArchived: true }),
    );

    expect(result.current.map((plan) => plan.id)).toEqual([
      "plan-a",
      "plan-b",
      "plan-c",
    ]);
  });

  it("filters plans by matching tags", () => {
    const { result } = renderHook(() =>
      useFilteredPlans({ plans, tagFilters: ["tag-a"], showArchived: true }),
    );

    expect(result.current.map((plan) => plan.id)).toEqual(["plan-a"]);
  });

  it("combines archived and tag filters", () => {
    const { result } = renderHook(() =>
      useFilteredPlans({ plans, tagFilters: ["tag-b"], showArchived: false }),
    );

    expect(result.current).toEqual([]);
  });

  it("returns an empty array when there are no plans", () => {
    const { result } = renderHook(() =>
      useFilteredPlans({ plans: [], tagFilters: ["tag-a"], showArchived: true }),
    );

    expect(result.current).toEqual([]);
  });
});

describe("useFilteredTargets", () => {
  const targets = [
    createTarget({ id: "target-a", title: "Active tagged", tags: [{ id: "tag-a" }] }),
    createTarget({ id: "target-b", title: "Archived tagged", status: "archived", tags: [{ id: "tag-b" }] }),
    createTarget({ id: "target-c", title: "Active untagged" }),
  ];

  it("returns all non-archived targets when no filters are applied", () => {
    const { result } = renderHook(() =>
      useFilteredTargets({ targets, tagFilters: [], showArchived: false }),
    );

    expect(result.current.map((target) => target.id)).toEqual([
      "target-a",
      "target-c",
    ]);
  });

  it("includes archived targets when showArchived is true", () => {
    const { result } = renderHook(() =>
      useFilteredTargets({ targets, tagFilters: [], showArchived: true }),
    );

    expect(result.current.map((target) => target.id)).toEqual([
      "target-a",
      "target-b",
      "target-c",
    ]);
  });

  it("filters targets by matching tags", () => {
    const { result } = renderHook(() =>
      useFilteredTargets({ targets, tagFilters: ["tag-a"], showArchived: true }),
    );

    expect(result.current.map((target) => target.id)).toEqual(["target-a"]);
  });

  it("combines archived and tag filters", () => {
    const { result } = renderHook(() =>
      useFilteredTargets({ targets, tagFilters: ["tag-b"], showArchived: false }),
    );

    expect(result.current).toEqual([]);
  });

  it("returns an empty array when there are no targets", () => {
    const { result } = renderHook(() =>
      useFilteredTargets({ targets: [], tagFilters: ["tag-a"], showArchived: true }),
    );

    expect(result.current).toEqual([]);
  });
});
