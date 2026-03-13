import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useCirculations,
  useCirculation,
  useCirculationLogs,
  useCreateCirculation,
  useUpdateCirculation,
  useDeleteCirculation,
  useCheckinCirculation,
  useUndoCheckinCirculation,
  circulationKeys,
} from "@/hooks/useCirculations";
import type { Circulation, CirculationLog } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getCirculations: vi.fn(),
  getCirculation: vi.fn(),
  getCirculationLogs: vi.fn(),
  createCirculation: vi.fn(),
  updateCirculation: vi.fn(),
  deleteCirculation: vi.fn(),
  checkinCirculation: vi.fn(),
  undoCheckinCirculation: vi.fn(),
}));

import {
  getCirculations,
  getCirculation,
  getCirculationLogs,
  createCirculation,
  updateCirculation,
  deleteCirculation,
  checkinCirculation,
  undoCheckinCirculation,
} from "@/lib/api";

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
const mockCirculations: Circulation[] = [
  {
    id: "circulation-1",
    title: "Test Circulation 1",
    content: null,
    circulation_type: "periodic",
    frequency: "daily",
    frequency_config: null,
    target_count: null,
    current_count: 0,
    streak_count: 5,
    best_streak: 10,
    last_completed_at: "2024-01-10",
    status: "active",
    created_at: "2024-01-01",
    updated_at: "2024-01-10",
  },
  {
    id: "circulation-2",
    title: "Test Circulation 2",
    content: null,
    circulation_type: "count",
    frequency: null,
    frequency_config: null,
    target_count: 100,
    current_count: 50,
    streak_count: 0,
    best_streak: 0,
    last_completed_at: "2024-01-10",
    status: "active",
    created_at: "2024-01-01",
    updated_at: "2024-01-10",
  },
];

const mockLogs: CirculationLog[] = [
  {
    id: "log-1",
    circulation_id: "circulation-1",
    completed_at: "2024-01-10",
    note: "Good job",
    period: "2024-01-10",
    count: null,
  },
];

