/**
 * Milestone Types
 *
 * Type definitions for Milestone entity.
 * Milestones are key milestones that can be linked to various entity types.
 */

/**
 * Milestone - 里程碑
 * Represents a key milestone that can be linked to various entity types.
 */
export interface Milestone {
  id: string;
  title: string;
  target_date: string | null;
  // Unified fields for flexible linking
  biz_type: string | null; // 'plan' | 'task' | 'target' | 'circulation'
  biz_id: string | null;
  status: "pending" | "completed";
  progress: number; // 0-100, calculated from linked entity
  created_at: string;
  updated_at: string;
}

/**
 * Parameters for creating a new Milestone.
 */
export interface CreateMilestoneParams {
  title: string;
  target_date?: string;
  biz_type?: string;
  biz_id?: string;
}

/**
 * Parameters for updating an existing Milestone.
 */
export interface UpdateMilestoneParams {
  title?: string;
  target_date?: string;
  biz_type?: string;
  biz_id?: string;
  status?: "pending" | "completed";
}
