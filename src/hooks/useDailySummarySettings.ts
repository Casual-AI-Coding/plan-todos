"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDailySummarySettings,
  updateDailySummarySettings,
  type DailySummarySettings,
} from "@/lib/api";

export function useDailySummarySettings() {
  return useQuery({
    queryKey: ["dailySummarySettings"],
    queryFn: getDailySummarySettings,
  });
}

export function useUpdateDailySummarySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: {
      enabled: boolean;
      time: string;
      includePending: boolean;
      includeOverdue: boolean;
      includeCompleted: boolean;
    }) =>
      updateDailySummarySettings(
        settings.enabled,
        settings.time,
        settings.includePending,
        settings.includeOverdue,
        settings.includeCompleted,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dailySummarySettings"],
      });
    },
  });
}
