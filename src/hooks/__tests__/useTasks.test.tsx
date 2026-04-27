import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useTasks,
  useTasksByPlan,
  useTask,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  taskKeys,
} from "@/hooks/useTasks";
import type { Task } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getTasks: vi.fn(),
  getTasksByPlan: vi.fn(),
  createTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
}));

import {
  getTasks,
  getTasksByPlan,
  createTask,
  updateTask,
  deleteTask,
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
const mockTasks: Task[] = [
  {
    id: "task-1",
    plan_id: "plan-1",
    title: "Test Task 1",
    description: "Description 1",
    start_date: "2024-01-01",
    end_date: "2024-01-31",
    status: "pending",
    priority: "P1",
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "task-2",
    plan_id: "plan-1",
    title: "Test Task 2",
    description: "Description 2",
    start_date: "2024-02-01",
    end_date: "2024-02-28",
    status: "done",
    priority: "P2",
    created_at: "2024-01-01",
    updated_at: "2024-02-01",
  },
];

describe("useTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useTasks (get all tasks)", () => {
    it("should return tasks on successful fetch", async () => {
      vi.mocked(getTasks).mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTasks);
      expect(getTasks).toHaveBeenCalled();
    });

    it("should handle error when fetch fails", async () => {
      vi.mocked(getTasks).mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("should show loading state initially", () => {
      vi.mocked(getTasks).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useTasks(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("useTasksByPlan (get tasks by plan)", () => {
    it("should return tasks for a plan", async () => {
      vi.mocked(getTasksByPlan).mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasksByPlan("plan-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTasks);
      expect(getTasksByPlan).toHaveBeenCalledWith("plan-1");
    });

    it("should not fetch when planId is empty", () => {
      const { result } = renderHook(() => useTasksByPlan(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe("useTask (get single task)", () => {
    it("should return task by id", async () => {
      vi.mocked(getTasks).mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTask("task-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTasks[0]);
    });

    it("should throw error when task not found", async () => {
      vi.mocked(getTasks).mockResolvedValue([]);

      const { result } = renderHook(() => useTask("non-existent"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useTask(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(getTasks).not.toHaveBeenCalled();
    });
  });

  describe("useCreateTask (create task)", () => {
    it("should create task successfully", async () => {
      const newTask: Task = {
        id: "new-task",
        plan_id: "plan-1",
        title: "New Task",
        description: "New Description",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        status: "pending",
        priority: "P1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createTask).mockResolvedValue(newTask);
      vi.mocked(getTasks).mockResolvedValue([...mockTasks, newTask]);

      const { result } = renderHook(() => useCreateTask(), {
        wrapper: createWrapper(),
      });

      let createdTask: Task | undefined;
      await act(async () => {
        createdTask = await result.current.mutateAsync({
          plan_id: "plan-1",
          title: "New Task",
          description: "New Description",
          start_date: "2024-01-01",
          end_date: "2024-01-31",
          priority: "P1",
        });
      });

      expect(createdTask).toEqual(newTask);
      expect(createTask).toHaveBeenCalled();
    });

    it("should handle create error", async () => {
      vi.mocked(createTask).mockRejectedValue(new Error("Failed to create"));

      const { result } = renderHook(() => useCreateTask(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            plan_id: "plan-1",
            title: "New Task",
          });
        }),
      ).rejects.toThrow("Failed to create");
    });
  });

  describe("useUpdateTask (update task)", () => {
    it("should update task successfully", async () => {
      const updatedTask = { ...mockTasks[0], title: "Updated Title" };
      vi.mocked(updateTask).mockResolvedValue(updatedTask);

      const { result } = renderHook(() => useUpdateTask(), {
        wrapper: createWrapper(),
      });

      let updated: Task | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "task-1",
          title: "Updated Title",
        });
      });

      expect(updated?.title).toBe("Updated Title");
      expect(updateTask).toHaveBeenCalled();
    });

    it("should update task status", async () => {
      const updatedTask = { ...mockTasks[0], status: "done" as const };
      vi.mocked(updateTask).mockResolvedValue(updatedTask);

      const { result } = renderHook(() => useUpdateTask(), {
        wrapper: createWrapper(),
      });

      let updated: Task | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "task-1",
          status: "done",
        });
      });

      expect(updated?.status).toBe("done");
    });

    it("should handle update error", async () => {
      vi.mocked(updateTask).mockRejectedValue(new Error("Failed to update"));

      const { result } = renderHook(() => useUpdateTask(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: "task-1", title: "Updated" });
        }),
      ).rejects.toThrow("Failed to update");
    });

    it("should return undefined from the cache updater when no previous tasks exist", async () => {
      const updatedTask = { ...mockTasks[0], title: "Updated Title" };
      vi.mocked(updateTask).mockResolvedValue(updatedTask);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });

      const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateTask(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "task-1",
          title: "Updated Title",
        });
      });

      const updater = setQueryDataSpy.mock.calls[0]?.[1] as
        | ((old: Task[] | undefined) => Task[] | undefined)
        | undefined;

      expect(updater?.(undefined)).toBeUndefined();
    });

    it("should replace the matching task in cache and keep non-matching tasks", async () => {
      const updatedTask = { ...mockTasks[0], title: "Updated Title" };
      vi.mocked(updateTask).mockResolvedValue(updatedTask);
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
      });

      queryClient.setQueryData(taskKeys.tasks, mockTasks);
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUpdateTask(), {
        wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          id: "task-1",
          title: "Updated Title",
        });
      });

      expect(queryClient.getQueryData(taskKeys.tasks)).toEqual([
        updatedTask,
        mockTasks[1],
      ]);
    });
  });

  describe("useDeleteTask (delete task)", () => {
    it("should delete task successfully", async () => {
      vi.mocked(deleteTask).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteTask(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("task-1");
      });

      expect(deleteTask).toHaveBeenCalled();
    });

    it("should handle delete error", async () => {
      vi.mocked(deleteTask).mockRejectedValue(new Error("Failed to delete"));

      const { result } = renderHook(() => useDeleteTask(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("task-1");
        }),
      ).rejects.toThrow("Failed to delete");
    });
  });

  describe("taskKeys", () => {
    it("should have correct query keys", () => {
      expect(taskKeys.tasks).toEqual(["tasks"]);
      expect(taskKeys.task("task-1")).toEqual(["tasks", "task-1"]);
      expect(taskKeys.tasksByPlan("plan-1")).toEqual([
        "tasks",
        "byPlan",
        "plan-1",
      ]);
    });
  });
});
