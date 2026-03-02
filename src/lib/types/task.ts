/**
 * Task Types
 *
 * Type definitions for Task entity.
 * Tasks are short-term work items that belong to a Plan.
 */

import type { Priority } from "./common";

/**
 * Task - 短期任务
 * Represents a short-term task that belongs to a Plan.
 */
export interface Task {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "pending" | "in-progress" | "done";
  priority: Priority;
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for creating a new Task.
 */
export interface CreateTaskParams {
  plan_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  priority?: Priority;
}

/**
 * Parameters for updating an existing Task.
 */
export interface UpdateTaskParams {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: "pending" | "in-progress" | "done";
  priority?: Priority;
}
