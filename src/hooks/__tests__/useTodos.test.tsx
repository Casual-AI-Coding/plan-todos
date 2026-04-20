import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useTodos,
  useTodo,
  useCreateTodo,
  useUpdateTodo,
  useDeleteTodo,
  todoKeys,
  type CreateTodoInput,
  type UpdateTodoInput,
} from "@/hooks/useTodos";
import type { Todo } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getTodo: vi.fn(),
  getTodos: vi.fn(),
  createTodo: vi.fn(),
  updateTodo: vi.fn(),
  deleteTodo: vi.fn(),
}));

import {
  getTodo,
  getTodos,
  createTodo,
  updateTodo,
  deleteTodo,
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
const mockTodos: Todo[] = [
  {
    id: "todo-1",
    title: "Test Todo 1",
    content: "Content 1",
    due_date: "2024-01-01",
    status: "pending",
    priority: "P1",
    sort_order: 0,
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
  },
  {
    id: "todo-2",
    title: "Test Todo 2",
    content: "Content 2",
    due_date: "2024-01-02",
    status: "done",
    priority: "P2",
    sort_order: 0,
    created_at: "2024-01-01",
    updated_at: "2024-01-02",
  },
];

describe("useTodos", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useTodos (get all todos)", () => {
    it("should return todos on successful fetch", async () => {
      vi.mocked(getTodos).mockResolvedValue(mockTodos);

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTodos);
      expect(getTodos).toHaveBeenCalled();
    });

    it("should handle error when fetch fails", async () => {
      vi.mocked(getTodos).mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toBe("Failed to fetch");
    });

    it("should show loading state initially", () => {
      vi.mocked(getTodos).mockImplementation(
        () => new Promise(() => {}), // Never resolves
      );

      const { result } = renderHook(() => useTodos(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("useTodo (get single todo)", () => {
    it("should return todo by id", async () => {
      vi.mocked(getTodo).mockResolvedValue(mockTodos[0]);

      const { result } = renderHook(() => useTodo("todo-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTodos[0]);
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useTodo(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isFetching).toBe(false);
      expect(getTodo).not.toHaveBeenCalled();
    });
  });

  describe("useCreateTodo (create todo)", () => {
    it("should create todo successfully", async () => {
      const newTodo: Todo = {
        id: "new-todo",
        title: "New Todo",
        content: "New Content",
        due_date: "2024-01-01",
        status: "pending",
        priority: "P1",
        sort_order: 0,
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
      };
      vi.mocked(createTodo).mockResolvedValue(newTodo);
      vi.mocked(getTodos).mockResolvedValue([...mockTodos, newTodo]);

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      let createdTodo: Todo | undefined;
      await act(async () => {
        createdTodo = await result.current.mutateAsync({
          title: "New Todo",
          content: "New Content",
          priority: "P1",
        });
      });

      expect(createdTodo).toEqual(newTodo);
      expect(createTodo).toHaveBeenCalled();
    });

    it("should handle create error", async () => {
      vi.mocked(createTodo).mockRejectedValue(new Error("Failed to create"));

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            title: "New Todo",
          });
        }),
      ).rejects.toThrow("Failed to create");
    });

    it("should show isPending during mutation", async () => {
      vi.mocked(createTodo).mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve({} as Todo), 100)),
      );

      const { result } = renderHook(() => useCreateTodo(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);

      act(() => {
        result.current.mutate({ title: "New Todo" });
      });

      // The isPending should be true while mutation is in progress
      await waitFor(() => {
        expect(result.current.isPending).toBe(true);
      });
    });
  });

  describe("useUpdateTodo (update todo)", () => {
    it("should update todo successfully", async () => {
      const updatedTodo = { ...mockTodos[0], title: "Updated Title" };
      vi.mocked(updateTodo).mockResolvedValue(updatedTodo);

      const { result } = renderHook(() => useUpdateTodo(), {
        wrapper: createWrapper(),
      });

      let updated: Todo | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "todo-1",
          title: "Updated Title",
        });
      });

      expect(updated?.title).toBe("Updated Title");
      expect(updateTodo).toHaveBeenCalled();
    });

    it("should handle update error", async () => {
      vi.mocked(updateTodo).mockRejectedValue(new Error("Failed to update"));

      const { result } = renderHook(() => useUpdateTodo(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            id: "todo-1",
            title: "Updated",
          });
        }),
      ).rejects.toThrow("Failed to update");
    });
  });

  describe("useDeleteTodo (delete todo)", () => {
    it("should delete todo successfully", async () => {
      vi.mocked(deleteTodo).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteTodo(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("todo-1");
      });

      expect(deleteTodo).toHaveBeenCalled();
      expect(deleteTodo).toHaveBeenCalledOnce();
    });

    it("should handle delete error", async () => {
      vi.mocked(deleteTodo).mockRejectedValue(new Error("Failed to delete"));

      const { result } = renderHook(() => useDeleteTodo(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("todo-1");
        }),
      ).rejects.toThrow("Failed to delete");
    });
  });

  describe("todoKeys", () => {
    it("should have correct query keys", () => {
      expect(todoKeys.todos).toEqual(["todos"]);
      expect(todoKeys.todo("todo-1")).toEqual(["todos", "todo-1"]);
    });
  });
});
