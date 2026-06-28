export class EntityNotFoundError extends Error {
  constructor(
    public readonly entityName: string,
    public readonly entityId: string,
  ) {
    super(`${entityName} with id "${entityId}" not found`);
    this.name = "EntityNotFoundError";
  }
}

export class MissingReorderApiError extends Error {
  constructor(public readonly entityName: string) {
    super(`useReorder requires apiReorder in config for "${entityName}".`);
    this.name = "MissingReorderApiError";
  }
}
