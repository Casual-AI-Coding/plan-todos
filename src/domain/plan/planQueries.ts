import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { createEntityHooks } from "@/domain/shared/entityQueries";
import {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  getEntityTags,
  setEntityTags,
  getTasksByPlan,
} from "@/lib/api";
import { reorderPlans } from "@/lib/api/reorder";
import type { Plan, Task, Tag } from "@/lib/types";

import type { CreatePlanInput, UpdatePlanInput } from "./planTypes";

export const planKeys = {
  plans: ["plans"] as const,
  plan: (id: string) => ["plans", id] as const,
  planTags: (planId: string) => ["plans", planId, "tags"] as const,
  planTasks: (planId: string) => ["plans", planId, "tasks"] as const,
};

const {
  useGetAll: usePlans,
  useGetOne: usePlan,
  useCreate: useCreatePlanBase,
  useUpdate: useUpdatePlanBase,
  useDelete: useDeletePlan,
  useReorder: useReorderPlans,
} = createEntityHooks<Plan, CreatePlanInput, UpdatePlanInput>({
  entityName: "plans",
  apiGetAll: getPlans,
  apiGetOne: getPlan,
  apiCreate: async (data) => {
    const { tagIds, ...planData } = data;
    const plan = await createPlan(planData);
    if (tagIds && tagIds.length > 0) {
      await setEntityTags("plan", plan.id, tagIds);
    }
    return plan;
  },
  apiUpdate: updatePlan,
  apiDelete: deletePlan,
  apiReorder: reorderPlans,
  customUpdateMutate: async ({ id, tagIds, ...data }) => {
    const plan = await updatePlan(id, data);
    if (tagIds !== undefined) {
      await setEntityTags("plan", id, tagIds);
    }
    return plan;
  },
  onUpdateSuccess: (data, queryClient) => {
    queryClient.setQueryData<Plan[]>(planKeys.plans, (old) => {
      if (!old) return old;
      return old.map((plan) => (plan.id === data.id ? data : plan));
    });
    queryClient.invalidateQueries({ queryKey: planKeys.planTags(data.id) });
  },
});

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

export const useCreatePlan = useCreatePlanBase;
export const useUpdatePlan = useUpdatePlanBase;
export { usePlans, usePlan, useDeletePlan, useReorderPlans };
