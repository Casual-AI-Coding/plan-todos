import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { createEntityHooks } from "@/domain/shared/entityQueries";
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
import type { Circulation, CirculationLog } from "@/lib/types";

import type {
  CreateCirculationInput,
  UpdateCirculationInput,
} from "./circulationTypes";

export const circulationKeys = {
  circulations: ["circulations"] as const,
  circulation: (id: string) => ["circulations", id] as const,
  circulationLogs: (id: string) => ["circulations", id, "logs"] as const,
};

const {
  useGetAll: useCirculations,
  useGetOne: useCirculation,
  useCreate: useCreateCirculation,
  useUpdate: useUpdateCirculation,
  useDelete: useDeleteCirculation,
} = createEntityHooks<
  Circulation,
  CreateCirculationInput,
  UpdateCirculationInput
>({
  entityName: "circulations",
  apiGetAll: getCirculations,
  apiGetOne: getCirculation,
  apiCreate: createCirculation,
  apiUpdate: async ({ id, ...data }) => updateCirculation(id, data),
  apiDelete: deleteCirculation,
});

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
    mutationFn: async ({ id, note, count }) =>
      checkinCirculation(id, note, count),
    onSuccess: (_, variables) => {
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

export function useUndoCheckinCirculation(
  options?: Omit<UseMutationOptions<Circulation, Error, string>, "mutationFn">,
) {
  const queryClient = useQueryClient();
  return useMutation<Circulation, Error, string>({
    mutationFn: async (id) => undoCheckinCirculation(id),
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

export {
  useCirculations,
  useCirculation,
  useCreateCirculation,
  useUpdateCirculation,
  useDeleteCirculation,
};