describe("useCirculations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useCirculations (get all circulations)", () => {
    it("should return circulations on successful fetch", async () => {
      vi.mocked(getCirculations).mockResolvedValue(mockCirculations);

      const { result } = renderHook(() => useCirculations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCirculations);
      expect(getCirculations).toHaveBeenCalled();
    });

    it("should handle error when fetch fails", async () => {
      vi.mocked(getCirculations).mockRejectedValue(
        new Error("Failed to fetch"),
      );

      const { result } = renderHook(() => useCirculations(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("should show loading state initially", () => {
      vi.mocked(getCirculations).mockImplementation(
        () => new Promise(() => {}),
      );

      const { result } = renderHook(() => useCirculations(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("useCirculation (get single circulation)", () => {
    it("should return circulation by id", async () => {
      vi.mocked(getCirculation).mockResolvedValue(mockCirculations[0]);

      const { result } = renderHook(() => useCirculation("circulation-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockCirculations[0]);
      expect(getCirculation).toHaveBeenCalledWith("circulation-1");
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useCirculation(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useCirculationLogs (get circulation logs)", () => {
    it("should return logs for a circulation", async () => {
      vi.mocked(getCirculationLogs).mockResolvedValue(mockLogs);

      const { result } = renderHook(() => useCirculationLogs("circulation-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockLogs);
      expect(getCirculationLogs).toHaveBeenCalledWith("circulation-1", 20);
    });

    it("should respect custom limit", async () => {
      vi.mocked(getCirculationLogs).mockResolvedValue(mockLogs);

      const { result } = renderHook(
        () => useCirculationLogs("circulation-1", 10),
        {
          wrapper: createWrapper(),
        },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(getCirculationLogs).toHaveBeenCalledWith("circulation-1", 10);
    });

    it("should not fetch when circulationId is empty", () => {
      const { result } = renderHook(() => useCirculationLogs(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useCreateCirculation (create circulation)", () => {
    it("should create circulation successfully", async () => {
      const newCirculation: Circulation = {
        id: "new-circulation",
        title: "New Circulation",
        content: null,
        circulation_type: "periodic",
        frequency: "daily",
        frequency_config: null,
        target_count: null,
        current_count: 0,
        streak_count: 0,
        best_streak: 0,
        last_completed_at: null,
        status: "active",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createCirculation).mockResolvedValue(newCirculation);
      vi.mocked(getCirculations).mockResolvedValue([
        ...mockCirculations,
        newCirculation,
      ]);

      const { result } = renderHook(() => useCreateCirculation(), {
        wrapper: createWrapper(),
      });

      let createdCirculation: Circulation | undefined;
      await act(async () => {
        createdCirculation = await result.current.mutateAsync({
          title: "New Circulation",
          circulation_type: "periodic",
          frequency: "daily",
        });
      });

      expect(createdCirculation).toEqual(newCirculation);
      expect(createCirculation).toHaveBeenCalled();
    });

    it("should handle create error", async () => {
      vi.mocked(createCirculation).mockRejectedValue(
        new Error("Failed to create"),
      );

      const { result } = renderHook(() => useCreateCirculation(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            title: "New Circulation",
            circulation_type: "periodic",
          });
        }),
      ).rejects.toThrow("Failed to create");
    });
  });

  describe("useUpdateCirculation (update circulation)", () => {
    it("should update circulation successfully", async () => {
      const updatedCirculation = {
        ...mockCirculations[0],
        title: "Updated Title",
      };
      vi.mocked(updateCirculation).mockResolvedValue(updatedCirculation);

      const { result } = renderHook(() => useUpdateCirculation(), {
        wrapper: createWrapper(),
      });

      let updated: Circulation | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "circulation-1",
          title: "Updated Title",
        });
      });

      expect(updated?.title).toBe("Updated Title");
      expect(updateCirculation).toHaveBeenCalled();
    });

    it("should handle update error", async () => {
      vi.mocked(updateCirculation).mockRejectedValue(
        new Error("Failed to update"),
      );

      const { result } = renderHook(() => useUpdateCirculation(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            id: "circulation-1",
            title: "Updated",
          });
        }),
      ).rejects.toThrow("Failed to update");
    });
  });

  describe("useDeleteCirculation (delete circulation)", () => {
    it("should delete circulation successfully", async () => {
      vi.mocked(deleteCirculation).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteCirculation(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("circulation-1");
      });

      expect(deleteCirculation).toHaveBeenCalled();
    });

    it("should handle delete error", async () => {
      vi.mocked(deleteCirculation).mockRejectedValue(
        new Error("Failed to delete"),
      );

      const { result } = renderHook(() => useDeleteCirculation(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("circulation-1");
        }),
      ).rejects.toThrow("Failed to delete");
    });
  });

  describe("useCheckinCirculation (checkin)", () => {
    it("should checkin successfully", async () => {
      const checkedIn = { ...mockCirculations[0], current_count: 1 };
      vi.mocked(checkinCirculation).mockResolvedValue(checkedIn);

      const { result } = renderHook(() => useCheckinCirculation(), {
        wrapper: createWrapper(),
      });

      let updated: Circulation | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "circulation-1",
        });
      });

      expect(updated).toEqual(checkedIn);
      expect(checkinCirculation).toHaveBeenCalled();
    });

    it("should handle checkin error", async () => {
      vi.mocked(checkinCirculation).mockRejectedValue(
        new Error("Failed to checkin"),
      );

      const { result } = renderHook(() => useCheckinCirculation(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: "circulation-1" });
        }),
      ).rejects.toThrow("Failed to checkin");
    });
  });

  describe("useUndoCheckinCirculation (undo checkin)", () => {
    it("should undo checkin successfully", async () => {
      const undone = { ...mockCirculations[0], current_count: 0 };
      vi.mocked(undoCheckinCirculation).mockResolvedValue(undone);

      const { result } = renderHook(() => useUndoCheckinCirculation(), {
        wrapper: createWrapper(),
      });

      let updated: Circulation | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync("circulation-1");
      });

      expect(updated).toEqual(undone);
      expect(undoCheckinCirculation).toHaveBeenCalledWith("circulation-1");
    });

    it("should handle undo error", async () => {
      vi.mocked(undoCheckinCirculation).mockRejectedValue(
        new Error("Failed to undo"),
      );

      const { result } = renderHook(() => useUndoCheckinCirculation(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("circulation-1");
        }),
      ).rejects.toThrow("Failed to undo");
    });
  });

  describe("circulationKeys", () => {
    it("should have correct query keys", () => {
      expect(circulationKeys.circulations).toEqual(["circulations"]);
      expect(circulationKeys.circulation("circulation-1")).toEqual([
        "circulations",
        "circulation-1",
      ]);
      expect(circulationKeys.circulationLogs("circulation-1")).toEqual([
        "circulations",
        "circulation-1",
        "logs",
      ]);
    });
  });
});
