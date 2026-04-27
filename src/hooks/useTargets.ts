export type { CreateTargetInput, UpdateTargetInput, TargetStatus } from "@/domain/target/targetTypes";
export {
  targetKeys,
  useTargets,
  useTarget,
  useTargetTags,
  useTargetSteps,
  useCreateTarget,
  useUpdateTarget,
  useDeleteTarget,
  useReorderTargets,
  useCreateStep,
  useUpdateStep,
  useDeleteStep,
} from "@/domain/target/targetQueries";
