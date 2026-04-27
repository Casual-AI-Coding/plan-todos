import { useToast } from "@/components/ui/Toast";
import { createEntitySideEffects } from "@/domain/shared/entityOperations";
import { setEntityTags, setNotificationSettings, getNotificationSettings } from "@/lib/api";
import type { EntityType } from "@/lib/types";
import type { UseMutationResult } from "@tanstack/react-query";

const sideEffects = createEntitySideEffects({
  setEntityTags,
  setNotificationSettings: async (entityType, entityId, times) => {
    await setNotificationSettings(entityType, entityId, times);
  },
  getNotificationSettings,
});

export interface EntityOperationsConfig<
  TEntity,
  TCreateInput,
  TUpdateInput,
> {
  entityType?: EntityType;
  createMutation: UseMutationResult<TEntity, Error, TCreateInput>;
  updateMutation: UseMutationResult<TEntity, Error, TUpdateInput>;
  deleteMutation: UseMutationResult<void, Error, string>;
  reorderMutation?: UseMutationResult<unknown, Error, Array<{ id: string; sort_order: number }>>;
  completedStatus: string;
  pendingStatus: string;
  messages: {
    created: string;
    updated: string;
    deleted: string;
    toggledDone: string;
    toggledUndone: string;
    error: string;
    reminderError?: string;
  };
}

export function useEntityOperations<
  TEntity extends { id: string; status: string },
  TCreateInput,
  TUpdateInput,
>(config: EntityOperationsConfig<TEntity, TCreateInput, TUpdateInput>) {
  const toast = useToast();

  async function save(
    data: TCreateInput | TUpdateInput,
    tags?: string[],
    options?: {
      isEditing?: boolean;
      editingId?: string;
    },
  ): Promise<TEntity | null> {
    try {
      let entity: TEntity;

      if (options?.isEditing && options.editingId) {
        entity = await config.updateMutation.mutateAsync(
          { id: options.editingId, ...data } as TUpdateInput,
        );
        toast.success(config.messages.updated);
      } else {
        entity = await config.createMutation.mutateAsync(data as TCreateInput);
        toast.success(config.messages.created);
      }

      if (tags && entity.id && config.entityType) {
        await sideEffects.saveTags(config.entityType, entity.id, tags);
      }

      return entity;
    } catch (e) {
      console.error(e);
      toast.error(config.messages.error);
      return null;
    }
  }

  async function toggle(entity: TEntity): Promise<void> {
    const next = entity.status === config.completedStatus
      ? config.pendingStatus
      : config.completedStatus;

    try {
      await config.updateMutation.mutateAsync({
        id: entity.id,
        status: next,
      } as TUpdateInput);
      toast.success(
        next === config.completedStatus
          ? config.messages.toggledDone
          : config.messages.toggledUndone,
      );
    } catch (e) {
      console.error(e);
    }
  }

  async function remove(id: string, confirmMessage?: string): Promise<boolean> {
    if (confirmMessage && !confirm(confirmMessage)) return false;

    try {
      await config.deleteMutation.mutateAsync(id);
      toast.success(config.messages.deleted);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async function updateReminder(entityId: string, times: number[]): Promise<void> {
    if (!config.entityType) {
      return;
    }

    try {
      await sideEffects.updateReminder(config.entityType, entityId, times);
    } catch (e) {
      console.error("Failed to update reminder settings:", e);
      toast.error(config.messages.reminderError ?? config.messages.error);
    }
  }

  async function fetchReminder(entityId: string) {
    if (!config.entityType) {
      return null;
    }

    try {
      return await sideEffects.fetchReminder(config.entityType, entityId);
    } catch (e) {
      console.error("Failed to fetch reminder settings:", e);
      return null;
    }
  }

  async function reorder(items: TEntity[]): Promise<void> {
    if (!config.reorderMutation) {
      console.warn("Reorder mutation not configured");
      return;
    }

    const orders = items.map((item, index) => ({
      id: item.id,
      sort_order: index,
    }));

    await config.reorderMutation.mutateAsync(orders);
  }

  return {
    save,
    toggle,
    remove,
    updateReminder,
    fetchReminder,
    reorder,
    isCreating: config.createMutation.isPending,
    isUpdating: config.updateMutation.isPending,
    isDeleting: config.deleteMutation.isPending,
    isReordering: config.reorderMutation?.isPending ?? false,
  };
}
