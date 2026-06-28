export type EntitySortOrder = {
  readonly id: string;
  readonly sort_order: number;
};

export type EntityReorderInput = readonly EntitySortOrder[];

export type ReorderMutationContext<TEntity> = {
  readonly previousItems?: readonly TEntity[];
};

export type SortableEntity = {
  readonly id: string;
  readonly sort_order?: number;
};

export function applyOptimisticReorder<TEntity extends SortableEntity>(
  previousItems: readonly TEntity[],
  newOrders: readonly EntitySortOrder[],
): TEntity[] {
  const orderById = new Map(
    newOrders.map((order) => [order.id, order.sort_order]),
  );

  return previousItems
    .map((item) => {
      const sortOrder = orderById.get(item.id);
      return sortOrder === undefined
        ? item
        : { ...item, sort_order: sortOrder };
    })
    .sort((first, second) =>
      compareSortableEntities(first.sort_order, second.sort_order),
    );
}

function compareSortableEntities(
  firstSortOrder: number | undefined,
  secondSortOrder: number | undefined,
): number {
  return (firstSortOrder ?? 0) - (secondSortOrder ?? 0);
}
