import { apiClient } from "./client";

export interface ReorderItem {
  id: string;
  sort_order: number;
}

export async function reorderTodos(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map((o) => [o.id, o.sort_order] as [string, number]);
  return apiClient.invoke<number>("reorder_todos", { orders: ordersTuple });
}

export async function reorderPlans(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map((o) => [o.id, o.sort_order] as [string, number]);
  return apiClient.invoke<number>("reorder_plans", { orders: ordersTuple });
}

export async function reorderTargets(orders: ReorderItem[]): Promise<number> {
  const ordersTuple = orders.map((o) => [o.id, o.sort_order] as [string, number]);
  return apiClient.invoke<number>("reorder_targets", { orders: ordersTuple });
}
