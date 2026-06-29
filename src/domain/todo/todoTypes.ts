import type { Priority, Recurrence } from "@/lib/types";
import type { TodoStatus } from "@/domain/shared/domainTypes";

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
  status?: TodoStatus;
  priority?: Priority;
  recurrence?: Recurrence;
}
