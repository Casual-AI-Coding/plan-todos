import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { EntityReorderInput } from "@/domain/shared/entityReorder";
import type { EntityType, NotificationSettings } from "@/lib/types";

const { mockToast, mockSideEffects } = vi.hoisted(() => ({
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
  mockSideEffects: {
    saveTags: vi.fn(),
    updateReminder: vi.fn(),
    fetchReminder: vi.fn(),
  },
}));

vi.mock("@/components/ui/Toast", () => ({
  useToast: () => mockToast,
}));

vi.mock("@/domain/shared/entityOperations", () => ({
  createEntitySideEffects: vi.fn(() => mockSideEffects),
}));

vi.mock("@/lib/api", () => ({
  setEntityTags: vi.fn(),
  setNotificationSettings: vi.fn(),
  getNotificationSettings: vi.fn(),
}));

import { useEntityOperations } from "../useEntityOperations";

interface TestEntity {
  id: string;
  status: string;
  title: string;
}

interface TestCreateInput {
  title: string;
}

interface TestUpdateInput {
  id: string;
  title?: string;
  status?: string;
}

function createMutationResult<TData, TVariables>(
  mutateAsync: (variables: TVariables) => Promise<TData>,
  isPending = false,
): UseMutationResult<TData, Error, TVariables> {
  return {
    mutateAsync,
    isPending,
  } as unknown as UseMutationResult<TData, Error, TVariables>;
}

function createConfig(overrides?: {
  entityType?: EntityType;
  createMutation?: UseMutationResult<TestEntity, Error, TestCreateInput>;
  updateMutation?: UseMutationResult<TestEntity, Error, TestUpdateInput>;
  deleteMutation?: UseMutationResult<void, Error, string>;
  reorderMutation?: UseMutationResult<
    unknown,
    Error,
    EntityReorderInput
  >;
}) {
  return {
    entityType: "todo" as EntityType,
    createMutation: createMutationResult(async (input: TestCreateInput) => ({
      id: "created-1",
      status: "pending",
      title: input.title,
    })),
    updateMutation: createMutationResult(async (input: TestUpdateInput) => ({
      id: input.id,
      status: input.status ?? "pending",
      title: input.title ?? "updated",
    })),
    deleteMutation: createMutationResult<void, string>(async (_id: string) => {
      return undefined;
    }),
    reorderMutation: createMutationResult<
      unknown,
      EntityReorderInput
    >(async (_orders) => undefined),
    completedStatus: "completed",
    pendingStatus: "pending",
    messages: {
      created: "Created",
      updated: "Updated",
      deleted: "Deleted",
      toggledDone: "Marked done",
      toggledUndone: "Marked pending",
      error: "Something went wrong",
      reminderError: "Reminder failed",
    },
    ...overrides,
  };
}

