/**
 * Reorder API Functions
 *
 * API functions for drag-drop reordering of todos, plans, and targets.
 */

import { invoke } from "@tauri-apps/api/core";

export interface ReorderItem {
  id: string;
  sort_order: number;
}

/**
 * Reorder todos by updating their sort_order values.
 * @param orders - Array of {id, sort_order} tuples
 * @returns Number of items updated
 */
export async function reorderTodos(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map(
    (o) => [o.id, o.sort_order] as [string, number],
  );
  return invoke<number>("reorder_todos", { orders: ordersTuple });
}

/**
 * Reorder plans by updating their sort_order values.
 * @param orders - Array of {id, sort_order} tuples
 * @returns Number of items updated
 */
export async function reorderPlans(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map(
    (o) => [o.id, o.sort_order] as [string, number],
  );
  return invoke<number>("reorder_plans", { orders: ordersTuple });
}

/**
 * Reorder targets by updating their sort_order values.
 * @param orders - Array of {id, sort_order} tuples
 * @returns Number of items updated
 */
export async function reorderTargets(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map(
    (o) => [o.id, o.sort_order] as [string, number],
  );
  return invoke<number>("reorder_targets", { orders: ordersTuple });
}
