import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import {
  useGlobalNotificationSettings,
  useUpdateGlobalNotificationSettings,
  useResetGlobalNotificationSettings,
} from "./useGlobalNotificationSettings";
import * as api from "@/lib/api";
import type { GlobalNotificationSettings } from "@/lib/types";

// Mock the API module
vi.mock("@/lib/api", () => ({
  getGlobalNotificationSettings: vi.fn(),
  updateGlobalNotificationSettings: vi.fn(),
  resetGlobalNotificationSettings: vi.fn(),
}));

const mockSettings: GlobalNotificationSettings = {
  id: "default",
  master_enabled: true,
  desktop_enabled: true,
  sound_enabled: true,
  default_reminder_times: [5, 15, 30],
  todo_default_enabled: true,
  todo_default_times: [5, 15, 30],
  plan_default_enabled: true,
  plan_default_times: [5, 15, 30],
  target_default_enabled: true,
  target_default_times: [5, 15, 30],
  dnd_enabled: false,
  dnd_start_time: "22:00",
  dnd_end_time: "08:00",
  dnd_days: [0, 1, 2, 3, 4, 5, 6],
  channel_priority: ["desktop", "email", "webhook"],
  retention_days: 30,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

describe("useGlobalNotificationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch global notification settings", async () => {
    vi.mocked(api.getGlobalNotificationSettings).mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useGlobalNotificationSettings(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockSettings);
    expect(api.getGlobalNotificationSettings).toHaveBeenCalledTimes(1);
  });

  it("should handle error when fetching fails", async () => {
    vi.mocked(api.getGlobalNotificationSettings).mockRejectedValue(
      new Error("Failed to fetch")
    );

    const { result } = renderHook(() => useGlobalNotificationSettings(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });
});

describe("useUpdateGlobalNotificationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update global notification settings", async () => {
    const updatedSettings = { ...mockSettings, retention_days: 90 };
    vi.mocked(api.updateGlobalNotificationSettings).mockResolvedValue(updatedSettings);

    const { result } = renderHook(() => useUpdateGlobalNotificationSettings(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(updatedSettings);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.updateGlobalNotificationSettings).toHaveBeenCalledWith(updatedSettings);
  });
});

describe("useResetGlobalNotificationSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reset global notification settings to defaults", async () => {
    vi.mocked(api.resetGlobalNotificationSettings).mockResolvedValue(mockSettings);

    const { result } = renderHook(() => useResetGlobalNotificationSettings(), {
      wrapper: createWrapper(),
    });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.resetGlobalNotificationSettings).toHaveBeenCalledTimes(1);
  });
});
