import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useNotificationPlugins,
  useCreateNotificationPlugin,
  useUpdateNotificationPlugin,
  useDeleteNotificationPlugin,
} from "../useNotificationPlugins";
import type { NotificationPlugin } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getNotificationPlugins: vi.fn(),
  createNotificationPlugin: vi.fn(),
  updateNotificationPlugin: vi.fn(),
  deleteNotificationPlugin: vi.fn(),
}));

import {
  getNotificationPlugins,
  createNotificationPlugin,
  updateNotificationPlugin,
  deleteNotificationPlugin,
} from "@/lib/api";

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
const mockPlugins: NotificationPlugin[] = [
  {
    id: "plugin-1",
    name: "Test Plugin 1",
    plugin_type: "system",
    enabled: true,
    config: "{}",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "plugin-2",
    name: "Test Plugin 2",
    plugin_type: "custom",
    enabled: false,
    config: '{"key": "value"}',
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
];

describe("useNotificationPlugins", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getNotificationPlugins).mockReset();
  });

  describe("useNotificationPlugins", () => {
    it("应该返回插件列表", async () => {
      vi.mocked(getNotificationPlugins).mockResolvedValue(mockPlugins);

      const { result } = renderHook(() => useNotificationPlugins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPlugins);
    });

    it("加载中状态应该为 true", () => {
      vi.mocked(getNotificationPlugins).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const { result } = renderHook(() => useNotificationPlugins(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });

    it("错误时应该返回错误", async () => {
      const error = new Error("Failed to fetch plugins");
      vi.mocked(getNotificationPlugins).mockRejectedValue(error);

      const { result } = renderHook(() => useNotificationPlugins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });

    it("没有数据时应该返回空数组", async () => {
      vi.mocked(getNotificationPlugins).mockResolvedValue([]);

      const { result } = renderHook(() => useNotificationPlugins(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe("useCreateNotificationPlugin", () => {
    it("应该创建新插件并刷新查询", async () => {
      const newPlugin: NotificationPlugin = {
        id: "plugin-3",
        name: "New Plugin",
        plugin_type: "custom",
        enabled: true,
        config: "{}",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createNotificationPlugin).mockResolvedValue(newPlugin);

      const { result } = renderHook(() => useCreateNotificationPlugin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          name: "New Plugin",
          plugin_type: "custom",
          config: "{}",
        });
      });

      expect(createNotificationPlugin).toHaveBeenCalledWith(
        "New Plugin",
        "custom",
        "{}",
      );
    });

    it("创建失败时应该返回错误", async () => {
      const error = new Error("Failed to create plugin");
      vi.mocked(createNotificationPlugin).mockRejectedValue(error);

      const { result } = renderHook(() => useCreateNotificationPlugin(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            name: "New Plugin",
            plugin_type: "custom",
            config: "{}",
          });
        }),
      ).rejects.toEqual(error);
    });
  });

  describe("useUpdateNotificationPlugin", () => {
    it("应该更新插件并刷新查询", async () => {
      const updatedPlugin: NotificationPlugin = {
        ...mockPlugins[0],
        name: "Updated Plugin",
      };
      vi.mocked(updateNotificationPlugin).mockResolvedValue(updatedPlugin);

      const { result } = renderHook(() => useUpdateNotificationPlugin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "plugin-1",
          name: "Updated Plugin",
          enabled: true,
          config: "{}",
        });
      });

      expect(updateNotificationPlugin).toHaveBeenCalledWith(
        "plugin-1",
        "Updated Plugin",
        true,
        "{}",
      );
    });
  });

  describe("useDeleteNotificationPlugin", () => {
    it("应该删除插件并刷新查询", async () => {
      vi.mocked(deleteNotificationPlugin).mockResolvedValue(true);

      const { result } = renderHook(() => useDeleteNotificationPlugin(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("plugin-1");
      });

      expect(deleteNotificationPlugin).toHaveBeenCalled();
    });

    it("删除失败时应该返回错误", async () => {
      const error = new Error("Failed to delete plugin");
      vi.mocked(deleteNotificationPlugin).mockRejectedValue(error);

      const { result } = renderHook(() => useDeleteNotificationPlugin(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("plugin-1");
        }),
      ).rejects.toEqual(error);
    });
  });
});
