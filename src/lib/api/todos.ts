/**
 * Todo APIs
 *
 * API functions for Todo entity.
 */

import type { Todo, CreateTodoParams, UpdateTodoParams } from "@/lib/types";
import { isTauri } from "./client";

export async function getTodo(id: string): Promise<Todo> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to get todo");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Todo>("get_todo", { id });
}

export async function getTodos(): Promise<Todo[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Todo[]>("get_todos");
}

export async function getTodosByTag(tagId: string): Promise<Todo[]> {
  if (!isTauri()) {
    console.warn("Running outside Tauri - data not available");
    return [];
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Todo[]>("get_todos_by_tag", { tagId });
}

export async function createTodo(data: CreateTodoParams): Promise<Todo> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to create todos");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Todo>("create_todo", {
    title: data.title,
    content: data.content || null,
    dueDate: data.due_date || null,
    priority: data.priority || null,
  });
}

export async function updateTodo(
  id: string,
  data: UpdateTodoParams,
): Promise<Todo> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to update todos");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<Todo>("update_todo", {
    id,
    title: data.title,
    content: data.content,
    dueDate: data.due_date,
    status: data.status,
    priority: data.priority,
  });
}

export async function deleteTodo(id: string): Promise<void> {
  if (!isTauri()) {
    throw new Error("This app must run in Tauri to delete todos");
  }
  const { invoke } = await import("@tauri-apps/api/core");
  return invoke<void>("delete_todo", { id });
}
