import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { getTags, createTag, updateTag, deleteTag } from "@/lib/api";
import type { Tag } from "@/lib/types";

import type { CreateTagInput, UpdateTagInput } from "./tagTypes";

export const tagKeys = {
  tags: ["tags"] as const,
  tag: (id: string) => ["tags", id] as const,
};

export function useTags(
  options?: Omit<UseQueryOptions<Tag[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag[], Error>({
    queryKey: tagKeys.tags,
    queryFn: getTags,
    ...options,
  });
}

export function useTag(
  id: string,
  options?: Omit<UseQueryOptions<Tag, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Tag, Error>({
    queryKey: tagKeys.tag(id),
    queryFn: () =>
      getTags().then((tags) => {
        const tag = tags.find((item) => item.id === id);
        if (!tag) {
          throw new Error(`Tag with id "${id}" not found`);
        }
        return tag;
      }),
    enabled: !!id,
    ...options,
  });
}

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
