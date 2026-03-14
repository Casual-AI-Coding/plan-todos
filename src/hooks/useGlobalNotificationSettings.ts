"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGlobalNotificationSettings,
  updateGlobalNotificationSettings,
  resetGlobalNotificationSettings,
  type GlobalNotificationSettings,
} from "@/lib/api";

export function useGlobalNotificationSettings() {
  return useQuery({
    queryKey: ["globalNotificationSettings"],
    queryFn: getGlobalNotificationSettings,
  });
}

export function useUpdateGlobalNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: GlobalNotificationSettings) =>
      updateGlobalNotificationSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["globalNotificationSettings"],
      });
    },
  });
}

export function useResetGlobalNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetGlobalNotificationSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["globalNotificationSettings"],
      });
    },
  });
}
