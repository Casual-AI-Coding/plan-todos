import {
  getTodo,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "@/lib/api";
import { reorderTodos } from "@/lib/api/reorder";
import type { Todo } from "@/lib/types";

import { createEntityHooks } from "@/domain/shared/entityQueries";
import type { CreateTodoInput, UpdateTodoInput } from "./todoTypes";

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
  apiUpdate: async ({ id, ...data }) => updateTodo(id, data),
  apiDelete: deleteTodo,
  apiReorder: async (orders) => reorderTodos([...orders]),
});

export const todoKeys = {
  todos: queryKeys.all,
  todo: queryKeys.one,
};

export {
  useTodos,
  useTodo,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  useReorderTodos,
};
