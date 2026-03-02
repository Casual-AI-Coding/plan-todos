/**
 * Plan Types
 *
 * Type definitions for Plan entity.
 * Plans are long-term planning units that contain multiple tasks.
 */

/**
 * Plan - 长期计划
 * Represents a long-term plan that contains tasks.
 */
export interface Plan {
  id: string;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: "active" | "completed" | "archived";
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for creating a new Plan.
 */
export interface CreatePlanParams {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Parameters for updating an existing Plan.
 */
export interface UpdatePlanParams {
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: "active" | "completed" | "archived";
}
