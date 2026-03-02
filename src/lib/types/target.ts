/**
 * Target Types
 *
 * Type definitions for Target entity.
 * Targets are long-term measurable goals that contain steps.
 */

/**
 * Target - 长期目标
 * Represents a long-term measurable goal.
 */
export interface Target {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "active" | "completed" | "archived";
  progress: number; // 0-100, calculated from Steps
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for creating a new Target.
 */
export interface CreateTargetParams {
  title: string;
  description?: string;
  due_date?: string;
}

/**
 * Parameters for updating an existing Target.
 */
export interface UpdateTargetParams {
  title?: string;
  description?: string;
  due_date?: string;
  status?: "active" | "completed" | "archived";
}
