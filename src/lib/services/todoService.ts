/**
 * Backward-compatible re-exports from domain layer.
 * New code should import from @/domain/todo/todoService directly.
 */
export { todoDomainService } from "@/domain/todo/todoService";

import { todoDomainService } from "@/domain/todo/todoService";

/** @deprecated Import todoDomainService from @/domain/todo/todoService directly. */
export const filterTodosByPriority = todoDomainService.filterByPriority;
/** @deprecated Import todoDomainService from @/domain/todo/todoService directly. */
export const groupTodosByStatus = todoDomainService.groupByStatus;
/** @deprecated Import todoDomainService from @/domain/todo/todoService directly. */
export const filterTodosByTag = todoDomainService.filterByTag;
/** @deprecated Import todoDomainService from @/domain/todo/todoService directly. */
export const getTodosDueSoon = todoDomainService.getDueSoon;
/** @deprecated Import todoDomainService from @/domain/todo/todoService directly. */
export const sortTodosByPriority = todoDomainService.sortByPriority;
