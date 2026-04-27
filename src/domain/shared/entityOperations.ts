import type { EntityType } from "@/lib/types";

interface EntitySideEffectAdapters {
  setEntityTags: (
    entityType: EntityType,
    entityId: string,
    tags: string[],
  ) => Promise<void>;
  setNotificationSettings: (
    entityType: EntityType,
    entityId: string,
    times: number[],
  ) => Promise<void>;
  getNotificationSettings: (
    entityType: EntityType,
    entityId: string,
  ) => Promise<unknown>;
}

export function createEntitySideEffects(adapters: EntitySideEffectAdapters) {
  return {
    saveTags(entityType: EntityType, entityId: string, tags: string[]) {
      return adapters.setEntityTags(entityType, entityId, tags);
    },
    updateReminder(entityType: EntityType, entityId: string, times: number[]) {
      return adapters.setNotificationSettings(entityType, entityId, times);
    },
    fetchReminder(entityType: EntityType, entityId: string) {
      return adapters.getNotificationSettings(entityType, entityId);
    },
  };
}
