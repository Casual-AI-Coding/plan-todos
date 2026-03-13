/**
 * Notification Polling Hook
 *
 * Provides polling for due reminders with automatic refresh.
 */

import { useQuery, useMutation } from "@tanstack/react-query";
import { getDueReminders, markReminderSent } from "@/lib/api/notifications";
import type { DueReminder } from "@/lib/types/notification";

const DEFAULT_POLLING_INTERVAL = 30000; // 30 seconds

export interface UseNotificationPollingOptions {
  /** Polling interval in milliseconds (default: 30000) */
  pollingInterval?: number;
}

export interface UseNotificationPollingResult {
  dueReminders: DueReminder[];
  pendingCount: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<unknown>;
}

export function useNotificationPolling(
  options: UseNotificationPollingOptions = {},
): UseNotificationPollingResult {
  const { pollingInterval = DEFAULT_POLLING_INTERVAL } = options;

  const {
    data: dueReminders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<DueReminder[]>({
    queryKey: ["dueReminders"],
    queryFn: getDueReminders,
    refetchInterval: pollingInterval,
    staleTime: pollingInterval,
  });

  // Derive pending count directly from dueReminders (removed redundant local state)
  const pendingCount = dueReminders.length;

  return {
    dueReminders,
    pendingCount,
    isLoading,
    isError,
    refetch,
  };
}

/**
 * Hook to mark a reminder as sent
 */
export function useMarkReminderSent() {
  return useMutation({
    mutationFn: ({
      entityType,
      entityId,
    }: {
      entityType: string;
      entityId: string;
    }) => markReminderSent(entityType, entityId),
  });
}
