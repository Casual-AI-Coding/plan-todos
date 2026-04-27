import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { createEntityHooks } from "@/domain/shared/entityQueries";
import { getTargets, createTarget, updateTarget, deleteTarget, getEntityTags, setEntityTags, createStep, updateStep, deleteStep, getSteps } from "@/lib/api";
import { reorderTargets } from "@/lib/api/reorder";
import type { Target, Step, Tag } from "@/lib/types";

import type { CreateTargetInput, UpdateTargetInput } from "./targetTypes";

export const targetKeys = {
  targets: ["targets"] as const,
  target: (id: string) => ["targets", id] as const,
  targetTags: (targetId: string) => ["targets", targetId, "tags"] as const,
  targetSteps: (targetId: string) => ["targets", targetId, "steps"] as const,
};

const {
  useGetAll: useTargets,
  useGetOne: useTarget,
  useCreate: useCreateTargetBase,
  useUpdate: useUpdateTargetBase,
  useDelete: useDeleteTarget,
  useReorder: useReorderTargets,
} = createEntityHooks<Target, CreateTargetInput, UpdateTargetInput>({
  entityName: "targets",
  apiGetAll: getTargets,
  apiCreate: async (data) => {
    const { tagIds, ...targetData } = data;
    const target = await createTarget(targetData);
    if (tagIds && tagIds.length > 0) {
      await setEntityTags("target", target.id, tagIds);
    }
    return target;
  },
  apiUpdate: updateTarget,
  apiDelete: deleteTarget,
  apiReorder: reorderTargets,
  customUpdateMutate: async ({ id, tagIds, ...data }) => {
    const target = await updateTarget(id, data);
    if (tagIds !== undefined) {
      await setEntityTags("target", id, tagIds);
    }
    return target;
  },
  extraInvalidateKeys: [["targets", "steps"]],
});

export function useTargetTags(
  targetId: string,
  options?: Omit<UseQueryOptions<Tag[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag[], Error>({
    queryKey: targetKeys.targetTags(targetId),
    queryFn: () => getEntityTags("target", targetId),
    enabled: !!targetId,
    ...options,
  });
}

export function useTargetSteps(
  targetId: string,
  options?: Omit<UseQueryOptions<Step[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Step[], Error>({
    queryKey: targetKeys.targetSteps(targetId),
    queryFn: () => getSteps(targetId),
    enabled: !!targetId,
    ...options,
  });
}

export function useCreateStep(
  options?: Omit<
    UseMutationOptions<Step, Error, { target_id: string; title: string; weight: number; priority?: "P0" | "P1" | "P2" | "P3" }>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<Step, Error, { target_id: string; title: string; weight: number; priority?: "P0" | "P1" | "P2" | "P3" }>({
    mutationFn: createStep,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: targetKeys.targetSteps(data.target_id) });
    },
    ...options,
  });
}

export function useUpdateStep(
  options?: Omit<
    UseMutationOptions<Step, Error, { id: string; title?: string; weight?: number; status?: "pending" | "completed"; priority?: "P0" | "P1" | "P2" | "P3" }>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();
  return useMutation<Step, Error, { id: string; title?: string; weight?: number; status?: "pending" | "completed"; priority?: "P0" | "P1" | "P2" | "P3" }>({
    mutationFn: async ({ id, ...data }) => {
      const result = await updateStep(id, data);
      queryClient.invalidateQueries({ queryKey: ["targets", "steps"] });
      return result;
    },
    ...options,
  });
}

export function useDeleteStep(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteStep,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["targets", "steps"] });
    },
    ...options,
  });
}

export { useTargets, useTarget, useDeleteTarget, useReorderTargets };
export const useCreateTarget = useCreateTargetBase;
export const useUpdateTarget = useUpdateTargetBase;