describe("useEntityOperations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "confirm",
      vi.fn(() => true),
    );
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("creates an entity and saves tags when configured", async () => {
    const config = createConfig();
    mockSideEffects.saveTags.mockResolvedValue(undefined);

    const { result } = renderHook(() => useEntityOperations(config));

    let saved: TestEntity | null = null;
    await act(async () => {
      saved = await result.current.save({ title: "New entity" }, ["work"]);
    });

    expect(saved).toEqual({
      id: "created-1",
      status: "pending",
      title: "New entity",
    });
    expect(mockToast.success).toHaveBeenCalledWith("Created");
    expect(mockSideEffects.saveTags).toHaveBeenCalledWith("todo", "created-1", [
      "work",
    ]);
  });

  it("updates an entity when editing", async () => {
    const updateMutation = createMutationResult(
      async (input: TestUpdateInput) => ({
        id: input.id,
        status: "pending",
        title: input.title ?? "updated",
      }),
    );
    const config = createConfig({ updateMutation });

    const { result } = renderHook(() => useEntityOperations(config));

    await act(async () => {
      await result.current.save({ title: "Edited title" }, undefined, {
        isEditing: true,
        editingId: "entity-1",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Updated");
  });

  it("returns null and shows an error toast when save fails", async () => {
    const createMutation = createMutationResult<TestEntity, TestCreateInput>(
      async () => {
        throw new Error("save failed");
      },
    );
    const config = createConfig({ createMutation });

    const { result } = renderHook(() => useEntityOperations(config));

    let saved: TestEntity | null = {
      id: "unexpected",
      status: "pending",
      title: "unexpected",
    };
    await act(async () => {
      saved = await result.current.save({ title: "Broken" });
    });

    expect(saved).toBeNull();
    expect(mockToast.error).toHaveBeenCalledWith("Something went wrong");
  });

  it("toggles to completed and announces success", async () => {
    const updateMutation = createMutationResult(
      async (input: TestUpdateInput) => ({
        id: input.id,
        status: input.status ?? "completed",
        title: "Task",
      }),
    );
    const config = createConfig({ updateMutation });

    const { result } = renderHook(() => useEntityOperations(config));

    await act(async () => {
      await result.current.toggle({
        id: "task-1",
        status: "pending",
        title: "Task",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Marked done");
  });

  it("toggles back to pending when already completed", async () => {
    const updateMutation = createMutationResult(
      async (input: TestUpdateInput) => ({
        id: input.id,
        status: input.status ?? "pending",
        title: "Task",
      }),
    );
    const config = createConfig({ updateMutation });

    const { result } = renderHook(() => useEntityOperations(config));

    await act(async () => {
      await result.current.toggle({
        id: "task-1",
        status: "completed",
        title: "Task",
      });
    });

    expect(mockToast.success).toHaveBeenCalledWith("Marked pending");
  });

  it("returns false without deleting when confirm is cancelled", async () => {
    vi.stubGlobal(
      "confirm",
      vi.fn(() => false),
    );
    const deleteMutation = createMutationResult(
      async (_id: string) => undefined,
    );
    const config = createConfig({ deleteMutation });

    const { result } = renderHook(() => useEntityOperations(config));

    let removed = true;
    await act(async () => {
      removed = await result.current.remove("entity-1", "Delete it?");
    });

    expect(removed).toBe(false);
    expect(mockToast.success).not.toHaveBeenCalledWith("Deleted");
  });

  it("deletes after confirmation and returns true", async () => {
    const deleteMutation = createMutationResult(
      async (_id: string) => undefined,
    );
    const config = createConfig({ deleteMutation });

    const { result } = renderHook(() => useEntityOperations(config));

    let removed = false;
    await act(async () => {
      removed = await result.current.remove("entity-1", "Delete it?");
    });

    expect(removed).toBe(true);
    expect(mockToast.success).toHaveBeenCalledWith("Deleted");
  });

  it("updates reminder settings and uses reminder-specific error text", async () => {
    mockSideEffects.updateReminder.mockRejectedValueOnce(new Error("boom"));
    const config = createConfig();

    const { result } = renderHook(() => useEntityOperations(config));

    await act(async () => {
      await result.current.updateReminder("entity-1", [5, 15]);
    });

    expect(mockSideEffects.updateReminder).toHaveBeenCalledWith(
      "todo",
      "entity-1",
      [5, 15],
    );
    expect(mockToast.error).toHaveBeenCalledWith("Reminder failed");
  });

  it("returns early for reminder operations when entityType is missing", async () => {
    const config = createConfig({ entityType: undefined });

    const { result } = renderHook(() => useEntityOperations(config));

    let reminder: NotificationSettings | null = {
      id: "1",
      entity_type: "todo",
      entity_id: "entity-1",
      reminder_times: [30],
      reminder_sent: false,
      created_at: "2026-04-28T10:00:00Z",
      updated_at: "2026-04-28T10:00:00Z",
    };
    await act(async () => {
      await result.current.updateReminder("entity-1", [30]);
      reminder = (await result.current.fetchReminder(
        "entity-1",
      )) as NotificationSettings | null;
    });

    expect(mockSideEffects.updateReminder).not.toHaveBeenCalled();
    expect(reminder).toBeNull();
  });

  it("fetches reminder settings and returns null on failure", async () => {
    const reminderSettings: NotificationSettings = {
      id: "settings-1",
      entity_type: "todo",
      entity_id: "entity-1",
      reminder_times: [60],
      reminder_sent: false,
      created_at: "2026-04-28T10:00:00Z",
      updated_at: "2026-04-28T10:00:00Z",
    };
    mockSideEffects.fetchReminder
      .mockResolvedValueOnce(reminderSettings)
      .mockRejectedValueOnce(new Error("fetch failed"));
    const config = createConfig();

    const { result } = renderHook(() => useEntityOperations(config));

    let firstResult: NotificationSettings | null = null;
    let secondResult: NotificationSettings | null = reminderSettings;
    await act(async () => {
      firstResult = (await result.current.fetchReminder(
        "entity-1",
      )) as NotificationSettings | null;
      secondResult = (await result.current.fetchReminder(
        "entity-1",
      )) as NotificationSettings | null;
    });

    expect(firstResult).toEqual(reminderSettings);
    expect(secondResult).toBeNull();
  });

  it("reorders items and exposes pending state flags", async () => {
    const reorderMutation = createMutationResult<
      unknown,
      EntityReorderInput
    >(async () => undefined, true);
    const config = createConfig({
      reorderMutation,
      createMutation: createMutationResult(
        async (input: TestCreateInput) => ({
          id: "created-1",
          status: "pending",
          title: input.title,
        }),
        true,
      ),
      updateMutation: createMutationResult(
        async (input: TestUpdateInput) => ({
          id: input.id,
          status: input.status ?? "pending",
          title: input.title ?? "updated",
        }),
        true,
      ),
      deleteMutation: createMutationResult<void, string>(
        async (_id: string) => undefined,
        true,
      ),
    });

    const { result } = renderHook(() => useEntityOperations(config));

    await act(async () => {
      await result.current.reorder([
        { id: "b", status: "pending", title: "B" },
        { id: "a", status: "pending", title: "A" },
      ]);
    });

    expect(result.current.isCreating).toBe(true);
    expect(result.current.isUpdating).toBe(true);
    expect(result.current.isDeleting).toBe(true);
    expect(result.current.isReordering).toBe(true);
  });

  it("warns and skips reorder when no reorder mutation is configured", async () => {
    const config = createConfig({ reorderMutation: undefined });

    const { result } = renderHook(() => useEntityOperations(config));

    await act(async () => {
      await result.current.reorder([
        { id: "a", status: "pending", title: "A" },
      ]);
    });

    expect(console.warn).toHaveBeenCalledWith(
      "Reorder mutation not configured",
    );
  });
});
