/**
 * Entity Query Factory
 *
 * Generic factory for creating standardized CRUD (Create, Read, Update, Delete)
 * React Query hooks for any entity type. Eliminates duplicated hook logic
 * across todos, plans, targets, milestones, and circulations.
 *
 * Usage:
 *   const todoHooks = createEntityHooks<Todo, CreateTodoInput, UpdateTodoInput>({
 *     entityName: 'todo',
 *     apiGetAll: getTodos,
 *     apiGetOne: getTodo,
 *     apiCreate: createTodo,
 *     apiUpdate: async ({ id, ...data }) => updateTodo(id, data),
 *     apiDelete: deleteTodo,
 *   });
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { EntityNotFoundError, MissingReorderApiError } from "./entityErrors";
import { invalidateEntityLists, replaceEntityInList } from "./entityQueryCache";
import { createEntityQueryKeys } from "./entityQueryKeys";
import {
  applyOptimisticReorder,
  type EntityReorderInput,
  type ReorderMutationContext,
} from "./entityReorder";

export interface EntityHookConfig<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TReorderInput = EntityReorderInput,
> {
  /** Entity name used for query keys (e.g., "todos", "plans") */
  readonly entityName: string;
  readonly apiGetAll: () => Promise<TEntity[]>;
  readonly apiGetOne?: (id: string) => Promise<TEntity>;
  readonly apiCreate: (input: TCreateInput) => Promise<TEntity>;
  readonly apiUpdate: (input: TUpdateInput) => Promise<TEntity>;
  readonly apiDelete: (id: string) => Promise<void>;
  readonly apiReorder?: (orders: TReorderInput) => Promise<number>;
  /** Additional query keys to invalidate after mutations (e.g., tag sub-queries) */
  readonly extraInvalidateKeys?: readonly (readonly string[])[];
  /** Override the default create mutation (e.g., for side effects like setting tags) */
  readonly customCreateMutate?: (input: TCreateInput) => Promise<TEntity>;
  /** Override the default update mutation (e.g., for side effects like updating tags) */
  readonly customUpdateMutate?: (input: TUpdateInput) => Promise<TEntity>;
  /** Override default create success handler (default: invalidate all) */
  readonly onCreateSuccess?: (
    data: TEntity,
    queryClient: ReturnType<typeof useQueryClient>,
    queryKey: readonly string[],
  ) => void;
  /** Override default update success handler (default: update item in cache) */
  readonly onUpdateSuccess?: (
    data: TEntity,
    queryClient: ReturnType<typeof useQueryClient>,
    queryKey: readonly string[],
  ) => void;
}

export function createEntityHooks<
  TEntity extends { id: string; sort_order?: number },
  TCreateInput,
  TUpdateInput extends { id: string },
  TReorderInput extends EntityReorderInput = EntityReorderInput,
>(
  config: EntityHookConfig<TEntity, TCreateInput, TUpdateInput, TReorderInput>,
) {
  const {
    entityName,
    apiGetAll,
    apiGetOne,
    apiCreate,
    apiUpdate,
    apiDelete,
    apiReorder,
    customCreateMutate,
    customUpdateMutate,
    extraInvalidateKeys = [],
  } = config;

  const queryKeys = createEntityQueryKeys(entityName);

  function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
    invalidateEntityLists(queryClient, queryKeys.all, extraInvalidateKeys);
  }

  function useGetAll(
    options?: Omit<UseQueryOptions<TEntity[], Error>, "queryKey" | "queryFn">,
  ) {
    return useQuery<TEntity[], Error>({
      queryKey: queryKeys.all,
      queryFn: apiGetAll,
      ...options,
    });
  }

  function useGetOne(
    id: string,
    options?: Omit<UseQueryOptions<TEntity, Error>, "queryKey" | "queryFn">,
  ) {
    return useQuery<TEntity, Error>({
      queryKey: queryKeys.one(id),
      queryFn: () => {
        if (apiGetOne) return apiGetOne(id);
        return apiGetAll().then((items) => {
          const item = items.find((candidate) => candidate.id === id);
          if (!item) throw new EntityNotFoundError(entityName, id);
          return item;
        });
      },
      enabled: !!id,
      ...options,
    });
  }

  function useCreate(
    options?: Omit<
      UseMutationOptions<TEntity, Error, TCreateInput>,
      "mutationFn"
    >,
  ) {
    const queryClient = useQueryClient();
    return useMutation<TEntity, Error, TCreateInput>({
      mutationFn: customCreateMutate ?? apiCreate,
      onSuccess: (data) => {
        if (config.onCreateSuccess) {
          config.onCreateSuccess(data, queryClient, queryKeys.all);
        } else {
          invalidateAll(queryClient);
        }
      },
      ...options,
    });
  }

  function useUpdate(
    options?: Omit<
      UseMutationOptions<TEntity, Error, TUpdateInput>,
      "mutationFn"
    >,
  ) {
    const queryClient = useQueryClient();
    return useMutation<TEntity, Error, TUpdateInput>({
      mutationFn: customUpdateMutate ?? apiUpdate,
      onSuccess: (data) => {
        if (config.onUpdateSuccess) {
          config.onUpdateSuccess(data, queryClient, queryKeys.all);
        } else {
          queryClient.setQueryData<TEntity[]>(queryKeys.all, (old) =>
            replaceEntityInList(old, data),
          );
        }
      },
      ...options,
    });
  }

  function useDelete(
    options?: Omit<UseMutationOptions<void, Error, string>, "mutationFn">,
  ) {
    const queryClient = useQueryClient();
    return useMutation<void, Error, string>({
      mutationFn: apiDelete,
      onSuccess: () => invalidateAll(queryClient),
      ...options,
    });
  }

  function useReorder(
    options?: Omit<
      UseMutationOptions<
        number,
        Error,
        TReorderInput,
        ReorderMutationContext<TEntity>
      >,
      "mutationFn"
    >,
  ) {
    if (!apiReorder) {
      throw new MissingReorderApiError(entityName);
    }
    const queryClient = useQueryClient();
    return useMutation<
      number,
      Error,
      TReorderInput,
      ReorderMutationContext<TEntity>
    >({
      mutationFn: apiReorder,
      onMutate: async (newOrders) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.all });
        const previousItems = queryClient.getQueryData<TEntity[]>(
          queryKeys.all,
        );
        if (previousItems) {
          queryClient.setQueryData(
            queryKeys.all,
            applyOptimisticReorder(previousItems, newOrders),
          );
        }
        return { previousItems };
      },
      onError: (_err, _newOrders, context) => {
        if (context?.previousItems) {
          queryClient.setQueryData(queryKeys.all, context.previousItems);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.all });
      },
      ...options,
    });
  }

  return {
    queryKeys,
    useGetAll,
    useGetOne,
    useCreate,
    useUpdate,
    useDelete,
    useReorder,
  };
}
