import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";

import { createTag, getTags } from "@/lib/api";
import {
  bulkAddTags,
  bulkDeletePlans,
  bulkDeleteTargets,
  bulkDeleteTodos,
  bulkRemoveTags,
  bulkUpdatePlans,
  bulkUpdateTargets,
  bulkUpdateTodos,
  type BulkTodoUpdates,
} from "@/lib/api/bulk";
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { useToast } from "@/components/ui/Toast";

import type { BatchEntityType } from "./batchActionBarOptions";

type BatchEntityUpdates = BulkTodoUpdates & {
  readonly archived?: boolean;
};

type UseBatchActionControllerInput = {
  readonly entityType: BatchEntityType;
  readonly allIds: string[];
};

export function useBatchActionController({
  entityType,
  allIds,
}: UseBatchActionControllerInput) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedIds, selectAll, deselectAll, exitMode } = useBatchSelect(
    useShallow((state) => ({
      selectedIds: Array.from(state.selectedIds),
      selectAll: state.selectAll,
      deselectAll: state.deselectAll,
      exitMode: state.exitMode,
    })),
  );

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: BatchEntityUpdates) => {
      switch (entityType) {
        case "todo":
          return bulkUpdateTodos(selectedIds, {
            status: updates.status,
            priority: updates.priority,
            due_date: updates.due_date,
          });
        case "plan":
          return bulkUpdatePlans(selectedIds, updates.status, updates.archived);
        case "target":
          return bulkUpdateTargets(
            selectedIds,
            updates.status,
            updates.archived,
          );
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [`${entityType}s`] });
      toast.success(`已更新 ${result.updated} 项`);
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} 项更新失败`);
      }
      deselectAll();
      setShowStatusDropdown(false);
      setShowPriorityDropdown(false);
    },
    onError: (error: Error) => {
      toast.error(`更新失败: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      switch (entityType) {
        case "todo":
          return bulkDeleteTodos(selectedIds);
        case "plan":
          return bulkDeletePlans(selectedIds);
        case "target":
          return bulkDeleteTargets(selectedIds);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [`${entityType}s`] });
      toast.success(`已删除 ${result.updated} 项`);
      if (result.failed.length > 0) {
        toast.error(`${result.failed.length} 项删除失败`);
      }
      exitMode();
    },
    onError: (error: Error) => {
      toast.error(`删除失败: ${error.message}`);
    },
  });

  const addTagMutation = useMutation({
    mutationFn: async (tagId: string) => bulkAddTags(entityType, selectedIds, tagId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [`${entityType}s`] });
      queryClient.invalidateQueries({ queryKey: ["entityTags"] });
      toast.success(`已添加标签到 ${result.success_count} 项`);
      if (result.failed_ids.length > 0) {
        toast.error(`${result.failed_ids.length} 项添加失败`);
      }
    },
    onError: (error: Error) => {
      toast.error(`添加标签失败: ${error.message}`);
    },
  });

  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) =>
      bulkRemoveTags(entityType, selectedIds, tagId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [`${entityType}s`] });
      queryClient.invalidateQueries({ queryKey: ["entityTags"] });
      toast.success(`已移除标签从 ${result.success_count} 项`);
      if (result.failed_ids.length > 0) {
        toast.error(`${result.failed_ids.length} 项移除失败`);
      }
    },
    onError: (error: Error) => {
      toast.error(`移除标签失败: ${error.message}`);
    },
  });

  const createTagMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) =>
      createTag(name, color),
    onSuccess: (tag) => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
      return tag;
    },
  });

  const handleStatusChange = (value: string) => {
    updateMutation.mutate({ status: value });
    setShowStatusDropdown(false);
  };

  const handlePriorityChange = (value: string) => {
    updateMutation.mutate({ priority: value });
    setShowPriorityDropdown(false);
  };

  const handleSelectAll = () => {
    selectAll(allIds);
  };

  const handleDelete = () => {
    if (confirm(`确定要删除选中的 ${selectedIds.length} 项吗？此操作不可撤销。`)) {
      deleteMutation.mutate();
    }
  };

  const handleArchive = () => {
    updateMutation.mutate({ archived: true });
  };

  const isLoading =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    addTagMutation.isPending ||
    removeTagMutation.isPending;

  return {
    selectedIds,
    deselectAll,
    exitMode,
    tags,
    showStatusDropdown,
    setShowStatusDropdown,
    showPriorityDropdown,
    setShowPriorityDropdown,
    handleStatusChange,
    handlePriorityChange,
    handleSelectAll,
    handleDelete,
    handleArchive,
    handleAddTag: addTagMutation.mutate,
    handleRemoveTag: removeTagMutation.mutate,
    handleCreateTag: (name: string, color: string) =>
      createTagMutation.mutateAsync({ name, color }),
    isAllSelected: selectedIds.length === allIds.length && allIds.length > 0,
    isLoading,
    hasSelection: selectedIds.length > 0,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
