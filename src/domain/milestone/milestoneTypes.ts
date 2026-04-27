export interface CreateMilestoneInput {
  title: string;
  target_date?: string;
  biz_type?: string;
  biz_id?: string;
}

export interface UpdateMilestoneInput {
  id: string;
  title?: string;
  target_date?: string;
  status?: "pending" | "completed";
}
