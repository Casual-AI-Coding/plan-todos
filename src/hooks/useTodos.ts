import type { Todo, Priority, Recurrence } from "@/lib/types";
import { getTodo, getTodos, createTodo, updateTodo, deleteTodo } from "@/lib/api";
import { reorderTodos } from "@/lib/api/reorder";
import { createEntityHooks } from "./createEntityHooks";

export type CreateTodoInput = {
  title: string;
  content?: string;
  due_date?: string;
  priority?: Priority;
  recurrence?: Recurrence;
};

export type UpdateTodoInput = {
  id: string;
  title?: string;
  content?: string;
  due_date?: string;
  status?: "pending" | "in-progress" | "done";
  priority?: Priority;
  recurrence?: Recurrence;
};

const {
  queryKeys,
  useGetAll: useTodos,
  useGetOne: useTodo,
  useCreate: useCreateTodo,
  useUpdate: useUpdateTodo,
  useDelete: useDeleteTodo,
  useReorder: useReorderTodos,
} = createEntityHooks<Todo, CreateTodoInput, UpdateTodoInput>({
  entityName: "todos",
  apiGetAll: getTodos,
  apiGetOne: getTodo,
  apiCreate: createTodo,
  apiUpdate: updateTodo,
  apiDelete: deleteTodo,
  apiReorder: reorderTodos,
});

export const todoKeys = {
  todos: queryKeys.all,
  todo: queryKeys.one,
};

export { useTodos, useTodo, useCreateTodo, useUpdateTodo, useDeleteTodo, useReorderTodos };