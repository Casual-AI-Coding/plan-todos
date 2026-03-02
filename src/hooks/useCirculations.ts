import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import type {
  Circulation,
  CirculationLog,
  CirculationType,
  PeriodicFrequency,
} from "@/lib/types";
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

// Query Keys
export const circulationKeys = {
  circulations: ["circulations"] as const,
  circulation: (id: string) => ["circulations", id] as const,
  circulationLogs: (id: string) => ["circulations", id, "logs"] as const,
};

// Types for mutations
export type CreateCirculationInput = {
  title: string;
  circulation_type: CirculationType;
  frequency?: PeriodicFrequency;
  target_count?: number;
};

export type UpdateCirculationInput = {
  id: string;
  title?: string;
  circulation_type?: CirculationType;
  frequency?: PeriodicFrequency;
  target_count?: number;
};

// =============================================================================
// Circulation Hooks
// =============================================================================

/**
 * Get all circulations
 */
export function useCirculations(
  options?: Omit<UseQueryOptions<Circulation[], Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Circulation[], Error>({
    queryKey: circulationKeys.circulations,
    queryFn: getCirculations,
    ...options,
  });
}

/**
 * Get a single circulation by ID
 */
export function useCirculation(
  id: string,
  options?: Omit<UseQueryOptions<Circulation, Error>, "queryKey" | "queryFn">,
) {
  return useQuery<Circulation, Error>({
    queryKey: circulationKeys.circulation(id),
    queryFn: () => getCirculation(id),
    enabled: !!id,
    ...options,
  });
}

/**
 * Get circulation logs
 */
export function useCirculationLogs(
  circulationId: string,
  limit: number = 20,
  options?: Omit<
    UseQueryOptions<CirculationLog[], Error>,
    "queryKey" | "queryFn"
  >,
) {
  return useQuery<CirculationLog[], Error>({
    queryKey: [...circulationKeys.circulationLogs(circulationId), limit],
    queryFn: () => getCirculationLogs(circulationId, limit),
    enabled: !!circulationId,
    ...options,
  });
}

/**
 * Create a new circulation
 */
export function useCreateCirculation(
  options?: Omit<
    UseMutationOptions<Circulation, Error, CreateCirculationInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Circulation, Error, CreateCirculationInput>({
    mutationFn: createCirculation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.circulations });
    },
    ...options,
  });
}

/**
 * Update an existing circulation
 */
export function useUpdateCirculation(
  options?: Omit<
    UseMutationOptions<Circulation, Error, UpdateCirculationInput>,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<Circulation, Error, UpdateCirculationInput>({
    mutationFn: ({ id, ...data }) => updateCirculation(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData<Circulation[]>(
        circulationKeys.circulations,
        (old) => {
          if (!old) return old;
          return old.map((c) => (c.id === data.id ? data : c));
        },
      );
    },
    ...options,
  });
}

/**
 * Delete a circulation
 */
export function useDeleteCirculation(
  options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: deleteCirculation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: circulationKeys.circulations });
    },
    ...options,
  });
}

/**
 * Checkin (complete) a circulation
 */
export function useCheckinCirculation(
  options?: Omit<
    UseMutationOptions<
      Circulation,
      Error,
      { id: string; note?: string; count?: number }
    >,
    "mutationFn"
  >,
) {
  const queryClient = useQueryClient();

  return useMutation<
    Circulation,
    Error,
    { id: string; note?: string; count?: number }
  >({
    mutationFn: async ({ id, note, count }) => {
      const result = await checkinCirculation(id, note, count);
      return result;
    },
    onSuccess: (_, variables) => {
      // Invalidate both the circulation and its logs
      queryClient.invalidateQueries({
        queryKey: circulationKeys.circulation(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: circulationKeys.circulationLogs(variables.id),
      });
    },
    ...options,
  });
}

/**
 * Undo today's checkin
 */
export function useUndoCheckinCirculation(
  options?: Omit<UseMutationOptions<Circulation, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();

  return useMutation<Circulation, Error, string>({
    mutationFn: async (id) => {
      const result = await undoCheckinCirculation(id);
      return result;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: circulationKeys.circulation(id),
      });
      queryClient.invalidateQueries({
        queryKey: circulationKeys.circulationLogs(id),
      });
    },
    ...options,
  });
}
