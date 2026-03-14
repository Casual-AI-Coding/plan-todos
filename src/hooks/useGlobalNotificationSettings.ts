/**
 * useGlobalNotificationSettings
 *
 * React Query hooks for global notification settings management.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GlobalNotificationSettings,
  GlobalNotificationSettingsUpdate,
} from "@/lib/types";
import {
  getGlobalNotificationSettings,
  updateGlobalNotificationSettings,
  resetGlobalNotificationSettings,
} from "@/lib/api/notifications";

const QUERY_KEY = "globalNotificationSettings";

/**
 * Hook to fetch global notification settings
 */
export function useGlobalNotificationSettings() {
  return useQuery<GlobalNotificationSettings, Error>({
    queryKey: [QUERY_KEY],
    queryFn: getGlobalNotificationSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to update global notification settings
 */
export function useUpdateGlobalNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation<
    GlobalNotificationSettings,
    Error,
    GlobalNotificationSettingsUpdate
  >({
    mutationFn: updateGlobalNotificationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEY], data);
    },
  });
}

/**
 * Hook to reset global notification settings to defaults
 */
export function useResetGlobalNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation<GlobalNotificationSettings, Error, void>({
    mutationFn: resetGlobalNotificationSettings,
    onSuccess: (data) => {
      queryClient.setQueryData([QUERY_KEY], data);
    },
  });
}
