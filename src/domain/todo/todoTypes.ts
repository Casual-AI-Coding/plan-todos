import type { Priority, Recurrence } from "@/lib/types";

export interface CreateTodoInput {
  title: string;
  content?: string;
  due_date?: string;
  priority?: Priority;
  recurrence?: Recurrence;
}

export interface UpdateTodoInput {
  id: string;
  title?: string;
  content?: string;
  due_date?: string;
  status?: "pending" | "in-progress" | "done";
  priority?: Priority;
  recurrence?: Recurrence;
}
