/**
 * Todo APIs
 *
 * API functions for Todo entity.
 */

import type { Todo, CreateTodoParams, UpdateTodoParams } from "@/lib/types";
import { invoke, withTauriError } from "./utils";

export async function getTodo(id: string): Promise<Todo> {
  return withTauriError("获取 Todo", async () => {
    return invoke<Todo>("get_todo", { id });
  });
}

export async function getTodos(): Promise<Todo[]> {
  return withTauriError("获取 Todo 列表", async () => {
    return invoke<Todo[]>("get_todos");
  });
}

export async function getTodosByTag(tagId: string): Promise<Todo[]> {
  return withTauriError("获取标签下的 Todo 列表", async () => {
    const ids = await invoke<string[]>("get_entities_by_tag", {
      entity_type: "todo",
      tag_ids: [tagId],
    });
    return Promise.all(ids.map((id) => getTodo(id)));
  });
}

export async function createTodo(data: CreateTodoParams): Promise<Todo> {
  return withTauriError("创建 Todo", async () => {
    return invoke<Todo>("create_todo", {
      title: data.title,
      content: data.content || null,
      due_date: data.due_date || null,
      priority: data.priority || null,
      recurrence: data.recurrence ? JSON.stringify(data.recurrence) : null,
    });
  });
}

export async function updateTodo(
  id: string,
  data: UpdateTodoParams,
): Promise<Todo> {
  return withTauriError("更新 Todo", async () => {
    return invoke<Todo>("update_todo", {
      id,
      title: data.title,
      content: data.content,
      due_date: data.due_date,
      status: data.status,
      priority: data.priority,
      recurrence: data.recurrence ? JSON.stringify(data.recurrence) : null,
    });
  });
}

export async function deleteTodo(id: string): Promise<void> {
  return withTauriError("删除 Todo", async () => {
    return invoke<void>("delete_todo", { id });
  });
}
