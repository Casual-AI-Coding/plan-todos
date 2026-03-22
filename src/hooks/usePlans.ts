import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { Plan, Task, Tag } from "@/lib/types";
import {
  getPlans,
  getTasksByPlan,
  getEntityTags,
  setEntityTags,
  createPlan,
  updatePlan,
  deletePlan,
} from "@/lib/api";
import { reorderPlans } from "@/lib/api/reorder";

// Query Keys
export const planKeys = {
  plans: ["plans"] as const,
  plan: (id: string) => ["plans", id] as const,
  planTags: (planId: string) => ["plans", planId, "tags"] as const,
  planTasks: (planId: string) => ["plans", planId, "tasks"] as const,
};

// Types for mutations
export type PlanStatus = "active" | "completed" | "archived";

export type CreatePlanInput = {
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: PlanStatus;
};

export type UpdatePlanInput = {
  id: string;
  title?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: PlanStatus;
  tagIds?: string[];
};

// =============================================================================
// Plan Hooks
// =============================================================================

/**
 * Get plan tags by plan ID
 */
export function usePlanTags(
  planId: string,
  options?: Omit<UseQueryOptions<Tag[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag[], Error>({
    queryKey: planKeys.planTags(planId),
    queryFn: () => getEntityTags("plan", planId),
    enabled: !!planId,
    ...options,
  });
}

/**
 * Get plan tasks by plan ID
 */
export function usePlanTasks(
  planId: string,
  options?: Omit<UseQueryOptions<Task[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Task[], Error>({
    queryKey: planKeys.planTasks(planId),
    queryFn: () => getTasksByPlan(planId),
    enabled: !!planId,
    ...options,
  });
}

/**
 * Get all plans
 */
export function usePlans(
  options?: Omit<UseQueryOptions<Plan[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Plan[], Error>({
    queryKey: planKeys.plans,
    queryFn: getPlans,
    ...options,
  });
}

/**
 * Get a single plan by ID
 */
export function usePlan(
  id: string,
  options?: Omit<UseQueryOptions<Plan, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Plan, Error>({
    queryKey: planKeys.plan(id),
    queryFn: () =>
      getPlans().then((plans) => {
        const plan = plans.find((p) => p.id === id);
        if (!plan) {
          throw new Error(`Plan with id "${id}" not found`);
        }
        return plan;
      }),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new plan
 */
export function useCreatePlan(
  options?: Omit<
    UseMutationOptions<Plan, Error, CreatePlanInput & { tagIds?: string[] }>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, CreatePlanInput & { tagIds?: string[] }>({
    mutationFn: async (data) => {
      const { tagIds, ...planData } = data;
      const plan = await createPlan(planData);
      if (tagIds && tagIds.length > 0) {
        await setEntityTags("plan", plan.id, tagIds);
      }
      return plan;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.plans });
    },
    ...options,
  });
}

/**
 * Update an existing plan
 */
export function useUpdatePlan(
  options?: Omit<
    UseMutationOptions<Plan, Error, UpdatePlanInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, UpdatePlanInput>({
    mutationFn: async ({ id, tagIds, ...data }) => {
      const plan = await updatePlan(id, data);
      if (tagIds !== undefined) {
        await setEntityTags("plan", id, tagIds);
      }
      return plan;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Plan[]>(planKeys.plans, (old) => {
        if (!old) return old;
        return old.map((plan) => (plan.id === data.id ? data : plan));
      });
      // Invalidate tags for this plan
      queryClient.invalidateQueries({
        queryKey: planKeys.planTags(data.id),
      });
    },
    ...options,
  });
}

/**
 * Delete a plan
 */
export function useDeletePlan(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deletePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.plans });
    },
    ...options,
  });
}

/**
 * Reorder plans with optimistic updates
 */
export function useReorderPlans(
  options?: Omit<
    UseMutationOptions<number, Error, { id: string; sort_order: number }[]>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<number, Error, { id: string; sort_order: number }[]>({
    mutationFn: reorderPlans,
    onMutate: async (newOrders) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: planKeys.plans });

      // Snapshot the previous value
      const previousPlans = queryClient.getQueryData<Plan[]>(planKeys.plans);

      // Optimistically update to the new value
      if (previousPlans) {
        const updatedPlans = previousPlans.map((plan) => {
          const order = newOrders.find((o) => o.id === plan.id);
          if (order) {
            return { ...plan, sort_order: order.sort_order };
          }
          return plan;
        });
        // Sort by sort_order
        updatedPlans.sort((a, b) => a.sort_order - b.sort_order);
        queryClient.setQueryData(planKeys.plans, updatedPlans);
      }

      return { previousPlans };
    },
    onError: (_err, _newOrders, context) => {
      // Rollback on error
      const ctx = context as { previousPlans?: Plan[] } | undefined;
      if (ctx?.previousPlans) {
        queryClient.setQueryData(planKeys.plans, ctx.previousPlans);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: planKeys.plans });
    },
    ...options,
  });
}
