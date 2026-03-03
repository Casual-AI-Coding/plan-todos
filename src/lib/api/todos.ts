/**
 * Todo APIs
 *
 * API functions for Todo entity.
 */

import type { Todo, CreateTodoParams, UpdateTodoParams } from "@/lib/types";
import { withTauriError } from "./utils";

export async function getTodo(id: string): Promise<Todo> {
  return withTauriError("获取 Todo", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Todo>("get_todo", { id });
  });
}

export async function getTodos(): Promise<Todo[]> {
  return withTauriError("获取 Todo 列表", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Todo[]>("get_todos");
  });
}

export async function getTodosByTag(tagId: string): Promise<Todo[]> {
  return withTauriError("获取标签下的 Todo 列表", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Todo[]>("get_todos_by_tag", { tagId });
  });
}

export async function createTodo(data: CreateTodoParams): Promise<Todo> {
  return withTauriError("创建 Todo", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Todo>("create_todo", {
      title: data.title,
      content: data.content || null,
      dueDate: data.due_date || null,
      priority: data.priority || null,
    });
  });
}

export async function updateTodo(
  id: string,
  data: UpdateTodoParams,
): Promise<Todo> {
  return withTauriError("更新 Todo", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<Todo>("update_todo", {
      id,
      title: data.title,
      content: data.content,
      dueDate: data.due_date,
      status: data.status,
      priority: data.priority,
    });
  });
}

export async function deleteTodo(id: string): Promise<void> {
  return withTauriError("删除 Todo", async () => {
    const { invoke } = await import("@tauri-apps/api/core");
    return invoke<void>("delete_todo", { id });
  });
}
