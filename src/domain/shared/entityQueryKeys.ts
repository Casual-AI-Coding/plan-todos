export type EntityQueryKeys = {
  readonly all: readonly [string];
  readonly one: (id: string) => readonly [string, string];
};

export function createEntityQueryKeys(entityName: string): EntityQueryKeys {
  return {
    all: [entityName] as const,
    one: (id: string) => [entityName, id] as const,
  };
}
