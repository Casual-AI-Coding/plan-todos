import { renderHook, waitFor, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";

import {
  useMarkReminderSent,
  useNotificationPolling,
} from "../useNotificationPolling";
import type { DueReminder } from "@/lib/types/notification";

vi.mock("@/lib/api/notifications", () => ({
  getDueReminders: vi.fn(),
  markReminderSent: vi.fn(),
}));

import { getDueReminders, markReminderSent } from "@/lib/api/notifications";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

function getPollingOptions(queryClient: QueryClient) {
  const query = queryClient.getQueryCache().find({ queryKey: ["dueReminders"] });
  return query?.options as
    | { refetchInterval?: number; staleTime?: number }
    | undefined;
}

const mockDueReminders: DueReminder[] = [
  {
    entity_type: "todo",
    entity_id: "todo-1",
    title: "Todo reminder",
    due_date: "2026-04-28T12:00:00Z",
    reminder_times: [15],
    minutes_until_due: 15,
  },
  {
    entity_type: "plan",
    entity_id: "plan-1",
    title: "Plan reminder",
    due_date: "2026-04-28T13:00:00Z",
    reminder_times: [30],
    minutes_until_due: 30,
  },
];

describe("useNotificationPolling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the default polling interval and derives pendingCount from reminders", async () => {
    vi.mocked(getDueReminders).mockResolvedValue(mockDueReminders);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useNotificationPolling(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.dueReminders).toEqual(mockDueReminders);
    expect(result.current.pendingCount).toBe(mockDueReminders.length);

    const options = getPollingOptions(queryClient);
    expect(options?.refetchInterval).toBe(30000);
    expect(options?.staleTime).toBe(30000);
  });

  it("applies a custom polling interval", async () => {
    vi.mocked(getDueReminders).mockResolvedValue([mockDueReminders[0]]);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    renderHook(() => useNotificationPolling({ pollingInterval: 5000 }), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => {
      expect(queryClient.getQueryData(["dueReminders"])).toEqual([
        mockDueReminders[0],
      ]);
    });

    const options = getPollingOptions(queryClient);
    expect(options?.refetchInterval).toBe(5000);
    expect(options?.staleTime).toBe(5000);
  });

  it("marks a reminder as sent through the mutation hook", async () => {
    vi.mocked(markReminderSent).mockResolvedValue(true);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    const { result } = renderHook(() => useMarkReminderSent(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({
        entityType: "todo",
        entityId: "todo-1",
      });
    });

    expect(markReminderSent).toHaveBeenCalledWith("todo", "todo-1");
  });
});
