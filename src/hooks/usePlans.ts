import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  type Plan,
} from "@/lib/api";

// Query Keys
export const planKeys = {
  plans: ["plans"] as const,
  plan: (id: string) => ["plans", id] as const,
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
};

// =============================================================================
// Plan Hooks
// =============================================================================

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
    UseMutationOptions<Plan, Error, CreatePlanInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Plan, Error, CreatePlanInput>({
    mutationFn: createPlan,
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
    mutationFn: ({ id, ...data }) => updatePlan(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData<Plan[]>(planKeys.plans, (old) => {
        if (!old) return old;
        return old.map((plan) => (plan.id === data.id ? data : plan));
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
