/**
 * API Constants
 *
 * Mock data and constants for API functions.
 */

import type { Statistics } from "@/lib/types";

/**
 * Mock statistics data for development/testing outside Tauri
 */
export const MOCK_STATISTICS_DATA: Statistics = {
  counts: {
    todo: 0,
    plan: 0,
    task: 0,
    target: 0,
    step: 0,
    milestone: 0,
  },
  completion: {
    todo_done: 0,
    todo_total: 0,
    task_done: 0,
    task_total: 0,
    step_completed: 0,
    step_total: 0,
    milestone_done: 0,
    milestone_total: 0,
    todo_completion_rate: 0,
    task_completion_rate: 0,
    step_completion_rate: 0,
    milestone_completion_rate: 0,
  },
  trends: {
    daily: [],
  },
  efficiency: {
    streak_days: 0,
    today_completed: 0,
    week_completed: 0,
    month_completed: 0,
    productivity_score: 0,
  },
};
