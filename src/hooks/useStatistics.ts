import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import {
  getTodos,
  getPlans,
  getTargets,
  getMilestones,
  getCirculations,
} from "@/lib/api";

// Query Keys
export const statisticsKeys = {
  statistics: ["statistics"] as const,
};

/**
 * Get all statistics data in parallel
 */
export function useStatistics(
  options?: Omit<
    UseQueryOptions<
      {
        todos: Awaited<ReturnType<typeof getTodos>>;
        plans: Awaited<ReturnType<typeof getPlans>>;
        targets: Awaited<ReturnType<typeof getTargets>>;
        milestones: Awaited<ReturnType<typeof getMilestones>>;
        circulations: Awaited<ReturnType<typeof getCirculations>>;
      },
      Error
    >,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery({
    queryKey: statisticsKeys.statistics,
    queryFn: async () => {
      const [todos, plans, targets, milestones, circulations] =
        await Promise.all([
          getTodos(),
          getPlans(),
          getTargets(),
          getMilestones(),
          getCirculations(),
        ]);
      return { todos, plans, targets, milestones, circulations };
    },
    ...options,
  });
}
