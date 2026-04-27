export type TargetStatus = "active" | "completed" | "archived";

export interface CreateTargetInput {
  title: string;
  description?: string;
  due_date?: string;
  status?: TargetStatus;
  tagIds?: string[];
}

export interface UpdateTargetInput {
  id: string;
  title?: string;
  description?: string;
  due_date?: string;
  status?: TargetStatus;
  tagIds?: string[];
}
