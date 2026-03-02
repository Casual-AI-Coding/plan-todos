import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type { Target, Step, Tag } from "@/lib/types";
import {
  getTargets,
  getSteps,
  getEntityTags,
  setEntityTags,
  createTarget,
  updateTarget,
  deleteTarget,
  createStep,
  updateStep,
  deleteStep,
} from "@/lib/api";

// Query Keys
export const targetKeys = {
  targets: ["targets"] as const,
  target: (id: string) => ["targets", id] as const,
  targetTags: (targetId: string) => ["targets", targetId, "tags"] as const,
  targetSteps: (targetId: string) => ["targets", targetId, "steps"] as const,
};

// Types for mutations
export type TargetStatus = "active" | "completed" | "archived";

export type CreateTargetInput = {
  title: string;
  description?: string;
  due_date?: string;
  status?: TargetStatus;
};

export type UpdateTargetInput = {
  id: string;
  title?: string;
  description?: string;
  due_date?: string;
  status?: TargetStatus;
};

// =============================================================================
// Target Hooks
// =============================================================================

/**
 * Get target tags by target ID
 */
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

/**
 * Get target steps by target ID
 */
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

/**
 * Get all targets
 */
export function useTargets(
  options?: Omit<UseQueryOptions<Target[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Target[], Error>({
    queryKey: targetKeys.targets,
    queryFn: getTargets,
    ...options,
  });
}

/**
 * Get a single target by ID
 */
export function useTarget(
  id: string,
  options?: Omit<UseQueryOptions<Target, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Target, Error>({
    queryKey: targetKeys.target(id),
    queryFn: () =>
      getTargets().then((targets) => {
        const target = targets.find((t) => t.id === id);
        if (!target) {
          throw new Error(`Target with id "${id}" not found`);
        }
        return target;
      }),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new target
 */
export function useCreateTarget(
  options?: Omit<
    UseMutationOptions<
      Target,
      Error,
      CreateTargetInput & { tagIds?: string[] }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Target, Error, CreateTargetInput & { tagIds?: string[] }>({
    mutationFn: async (data) => {
      const { tagIds, ...targetData } = data;
      const target = await createTarget(targetData);
      if (tagIds && tagIds.length > 0) {
        await setEntityTags("target", target.id, tagIds);
      }
      return target;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.targets });
    },
    ...options,
  });
}

/**
 * Update an existing target
 */
export function useUpdateTarget(
  options?: Omit<
    UseMutationOptions<Target, Error, UpdateTargetInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Target, Error, UpdateTargetInput>({
    mutationFn: ({ id, ...data }) => updateTarget(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData<Target[]>(targetKeys.targets, (old) => {
        if (!old) return old;
        return old.map((target) => (target.id === data.id ? data : target));
      });
    },
    ...options,
  });
}

/**
 * Delete a target
 */
export function useDeleteTarget(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteTarget,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: targetKeys.targets });
    },
    ...options,
  });
}

/**
 * Create a new step
 */
export function useCreateStep(
  options?: Omit<
    UseMutationOptions<
      Step,
      Error,
      {
        target_id: string;
        title: string;
        weight: number;
        priority?: "P0" | "P1" | "P2" | "P3";
      }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Step,
    Error,
    {
      target_id: string;
      title: string;
      weight: number;
      priority?: "P0" | "P1" | "P2" | "P3";
    }
  >({
    mutationFn: createStep,
    onSuccess: (data) => {
      // Invalidate steps for this target
      queryClient.invalidateQueries({
        queryKey: targetKeys.targetSteps(data.target_id),
      });
    },
    ...options,
  });
}

/**
 * Update an existing step
 */
export function useUpdateStep(
  options?: Omit<
    UseMutationOptions<
      Step,
      Error,
      {
        id: string;
        title?: string;
        weight?: number;
        status?: "pending" | "completed";
        priority?: "P0" | "P1" | "P2" | "P3";
      }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Step,
    Error,
    {
      id: string;
      title?: string;
      weight?: number;
      status?: "pending" | "completed";
      priority?: "P0" | "P1" | "P2" | "P3";
    }
  >({
    mutationFn: async ({ id, ...data }) => {
      // We need to find the step to get its target_id
      // For now, invalidate all target steps
      const result = await updateStep(id, data);
      queryClient.invalidateQueries({ queryKey: ["targets", "steps"] });
      return result;
    },
    ...options,
  });
}

/**
 * Delete a step
 */
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
