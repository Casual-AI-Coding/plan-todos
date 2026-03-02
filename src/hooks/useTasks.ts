import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { Task, Priority } from "@/lib/types";
import {
  getTasks,
  getTasksByPlan,
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/api";

// Query Keys
export const taskKeys = {
  tasks: ["tasks"] as const,
  tasksByPlan: (planId: string) => ["tasks", "byPlan", planId] as const,
  task: (id: string) => ["tasks", id] as const,
};

// =============================================================================
// Task Hooks
// =============================================================================

/**
 * Get all tasks
 */
export function useTasks(
  options?: Omit<UseQueryOptions<Task[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.tasks,
    queryFn: getTasks,
    ...options,
  });
}

/**
 * Get tasks by plan ID
 */
export function useTasksByPlan(
  planId: string,
  options?: Omit<UseQueryOptions<Task[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.tasksByPlan(planId),
    queryFn: () => getTasksByPlan(planId),
    enabled: !!planId,
    ...options,
  });
}

/**
 * Get a single task by ID
 */
export function useTask(
  id: string,
  options?: Omit<UseQueryOptions<Task, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Task, Error>({
    queryKey: taskKeys.task(id),
    queryFn: () =>
      getTasks().then((tasks) => {
        const task = tasks.find((t) => t.id === id);
        if (!task) {
          throw new Error(`Task with id "${id}" not found`);
        }
        return task;
      }),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new task
 */
export function useCreateTask(
  options?: Omit<
    UseMutationOptions<
      Task,
      Error,
      {
        plan_id: string;
        title: string;
        description?: string;
        start_date?: string;
        end_date?: string;
        priority?: Priority;
      }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Task,
    Error,
    {
      plan_id: string;
      title: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      priority?: Priority;
    }
  >({
    mutationFn: createTask,
    onSuccess: (data) => {
      // Invalidate tasks list and tasks by plan
      queryClient.invalidateQueries({ queryKey: taskKeys.tasks });
      queryClient.invalidateQueries({
        queryKey: taskKeys.tasksByPlan(data.plan_id),
      });
    },
    ...options,
  });
}

/**
 * Update an existing task
 */
export function useUpdateTask(
  options?: Omit<
    UseMutationOptions<
      Task,
      Error,
      {
        id: string;
        title?: string;
        description?: string;
        start_date?: string;
        end_date?: string;
        status?: "pending" | "in-progress" | "done";
        priority?: Priority;
      }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Task,
    Error,
    {
      id: string;
      title?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
      status?: "pending" | "in-progress" | "done";
      priority?: Priority;
    }
  >({
    mutationFn: ({ id, ...data }) => updateTask(id, data),
    onSuccess: (data) => {
      // Update cache
      queryClient.setQueryData<Task[]>(taskKeys.tasks, (old) => {
        if (!old) return old;
        return old.map((task) => (task.id === data.id ? data : task));
      });
      // Invalidate tasks by plan
      queryClient.invalidateQueries({
        queryKey: taskKeys.tasksByPlan(data.plan_id),
      });
    },
    ...options,
  });
}

/**
 * Delete a task
 */
export function useDeleteTask(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.tasks });
      // Invalidate all plan tasks since we don't know which plan it belonged to
      queryClient.invalidateQueries({ queryKey: ["tasks", "byPlan"] });
    },
    ...options,
  });
}
