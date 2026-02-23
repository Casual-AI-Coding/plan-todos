import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import {
  getMilestones,
  getPlans,
  getTargets,
  getTasks,
  getCirculations,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  type Milestone,
  type Plan,
  type Target,
  type Task,
  type Circulation,
} from "@/lib/api";

// Query Keys
export const milestoneKeys = {
  milestones: ["milestones"] as const,
  milestone: (id: string) => ["milestones", id] as const,
};

// Types
export type CreateMilestoneInput = {
  title: string;
  target_date?: string;
  biz_type?: string;
  biz_id?: string;
};

export type UpdateMilestoneInput = {
  id: string;
  title?: string;
  target_date?: string;
  status?: "pending" | "completed";
};

// =============================================================================
// Milestone Hooks
// =============================================================================

/**
 * Get all milestones
 */
export function useMilestones(
  options?: Omit<UseQueryOptions<Milestone[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Milestone[], Error>({
    queryKey: milestoneKeys.milestones,
    queryFn: getMilestones,
    ...options,
  });
}

/**
 * Get a single milestone by ID
 */
export function useMilestone(
  id: string,
  options?: Omit<UseQueryOptions<Milestone, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Milestone, Error>({
    queryKey: milestoneKeys.milestone(id),
    queryFn: () =>
      getMilestones().then((milestones) => {
        const milestone = milestones.find((m) => m.id === id);
        if (!milestone) {
          throw new Error(`Milestone with id "${id}" not found`);
        }
        return milestone;
      }),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new milestone
 */
export function useCreateMilestone(
  options?: Omit<
    UseMutationOptions<Milestone, Error, CreateMilestoneInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Milestone, Error, CreateMilestoneInput>({
    mutationFn: createMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.milestones });
    },
    ...options,
  });
}

/**
 * Update an existing milestone
 */
export function useUpdateMilestone(
  options?: Omit<
    UseMutationOptions<Milestone, Error, UpdateMilestoneInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Milestone, Error, UpdateMilestoneInput>({
    mutationFn: ({ id, ...data }) => updateMilestone(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData<Milestone[]>(milestoneKeys.milestones, (old) => {
        if (!old) return old;
        return old.map((m) => (m.id === data.id ? data : m));
      });
    },
    ...options,
  });
}

/**
 * Delete a milestone
 */
export function useDeleteMilestone(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: milestoneKeys.milestones });
    },
    ...options,
  });
}

/**
 * Get all plans for linking
 */
export function usePlansForMilestone(
  options?: Omit<UseQueryOptions<Plan[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Plan[], Error>({
    queryKey: ["plans", "for-milestone"],
    queryFn: getPlans,
    ...options,
  });
}

/**
 * Get all targets for linking
 */
export function useTargetsForMilestone(
  options?: Omit<UseQueryOptions<Target[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Target[], Error>({
    queryKey: ["targets", "for-milestone"],
    queryFn: getTargets,
    ...options,
  });
}

/**
 * Get all circulations for linking
 */
export function useCirculationsForMilestone(
  options?: Omit<UseQueryOptions<Circulation[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Circulation[], Error>({
    queryKey: ["circulations", "for-milestone"],
    queryFn: getCirculations,
    ...options,
  });
}
