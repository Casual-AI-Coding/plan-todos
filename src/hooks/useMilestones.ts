export type {
  CreateMilestoneInput,
  UpdateMilestoneInput,
} from "@/domain/milestone/milestoneTypes";
export {
  milestoneKeys,
  useMilestones,
  useMilestone,
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
  usePlansForMilestone,
  useTargetsForMilestone,
  useCirculationsForMilestone,
} from "@/domain/milestone/milestoneQueries";
