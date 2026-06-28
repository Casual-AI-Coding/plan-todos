import type { QueryClient } from "@tanstack/react-query";

export type IdentifiedEntity = {
  readonly id: string;
};

export function invalidateEntityLists(
  queryClient: QueryClient,
  primaryKey: readonly string[],
  extraKeys: readonly (readonly string[])[],
): void {
  queryClient.invalidateQueries({ queryKey: primaryKey });
  for (const extraKey of extraKeys) {
    queryClient.invalidateQueries({ queryKey: extraKey });
  }
}

export function replaceEntityInList<TEntity extends IdentifiedEntity>(
  oldItems: readonly TEntity[] | undefined,
  updatedItem: TEntity,
): TEntity[] | undefined {
  if (!oldItems) return undefined;

  return oldItems.map((item) =>
    item.id === updatedItem.id ? updatedItem : item,
  );
}
