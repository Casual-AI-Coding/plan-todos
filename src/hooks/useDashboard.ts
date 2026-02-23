import {
  useQuery,
  type UseQueryOptions,
} from "@tanstack/react-query";
import { getDashboard, type Dashboard } from "@/lib/api";

// Query Keys
export const dashboardKeys = {
  dashboard: ["dashboard"] as const,
};

/**
 * Get dashboard data
 */
export function useDashboard(
  options?: Omit<
    UseQueryOptions<Dashboard, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<Dashboard, Error>({
    queryKey: dashboardKeys.dashboard,
    queryFn: getDashboard,
    ...options,
  });
}
