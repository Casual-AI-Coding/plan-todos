export type PlanStatus = "active" | "completed" | "archived";

export interface CreatePlanInput {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: PlanStatus;
  tagIds?: string[];
}

export interface UpdatePlanInput {
  id: string;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: PlanStatus;
  tagIds?: string[];
}
