import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { getTags, createTag, updateTag, deleteTag, type Tag } from "@/lib/api";

// Query Keys
export const tagKeys = {
  tags: ["tags"] as const,
  tag: (id: string) => ["tags", id] as const,
};

// Types for mutations
export type CreateTagInput = {
  name: string;
  color: string;
  description?: string;
};

export type UpdateTagInput = {
  id: string;
  name?: string;
  color?: string;
  description?: string;
};

// =============================================================================
// Tag Hooks
// =============================================================================

/**
 * Get all tags
 */
export function useTags(
  options?: Omit<UseQueryOptions<Tag[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag[], Error>({
    queryKey: tagKeys.tags,
    queryFn: getTags,
    ...options,
  });
}

/**
 * Get a single tag by ID
 */
export function useTag(
  id: string,
  options?: Omit<UseQueryOptions<Tag, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag, Error>({
    queryKey: tagKeys.tag(id),
    queryFn: () =>
      getTags().then((tags) => {
        const tag = tags.find((t) => t.id === id);
        if (!tag) {
          throw new Error(`Tag with id "${id}" not found`);
        }
        return tag;
      }),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new tag
 */
export function useCreateTag(
  options?: Omit<UseMutationOptions<Tag, Error, CreateTagInput>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<Tag, Error, CreateTagInput>({
    mutationFn: ({ name, color, description }) =>
      createTag(name, color, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.tags });
    },
    ...options,
  });
}

/**
 * Update an existing tag
 */
export function useUpdateTag(
  options?: Omit<UseMutationOptions<Tag, Error, UpdateTagInput>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<Tag, Error, UpdateTagInput>({
    mutationFn: ({ id, ...data }) => updateTag(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData<Tag[]>(tagKeys.tags, (old) => {
        if (!old) return old;
        return old.map((tag) => (tag.id === data.id ? data : tag));
      });
    },
    ...options,
  });
}

/**
 * Delete a tag
 */
export function useDeleteTag(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.tags });
    },
    ...options,
  });
}
