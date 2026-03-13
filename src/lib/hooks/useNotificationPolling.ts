/**
 * Notification Polling Hook
 *
 * Provides polling for due reminders with automatic refresh.
 */

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getDueReminders, markReminderSent } from "@/lib/api";
import type { DueReminder } from "@/lib/types";

const POLLING_INTERVAL = 30000; // 30 seconds

export interface UseNotificationPollingResult {
  dueReminders: DueReminder[];
  pendingCount: number;
  isLoading: boolean;
  isError: boolean;
  refetch: () => Promise<void>;
}

export function useNotificationPolling(): UseNotificationPollingResult {
  const [localPendingCount, setLocalPendingCount] = useState(0);

  const {
    data: dueReminders = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<DueReminder[]>({
    queryKey: ["dueReminders"],
    queryFn: getDueReminders,
    refetchInterval: POLLING_INTERVAL,
    staleTime: POLLING_INTERVAL,
  });

  // Update local pending count when due reminders change
  useEffect(() => {
    setLocalPendingCount(dueReminders.length);
  }, [dueReminders]);

  return {
    dueReminders,
    pendingCount: localPendingCount,
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
