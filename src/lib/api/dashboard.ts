/**
 * Dashboard API
 *
 * API functions for dashboard data.
 */

import type { Dashboard } from "@/lib/types";
import { isTauri } from "./client";

export async function getDashboard(): Promise<Dashboard> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - returning mock data");
    return {
      overview: {
        today_todos_count: 0,
        upcoming_3days_count: 0,
        completed_today_count: 0,
        overdue_count: 0,
        streak_days: 0,
        productivity_score: 0,
      },
      week: { completed_count: 0 },
      counts: {
        todo: 0,
        plan: 0,
        task: 0,
        target: 0,
        step: 0,
        milestone: 0,
        circulation: 0,
      },
      circulation_stats: {
        today_pending: 0,
        today_completed: 0,
        current_streak: 0,
      },
      today_todos: [],
      overdue_todos: [],
      completed_today: [],
      active_plans: [],
      active_targets: [],
      active_milestones: [],
    };
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Dashboard>("get_dashboard");
}
