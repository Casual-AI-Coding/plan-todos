/**
 * Circulation Notification Settings Hooks
 *
 * React Query hooks for circulation notification settings.
 */

import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type {
  CirculationNotificationSettings,
  CirculationNotificationSettingsInput,
  GlobalCirculationNotificationSettings,
  GlobalCirculationNotificationSettingsInput,
  CirculationWithNotificationSettings,
} from "@/lib/types";
import {
  getCirculationNotificationSettings,
  updateCirculationNotificationSettings,
  deleteCirculationNotificationSettings,
  getGlobalCirculationNotificationSettings,
  updateGlobalCirculationNotificationSettings,
  getCirculationsWithNotificationSettings,
} from "@/lib/api/notifications";

// Query Keys
export const circulationNotificationKeys = {
  all: ["circulationNotifications"] as const,
  circulation: (circulationId: string) =>
    [...circulationNotificationKeys.all, "circulation", circulationId] as const,
  global: () => [...circulationNotificationKeys.all, "global"] as const,
  allCirculations: () =>
    [...circulationNotificationKeys.all, "allCirculations"] as const,
};

/**
 * Get notification settings for a specific circulation
 */
export function useCirculationNotificationSettings(
  circulationId: string,
  options?: Omit<
    UseQueryOptions<CirculationNotificationSettings | null, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<CirculationNotificationSettings | null, Error>({
    queryKey: circulationNotificationKeys.circulation(circulationId),
    queryFn: () => getCirculationNotificationSettings(circulationId),
    ...options,
  });
}

/**
 * Update notification settings for a circulation
 */
export function useUpdateCirculationNotificationSettings(
  options?: Omit<
    UseMutationOptions<
      CirculationNotificationSettings,
      Error,
      { circulationId: string; input: CirculationNotificationSettingsInput }
    >,
    "mutationFn"
  >,
) {
  return useMutation<
    CirculationNotificationSettings,
    Error,
    { circulationId: string; input: CirculationNotificationSettingsInput }
  >({
    mutationFn: ({ circulationId, input }) =>
      updateCirculationNotificationSettings(circulationId, input),
    ...options,
  });
}

/**
 * Delete notification settings for a circulation
 */
export function useDeleteCirculationNotificationSettings(
  options?: Omit<UseMutationOptions<boolean, Error, string>, "mutationFn">,
) {
  return useMutation<boolean, Error, string>({
    mutationFn: (circulationId) =>
      deleteCirculationNotificationSettings(circulationId),
    ...options,
  });
}

/**
 * Get global circulation notification settings
 */
export function useGlobalCirculationNotificationSettings(
  options?: Omit<
    UseQueryOptions<GlobalCirculationNotificationSettings, Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<GlobalCirculationNotificationSettings, Error>({
    queryKey: circulationNotificationKeys.global(),
    queryFn: getGlobalCirculationNotificationSettings,
    ...options,
  });
}

/**
 * Update global circulation notification settings
 */
export function useUpdateGlobalCirculationNotificationSettings(
  options?: Omit<
    UseMutationOptions<
      GlobalCirculationNotificationSettings,
      Error,
      GlobalCirculationNotificationSettingsInput
    >,
    "mutationFn"
  >,
) {
  return useMutation<
    GlobalCirculationNotificationSettings,
    Error,
    GlobalCirculationNotificationSettingsInput
  >({
    mutationFn: (input) => updateGlobalCirculationNotificationSettings(input),
    ...options,
  });
}

/**
 * Get all circulations with their notification settings
 */
export function useCirculationsWithNotificationSettings(
  options?: Omit<
    UseQueryOptions<CirculationWithNotificationSettings[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<CirculationWithNotificationSettings[], Error>({
    queryKey: circulationNotificationKeys.allCirculations(),
    queryFn: getCirculationsWithNotificationSettings,
    ...options,
  });
}
