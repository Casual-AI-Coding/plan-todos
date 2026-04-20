import {
  getMilestones,
  getMilestone,
  createMilestone,
  updateMilestone,
  deleteMilestone,
  getPlans,
  getTargets,
  getCirculations,
  type Milestone,
  type Plan,
  type Target,
  type Circulation,
} from "@/lib/api";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { createEntityHooks } from "./createEntityHooks";

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

export const milestoneKeys = {
  milestones: ["milestones"] as const,
  milestone: (id: string) => ["milestones", id] as const,
};

const { useGetAll: useMilestones, useGetOne: useMilestone, useCreate: useCreateMilestone, useUpdate: useUpdateMilestone, useDelete: useDeleteMilestone } = createEntityHooks<Milestone, CreateMilestoneInput, UpdateMilestoneInput>({
  entityName: "milestones",
  apiGetAll: getMilestones,
  apiGetOne: getMilestone,
  apiCreate: createMilestone,
  apiUpdate: updateMilestone,
  apiDelete: deleteMilestone,
});

export function usePlansForMilestone(
  options?: Omit<UseQueryOptions<Plan[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Plan[], Error>({
    queryKey: ["plans", "for-milestone"],
    queryFn: getPlans,
    ...options,
  });
}

export function useTargetsForMilestone(
  options?: Omit<UseQueryOptions<Target[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Target[], Error>({
    queryKey: ["targets", "for-milestone"],
    queryFn: getTargets,
    ...options,
  });
}

export function useCirculationsForMilestone(
  options?: Omit<UseQueryOptions<Circulation[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Circulation[], Error>({
    queryKey: ["circulations", "for-milestone"],
    queryFn: getCirculations,
    ...options,
  });
}

export { useMilestones, useMilestone, useCreateMilestone, useUpdateMilestone, useDeleteMilestone };