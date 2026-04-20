/**
 * Backward-compatible re-exports from domain layer.
 * New code should import from @/domain/todo/todoService directly.
 */
export { todoDomainService } from "@/domain/todo/todoService";

// Named function exports for backward compatibility
import { todoDomainService } from "@/domain/todo/todoService";

export const filterTodosByPriority = todoDomainService.filterByPriority;
export const groupTodosByStatus = todoDomainService.groupByStatus;
export const filterTodosByTag = todoDomainService.filterByTag;
export const getTodosDueSoon = todoDomainService.getDueSoon;
export const sortTodosByPriority = todoDomainService.sortByPriority;