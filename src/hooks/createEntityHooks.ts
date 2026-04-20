/**
 * Entity Hook Factory
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
 *     apiUpdate: updateTodo,
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

export interface EntityHookConfig<
  TEntity,
  TCreateInput,
  TUpdateInput,
  TReorderInput = { id: string; sort_order: number }[],
> {
  /** Entity name used for query keys (e.g., "todos", "plans") */
  entityName: string;
  apiGetAll: () => Promise<TEntity[]>;
  apiGetOne?: (id: string) => Promise<TEntity>;
  apiCreate: (input: TCreateInput) => Promise<TEntity>;
  apiUpdate: (id: string, data: Omit<TUpdateInput, "id">) => Promise<TEntity>;
  apiDelete: (id: string) => Promise<void>;
  apiReorder?: (orders: TReorderInput) => Promise<number>;
  /** Additional query keys to invalidate after mutations (e.g., tag sub-queries) */
  extraInvalidateKeys?: string[][];
  /** Override the default create mutation (e.g., for side effects like setting tags) */
  customCreateMutate?: (input: TCreateInput) => Promise<TEntity>;
  /** Override the default update mutation (e.g., for side effects like updating tags) */
  customUpdateMutate?: (input: TUpdateInput) => Promise<TEntity>;
  /** Override default create success handler (default: invalidate all) */
  onCreateSuccess?: (
    data: TEntity,
    queryClient: ReturnType<typeof useQueryClient>,
    queryKey: readonly string[],
  ) => void;
  /** Override default update success handler (default: update item in cache) */
  onUpdateSuccess?: (
    data: TEntity,
    queryClient: ReturnType<typeof useQueryClient>,
    queryKey: readonly string[],
  ) => void;
}

export function createEntityHooks<
  TEntity extends { id: string; sort_order?: number },
  TCreateInput,
  TUpdateInput extends { id: string },
  TReorderInput = { id: string; sort_order: number }[],
>(config: EntityHookConfig<TEntity, TCreateInput, TUpdateInput, TReorderInput>) {
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

  const queryKeys = {
    all: [entityName] as const,
    one: (id: string) => [entityName, id] as const,
  };

  function invalidateAll(queryClient: ReturnType<typeof useQueryClient>) {
    queryClient.invalidateQueries({ queryKey: queryKeys.all });
    for (const extraKey of extraInvalidateKeys) {
      queryClient.invalidateQueries({ queryKey: extraKey });
    }
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
          const item = items.find((i) => i.id === id);
          if (!item) throw new Error(`${entityName} with id "${id}" not found`);
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
      mutationFn: customUpdateMutate ??
        (({ id, ...data }: TUpdateInput) => apiUpdate(id, data as Omit<TUpdateInput, "id">)),
      onSuccess: (data) => {
        if (config.onUpdateSuccess) {
          config.onUpdateSuccess(data, queryClient, queryKeys.all);
        } else {
          queryClient.setQueryData<TEntity[]>(queryKeys.all, (old) => {
            if (!old) return old;
            return old.map((item) => (item.id === data.id ? data : item));
          });
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
      UseMutationOptions<number, Error, TReorderInput>,
      "mutationFn"
    >,
  ) {
    if (!apiReorder) {
      throw new Error(`useReorder requires apiReorder in config for "${entityName}".`);
    }
    const queryClient = useQueryClient();
    return useMutation<number, Error, TReorderInput>({
      mutationFn: apiReorder,
      onMutate: async (newOrders) => {
        await queryClient.cancelQueries({ queryKey: queryKeys.all });
        const previousItems = queryClient.getQueryData<TEntity[]>(queryKeys.all);
        if (previousItems) {
          const updatedItems = previousItems.map((item) => {
            const order = (newOrders as { id: string; sort_order: number }[]).find(
              (o) => o.id === item.id,
            );
            return order ? { ...item, sort_order: order.sort_order } : item;
          });
          updatedItems.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
          queryClient.setQueryData(queryKeys.all, updatedItems);
        }
        return { previousItems };
      },
      onError: (_err, _newOrders, context) => {
        const ctx = context as { previousItems?: TEntity[] } | undefined;
        if (ctx?.previousItems) {
          queryClient.setQueryData(queryKeys.all, ctx.previousItems);
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