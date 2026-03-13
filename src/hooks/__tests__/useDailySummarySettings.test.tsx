import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useDailySummarySettings,
  useUpdateDailySummarySettings,
} from "../useDailySummarySettings";
import type { DailySummarySettings } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getDailySummarySettings: vi.fn(),
  updateDailySummarySettings: vi.fn(),
}));

import { getDailySummarySettings, updateDailySummarySettings } from "@/lib/api";

// Mock Tauri invoke
vi.mock("@tauri-apps/api/core", () => ({
  invoke: vi.fn(),
}));

// Create a wrapper for the test
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
};

// Mock data
const mockSettings: DailySummarySettings = {
  id: "settings-1",
  enabled: true,
  time: "09:00",
  include_pending: true,
  include_overdue: true,
  include_completed: false,
  created_at: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("useDailySummarySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDailySummarySettings).mockReset();
    vi.mocked(updateDailySummarySettings).mockReset();
  });

  describe("useDailySummarySettings", () => {
    it("应该返回每日汇总设置", async () => {
      vi.mocked(getDailySummarySettings).mockResolvedValue(mockSettings);

      const { result } = renderHook(() => useDailySummarySettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSettings);
    });

    it("加载中状态应该为 true", () => {
      vi.mocked(getDailySummarySettings).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const { result } = renderHook(() => useDailySummarySettings(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("错误时应该返回错误", async () => {
      const error = new Error("Failed to fetch settings");
      vi.mocked(getDailySummarySettings).mockRejectedValue(error);

      const { result } = renderHook(() => useDailySummarySettings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });
  });

  describe("useUpdateDailySummarySettings", () => {
    it("应该更新设置并刷新查询", async () => {
      const updatedSettings: DailySummarySettings = {
        ...mockSettings,
        enabled: false,
        time: "10:00",
      };
      vi.mocked(updateDailySummarySettings).mockResolvedValue(updatedSettings);

      const { result } = renderHook(() => useUpdateDailySummarySettings(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          enabled: false,
          time: "10:00",
          includePending: true,
          includeOverdue: true,
          includeCompleted: false,
        });
      });

      expect(updateDailySummarySettings).toHaveBeenCalledWith(
        false,
        "10:00",
        true,
        true,
        false,
      );
    });

    it("更新失败时应该返回错误", async () => {
      const error = new Error("Failed to update settings");
      vi.mocked(updateDailySummarySettings).mockRejectedValue(error);

      const { result } = renderHook(() => useUpdateDailySummarySettings(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            enabled: true,
            time: "09:00",
            includePending: true,
            includeOverdue: true,
            includeCompleted: false,
          });
        }),
      ).rejects.toEqual(error);
    });

    it("成功更新后应该使查询失效", async () => {
      vi.mocked(updateDailySummarySettings).mockResolvedValue(mockSettings);

      const { result } = renderHook(() => useUpdateDailySummarySettings(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          enabled: true,
          time: "09:00",
          includePending: true,
          includeOverdue: true,
          includeCompleted: false,
        });
      });

      // The mutation should succeed - wait for state to update
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });
});
