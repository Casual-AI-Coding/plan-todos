/**
 * Step Types
 *
 * Type definitions for Step entity.
 * Steps are individual tasks that make up a Target.
 */

import type { Priority } from "./common";

/**
 * Step - 步骤
 * Represents an individual step within a Target.
 */
export interface Step {
  id: string;
  target_id: string;
  title: string;
  weight: number; // 0-100
  status: "pending" | "completed";
  priority: Priority;
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for creating a new Step.
 */
export interface CreateStepParams {
  target_id: string;
  title: string;
  weight: number;
  priority?: Priority;
}

/**
 * Parameters for updating an existing Step.
 */
export interface UpdateStepParams {
  title?: string;
  weight?: number;
  status?: "pending" | "completed";
  priority?: Priority;
}
