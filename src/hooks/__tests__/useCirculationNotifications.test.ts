import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement, type ReactNode } from "react";
import {
  circulationNotificationKeys,
  useCirculationNotificationSettings,
  useCirculationsWithNotificationSettings,
  useDeleteCirculationNotificationSettings,
  useGlobalCirculationNotificationSettings,
  useUpdateCirculationNotificationSettings,
  useUpdateGlobalCirculationNotificationSettings,
} from "../useCirculationNotifications";
import type {
  CirculationNotificationSettings,
  CirculationNotificationSettingsInput,
  CirculationWithNotificationSettings,
  GlobalCirculationNotificationSettings,
  GlobalCirculationNotificationSettingsInput,
} from "@/lib/types";

vi.mock("@/lib/api/notifications", () => ({
  getCirculationNotificationSettings: vi.fn(),
  updateCirculationNotificationSettings: vi.fn(),
  deleteCirculationNotificationSettings: vi.fn(),
  getGlobalCirculationNotificationSettings: vi.fn(),
  updateGlobalCirculationNotificationSettings: vi.fn(),
  getCirculationsWithNotificationSettings: vi.fn(),
}));

import {
  deleteCirculationNotificationSettings,
  getCirculationNotificationSettings,
  getCirculationsWithNotificationSettings,
  getGlobalCirculationNotificationSettings,
  updateCirculationNotificationSettings,
  updateGlobalCirculationNotificationSettings,
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

const mockCirculationSettings: CirculationNotificationSettings = {
  id: "settings-1",
  circulation_id: "circulation-1",
  enabled: true,
  reminder_type: "fixed",
  fixed_time: "08:30",
  before_minutes: undefined,
  achievement_type: undefined,
  achievement_threshold: undefined,
  channels: "desktop,email",
  message_template: "Time to check in",
  created_at: "2026-04-28T10:00:00Z",
  updated_at: "2026-04-28T10:00:00Z",
};

const mockGlobalSettings: GlobalCirculationNotificationSettings = {
  id: "global-1",
  master_enabled: true,
  default_reminder_type: "fixed",
  default_fixed_time: "09:00",
  default_before_minutes: 30,
  achievement_notifications: true,
  streak_milestones: "3,7,30",
  count_milestones: "10,50",
  default_channels: "desktop",
  dnd_enabled: false,
  dnd_start_time: "22:00",
  dnd_end_time: "07:00",
  updated_at: "2026-04-28T10:00:00Z",
};

const mockCirculations: CirculationWithNotificationSettings[] = [
  {
    id: "circulation-1",
    title: "Read",
    circulation_type: "periodic",
    frequency: "daily",
    status: "active",
    notification_settings: mockCirculationSettings,
  },
];

describe("useCirculationNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exposes the expected query keys", () => {
    expect(circulationNotificationKeys.all).toEqual([
      "circulationNotifications",
    ]);
    expect(circulationNotificationKeys.circulation("c1")).toEqual([
      "circulationNotifications",
      "circulation",
      "c1",
    ]);
    expect(circulationNotificationKeys.global()).toEqual([
      "circulationNotifications",
      "global",
    ]);
    expect(circulationNotificationKeys.allCirculations()).toEqual([
      "circulationNotifications",
      "allCirculations",
    ]);
  });

  it("loads per-circulation settings", async () => {
    vi.mocked(getCirculationNotificationSettings).mockResolvedValue(
      mockCirculationSettings,
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useCirculationNotificationSettings("circulation-1"),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCirculationSettings);
    expect(getCirculationNotificationSettings).toHaveBeenCalledWith(
      "circulation-1",
    );
  });

  it("updates per-circulation settings", async () => {
    vi.mocked(updateCirculationNotificationSettings).mockResolvedValue(
      mockCirculationSettings,
    );
    const queryClient = new QueryClient();
    const input: CirculationNotificationSettingsInput = {
      enabled: true,
      reminder_type: "fixed",
      fixed_time: "08:30",
    };

    const { result } = renderHook(
      () => useUpdateCirculationNotificationSettings(),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await result.current.mutateAsync({
        circulationId: "circulation-1",
        input,
      });
    });

    expect(updateCirculationNotificationSettings).toHaveBeenCalledWith(
      "circulation-1",
      input,
    );
  });

  it("deletes per-circulation settings", async () => {
    vi.mocked(deleteCirculationNotificationSettings).mockResolvedValue(true);
    const queryClient = new QueryClient();

    const { result } = renderHook(
      () => useDeleteCirculationNotificationSettings(),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await result.current.mutateAsync("circulation-1");
    });

    expect(deleteCirculationNotificationSettings).toHaveBeenCalledWith(
      "circulation-1",
    );
  });

  it("loads global circulation settings", async () => {
    vi.mocked(getGlobalCirculationNotificationSettings).mockResolvedValue(
      mockGlobalSettings,
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useGlobalCirculationNotificationSettings(),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockGlobalSettings);
  });

  it("updates global circulation settings", async () => {
    vi.mocked(updateGlobalCirculationNotificationSettings).mockResolvedValue(
      mockGlobalSettings,
    );
    const queryClient = new QueryClient();
    const input: GlobalCirculationNotificationSettingsInput = {
      master_enabled: false,
      default_before_minutes: 15,
    };

    const { result } = renderHook(
      () => useUpdateGlobalCirculationNotificationSettings(),
      { wrapper: createWrapper(queryClient) },
    );

    await act(async () => {
      await result.current.mutateAsync(input);
    });

    expect(updateGlobalCirculationNotificationSettings).toHaveBeenCalledWith(
      input,
    );
  });

  it("loads all circulations with their settings", async () => {
    vi.mocked(getCirculationsWithNotificationSettings).mockResolvedValue(
      mockCirculations,
    );
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    const { result } = renderHook(
      () => useCirculationsWithNotificationSettings(),
      { wrapper: createWrapper(queryClient) },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCirculations);
    expect(getCirculationsWithNotificationSettings).toHaveBeenCalledTimes(1);
  });
});
