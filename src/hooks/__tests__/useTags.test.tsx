import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useTags,
  useTag,
  useCreateTag,
  useUpdateTag,
  useDeleteTag,
  tagKeys,
} from "@/hooks/useTags";
import type { Tag } from "@/lib/types";

// Mock the API functions
vi.mock("@/lib/api", () => ({
  getTags: vi.fn(),
  createTag: vi.fn(),
  updateTag: vi.fn(),
  deleteTag: vi.fn(),
}));

import { getTags, createTag, updateTag, deleteTag } from "@/lib/api";

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
const mockTags: Tag[] = [
  {
    id: "tag-1",
    name: "Tag 1",
    color: "#FF0000",
    description: "Description 1",
    created_at: "2024-01-01",
  },
  {
    id: "tag-2",
    name: "Tag 2",
    color: "#00FF00",
    description: "Description 2",
    created_at: "2024-01-01",
  },
];

describe("useTags", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useTags (get all tags)", () => {
    it("should return tags on successful fetch", async () => {
      vi.mocked(getTags).mockResolvedValue(mockTags);

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTags);
      expect(getTags).toHaveBeenCalled();
    });

    it("should handle error when fetch fails", async () => {
      vi.mocked(getTags).mockRejectedValue(new Error("Failed to fetch"));

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("should show loading state initially", () => {
      vi.mocked(getTags).mockImplementation(() => new Promise(() => {}));

      const { result } = renderHook(() => useTags(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("useTag (get single tag)", () => {
    it("should return tag by id", async () => {
      vi.mocked(getTags).mockResolvedValue(mockTags);

      const { result } = renderHook(() => useTag("tag-1"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockTags[0]);
    });

    it("should throw error when tag not found", async () => {
      vi.mocked(getTags).mockResolvedValue([]);

      const { result } = renderHook(() => useTag("non-existent"), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it("should not fetch when id is empty", () => {
      const { result } = renderHook(() => useTag(""), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(false);
      expect(getTags).not.toHaveBeenCalled();
    });
  });

  describe("useCreateTag (create tag)", () => {
    it("should create tag successfully", async () => {
      const newTag: Tag = {
        id: "new-tag",
        name: "New Tag",
        color: "#0000FF",
        description: "New Description",
        created_at: "2024-01-01",
      };
      vi.mocked(createTag).mockResolvedValue(newTag);
      vi.mocked(getTags).mockResolvedValue([...mockTags, newTag]);

      const { result } = renderHook(() => useCreateTag(), {
        wrapper: createWrapper(),
      });

      let createdTag: Tag | undefined;
      await act(async () => {
        createdTag = await result.current.mutateAsync({
          name: "New Tag",
          color: "#0000FF",
          description: "New Description",
        });
      });

      expect(createdTag).toEqual(newTag);
      expect(createTag).toHaveBeenCalled();
    });

    it("should handle create error", async () => {
      vi.mocked(createTag).mockRejectedValue(new Error("Failed to create"));

      const { result } = renderHook(() => useCreateTag(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({
            name: "New Tag",
            color: "#0000FF",
          });
        }),
      ).rejects.toThrow("Failed to create");
    });
  });

  describe("useUpdateTag (update tag)", () => {
    it("should update tag successfully", async () => {
      const updatedTag = { ...mockTags[0], name: "Updated Tag" };
      vi.mocked(updateTag).mockResolvedValue(updatedTag);

      const { result } = renderHook(() => useUpdateTag(), {
        wrapper: createWrapper(),
      });

      let updated: Tag | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "tag-1",
          name: "Updated Tag",
        });
      });

      expect(updated?.name).toBe("Updated Tag");
      expect(updateTag).toHaveBeenCalled();
    });

    it("should update tag color", async () => {
      const updatedTag = { ...mockTags[0], color: "#FFFF00" };
      vi.mocked(updateTag).mockResolvedValue(updatedTag);

      const { result } = renderHook(() => useUpdateTag(), {
        wrapper: createWrapper(),
      });

      let updated: Tag | undefined;
      await act(async () => {
        updated = await result.current.mutateAsync({
          id: "tag-1",
          color: "#FFFF00",
        });
      });

      expect(updated?.color).toBe("#FFFF00");
    });

    it("should handle update error", async () => {
      vi.mocked(updateTag).mockRejectedValue(new Error("Failed to update"));

      const { result } = renderHook(() => useUpdateTag(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync({ id: "tag-1", name: "Updated" });
        }),
      ).rejects.toThrow("Failed to update");
    });
  });

  describe("useDeleteTag (delete tag)", () => {
    it("should delete tag successfully", async () => {
      vi.mocked(deleteTag).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteTag(), {
        wrapper: createWrapper(),
      });

      await act(async () => {
        await result.current.mutateAsync("tag-1");
      });

      expect(deleteTag).toHaveBeenCalled();
    });

    it("should handle delete error", async () => {
      vi.mocked(deleteTag).mockRejectedValue(new Error("Failed to delete"));

      const { result } = renderHook(() => useDeleteTag(), {
        wrapper: createWrapper(),
      });

      await expect(
        act(async () => {
          await result.current.mutateAsync("tag-1");
        }),
      ).rejects.toThrow("Failed to delete");
    });
  });

  describe("tagKeys", () => {
    it("should have correct query keys", () => {
      expect(tagKeys.tags).toEqual(["tags"]);
      expect(tagKeys.tag("tag-1")).toEqual(["tags", "tag-1"]);
    });
  });
});
