import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { Todo, Priority, Recurrence } from "@/lib/types";
import {
  getTodo,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "@/lib/api";
import { reorderTodos } from "@/lib/api/reorder";

// Types for mutations
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

/**
 * Reorder todos with optimistic updates
 */
export function useReorderTodos(
  options?: Omit<
    UseMutationOptions<number, Error, { id: string; sort_order: number }[]>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<number, Error, { id: string; sort_order: number }[]>({
    mutationFn: reorderTodos,
    onMutate: async (newOrders) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.todos });

      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(queryKeys.todos);

      // Optimistically update to the new value
      if (previousTodos) {
        const updatedTodos = previousTodos.map((todo) => {
          const order = newOrders.find((o) => o.id === todo.id);
          if (order) {
            return { ...todo, sort_order: order.sort_order };
          }
          return todo;
        });
        // Sort by sort_order
        updatedTodos.sort((a, b) => a.sort_order - b.sort_order);
        queryClient.setQueryData(queryKeys.todos, updatedTodos);
      }

      return { previousTodos };
    },
    onError: (_err, _newOrders, context) => {
      // Rollback on error
      const ctx = context as { previousTodos?: Todo[] } | undefined;
      if (ctx?.previousTodos) {
        queryClient.setQueryData(queryKeys.todos, ctx.previousTodos);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.todos });
    },
    ...options,
  });
}
