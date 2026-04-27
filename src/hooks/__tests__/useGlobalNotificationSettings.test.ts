import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  useGlobalNotificationSettings,
  useResetGlobalNotificationSettings,
  useUpdateGlobalNotificationSettings,
} from "../useGlobalNotificationSettings";
import type {
  GlobalNotificationSettings,
  GlobalNotificationSettingsUpdate,
} from "@/lib/types";

vi.mock("@/lib/api/notifications", () => ({
  getGlobalNotificationSettings: vi.fn(),
  updateGlobalNotificationSettings: vi.fn(),
  resetGlobalNotificationSettings: vi.fn(),
}));

import {
  getGlobalNotificationSettings,
  resetGlobalNotificationSettings,
  updateGlobalNotificationSettings,
} from "@/lib/api/notifications";

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(
      QueryClientProvider,
      { client: queryClient },
      children,
    );
  };
}

const mockSettings: GlobalNotificationSettings = {
  id: "settings-1",
  master_enabled: true,
  desktop_enabled: true,
  sound_enabled: false,
  default_reminder_times: [15, 60],
  todo_default_enabled: true,
  todo_default_times: [30],
  plan_default_enabled: true,
  plan_default_times: [60],
  target_default_enabled: false,
  target_default_times: [],
  dnd_enabled: false,
  dnd_start_time: undefined,
  dnd_end_time: undefined,
  dnd_days: [],
  channel_priority: ["desktop"],
  retention_days: 30,
  created_at: "2026-04-28T10:00:00Z",
  updated_at: "2026-04-28T10:00:00Z",
};

const updatedSettings: GlobalNotificationSettingsUpdate = {
  master_enabled: true,
  desktop_enabled: true,
  sound_enabled: true,
  default_reminder_times: [15, 60],
  todo_default_enabled: true,
  todo_default_times: [30],
  plan_default_enabled: true,
  plan_default_times: [60],
  target_default_enabled: false,
  target_default_times: [],
  dnd_enabled: false,
  dnd_start_time: undefined,
  dnd_end_time: undefined,
  dnd_days: [],
  channel_priority: ["desktop"],
  retention_days: 30,
};

describe("useGlobalNotificationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads global notification settings", async () => {
    vi.mocked(getGlobalNotificationSettings).mockResolvedValue(mockSettings);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(() => useGlobalNotificationSettings(), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSettings);
    expect(getGlobalNotificationSettings).toHaveBeenCalledTimes(1);
  });

  it("updates settings and writes them into the cache", async () => {
    vi.mocked(updateGlobalNotificationSettings).mockResolvedValue({
      ...mockSettings,
      sound_enabled: true,
    });
    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

    const { result } = renderHook(() => useUpdateGlobalNotificationSettings(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync(updatedSettings);
    });

    expect(updateGlobalNotificationSettings).toHaveBeenCalledWith(
      updatedSettings,
      expect.objectContaining({ client: queryClient }),
    );
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ["globalNotificationSettings"],
      expect.objectContaining({ sound_enabled: true }),
    );
  });

  it("resets settings and writes defaults into the cache", async () => {
    vi.mocked(resetGlobalNotificationSettings).mockResolvedValue(mockSettings);
    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");

    const { result } = renderHook(() => useResetGlobalNotificationSettings(), {
      wrapper: createWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(resetGlobalNotificationSettings).toHaveBeenCalledTimes(1);
    expect(setQueryDataSpy).toHaveBeenCalledWith(
      ["globalNotificationSettings"],
      mockSettings,
    );
  });
});
