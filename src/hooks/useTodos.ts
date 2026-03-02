import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { Todo, Priority } from "@/lib/types";
import {
  getTodo,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "@/lib/api";

// Types for mutations
export type CreateTodoInput = {
  title: string;
  content?: string;
  due_date?: string;
  priority?: Priority;
};

export type UpdateTodoInput = {
  id: string;
  title?: string;
  content?: string;
  due_date?: string;
  status?: "pending" | "in-progress" | "done";
  priority?: Priority;
};

// Query Keys
export const queryKeys = {
  todos: ["todos"] as const,
  todo: (id: string) => ["todos", id] as const,
};

// =============================================================================
// Todo Hooks
// =============================================================================

/**
 * Get all todos
 */
export function useTodos(
  options?: Omit<UseQueryOptions<Todo[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Todo[], Error>({
    queryKey: queryKeys.todos,
    queryFn: getTodos,
    ...options,
  });
}

/**
 * Get a single todo by ID
 */
export function useTodo(
  id: string,
  options?: Omit<UseQueryOptions<Todo, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Todo, Error>({
    queryKey: queryKeys.todo(id),
    queryFn: () => getTodo(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new todo
 */
export function useCreateTodo(
  options?: Omit<
    UseMutationOptions<Todo, Error, CreateTodoInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, CreateTodoInput>({
    mutationFn: createTodo,
    onSuccess: () => {
      // Invalidate todos query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.todos });
    },
    ...options,
  });
}

/**
 * Update an existing todo
 */
export function useUpdateTodo(
  options?: Omit<
    UseMutationOptions<Todo, Error, UpdateTodoInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Todo, Error, UpdateTodoInput>({
    mutationFn: ({ id, ...data }) => updateTodo(id, data),
    onSuccess: (data) => {
      // Update the specific todo in cache
      queryClient.setQueryData<Todo[]>(queryKeys.todos, (old) => {
        if (!old) return old;
        return old.map((todo) => (todo.id === data.id ? data : todo));
      });
    },
    ...options,
  });
}

/**
 * Delete a todo
 */
export function useDeleteTodo(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteTodo,
    onSuccess: () => {
      // Invalidate todos query to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.todos });
    },
    ...options,
  });
}
