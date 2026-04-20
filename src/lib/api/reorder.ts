import { invoke as apiInvoke } from "./client";

export interface ReorderItem {
  id: string;
  sort_order: number;
}

export async function reorderTodos(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map((o) => [o.id, o.sort_order] as [string, number]);
  return apiInvoke<number>("reorder_todos", { orders: ordersTuple });
}

export async function reorderPlans(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map((o) => [o.id, o.sort_order] as [string, number]);
  return apiInvoke<number>("reorder_plans", { orders: ordersTuple });
}

export async function reorderTargets(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map((o) => [o.id, o.sort_order] as [string, number]);
  return apiInvoke<number>("reorder_targets", { orders: ordersTuple });
}