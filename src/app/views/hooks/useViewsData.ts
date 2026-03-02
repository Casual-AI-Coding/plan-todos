import { useQueries } from "@tanstack/react-query";
import { getTodos } from "@/lib/api/todos";
import { getPlans } from "@/lib/api/plans";
import { getTasks } from "@/lib/api/tasks";
import { getTargets } from "@/lib/api/targets";
import { getMilestones } from "@/lib/api/milestones";

export function useViewsData() {
  const queries = useQueries({
    queries: [
      { queryKey: ["todos"], queryFn: getTodos },
      { queryKey: ["plans"], queryFn: getPlans },
      { queryKey: ["tasks"], queryFn: getTasks },
      { queryKey: ["targets"], queryFn: getTargets },
      { queryKey: ["milestones"], queryFn: getMilestones },
    ],
  });

  return {
    todos: queries[0].data ?? [],
    plans: queries[1].data ?? [],
    tasks: queries[2].data ?? [],
    targets: queries[3].data ?? [],
    milestones: queries[4].data ?? [],
    isLoading: queries.some((q) => q.isLoading),
    error: queries.find((q) => q.error)?.error,
  };
}
