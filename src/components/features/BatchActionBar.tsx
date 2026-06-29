// src/components/features/BatchActionBar.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import {
  bulkUpdateTodos,
  bulkDeleteTodos,
  bulkUpdatePlans,
  bulkDeletePlans,
  bulkUpdateTargets,
  bulkDeleteTargets,
  bulkAddTags,
  bulkRemoveTags,
  type BulkTodoUpdates,
} from "@/lib/api/bulk";
import { getTags, createTag } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { useBatchSelect } from "@/hooks/useBatchSelect";
import { useToast } from "@/components/ui/Toast";
import { TagSelector } from "./TagSelector";

interface BatchActionBarProps {
  entityType: "todo" | "plan" | "target";
  allIds: string[];
}

type BatchEntityUpdates = BulkTodoUpdates & {
  readonly archived?: boolean;
};

const STATUS_OPTIONS = {
  todo: [
    { value: "pending", label: "待处理" },
    { value: "in-progress", label: "进行中" },
    { value: "done", label: "已完成" },
  ],
  plan: [
    { value: "draft", label: "草稿" },
    { value: "active", label: "进行中" },
    { value: "completed", label: "已完成" },
  ],
  target: [
    { value: "active", label: "进行中" },
    { value: "completed", label: "已完成" },
    { value: "abandoned", label: "已放弃" },
  ],
};

const PRIORITY_OPTIONS = [
  { value: "P0", label: "P0 紧急" },
  { value: "P1", label: "P1 重要" },
  { value: "P2", label: "P2 普通" },
  { value: "P3", label: "P3 低优" },
];

export function BatchActionBar({ entityType, allIds }: BatchActionBarProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedIds, selectAll, deselectAll, exitMode } = useBatchSelect(
    useShallow((s) => ({
      selectedIds: Array.from(s.selectedIds),
      selectAll: s.selectAll,
      deselectAll: s.deselectAll,
      exitMode: s.exitMode,
    })),
  );
  const hasSelection = selectedIds.length > 0;

  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  // Fetch all tags
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  // Update mutation
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
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [entityType + "s"] });
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

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      switch (entityType) {
        case "todo":
          return bulkDeleteTodos(selectedIds);
        case "plan":
          return bulkDeletePlans(selectedIds);
        case "target":
          return bulkDeleteTargets(selectedIds);
        default:
          throw new Error(`Unknown entity type: ${entityType}`);
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [entityType + "s"] });
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

  // Bulk add tag mutation
  const addTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return bulkAddTags(entityType, selectedIds, tagId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [entityType + "s"] });
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

  // Bulk remove tag mutation
  const removeTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return bulkRemoveTags(entityType, selectedIds, tagId);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: [entityType + "s"] });
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

  // Create tag mutation
  const createTagMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      return createTag(name, color);
    },
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
    if (
      confirm(`确定要删除选中的 ${selectedIds.length} 项吗？此操作不可撤销。`)
    ) {
      deleteMutation.mutate();
    }
  };

  const handleArchive = () => {
    updateMutation.mutate({ archived: true });
  };

  const handleAddTag = (tagId: string) => {
    addTagMutation.mutate(tagId);
  };

  const handleRemoveTag = (tagId: string) => {
    removeTagMutation.mutate(tagId);
  };

  const handleCreateTag = async (name: string, color: string) => {
    return createTagMutation.mutateAsync({ name, color });
  };

  const isAllSelected =
    selectedIds.length === allIds.length && allIds.length > 0;
  const isLoading =
    updateMutation.isPending ||
    deleteMutation.isPending ||
    addTagMutation.isPending ||
    removeTagMutation.isPending;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-wrap items-center gap-3 p-3 mb-4 rounded-lg border"
      style={{
        backgroundColor: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Selected count */}
      <span
        className="text-sm font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        已选中{" "}
        <span style={{ color: "var(--color-primary)" }}>
          {selectedIds.length}
        </span>{" "}
        项
      </span>

      {/* Select all / Deselect all */}
      <button
        onClick={isAllSelected ? deselectAll : handleSelectAll}
        className="text-sm hover:underline transition-colors"
        style={{ color: "var(--color-primary)" }}
        disabled={allIds.length === 0}
      >
        {isAllSelected ? "取消全选" : "全选"}
      </button>

      {/* Divider */}
      <div
        className="h-4 w-px"
        style={{ backgroundColor: "var(--color-border)" }}
      />

      {/* Status dropdown */}
      <div className="relative">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setShowStatusDropdown(!showStatusDropdown);
            setShowPriorityDropdown(false);
          }}
          disabled={!hasSelection || isLoading}
        >
          修改状态
        </Button>
        <AnimatePresence>
          {showStatusDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-50 min-w-[120px]"
              style={{
                backgroundColor: "var(--color-bg-card)",
                border: `1px solid var(--color-border)`,
              }}
            >
              {STATUS_OPTIONS[entityType].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-[var(--color-surface)] transition-colors"
                  style={{ color: "var(--color-text)" }}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Priority dropdown (only for todos) */}
      {entityType === "todo" && (
        <div className="relative">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setShowPriorityDropdown(!showPriorityDropdown);
              setShowStatusDropdown(false);
            }}
            disabled={!hasSelection || isLoading}
          >
            修改优先级
          </Button>
          <AnimatePresence>
            {showPriorityDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 mt-1 py-1 rounded-lg shadow-lg z-50 min-w-[120px]"
                style={{
                  backgroundColor: "var(--color-bg-card)",
                  border: `1px solid var(--color-border)`,
                }}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handlePriorityChange(option.value)}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-[var(--color-surface)] transition-colors"
                    style={{ color: "var(--color-text)" }}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Tag selector */}
      <TagSelector
        tags={tags}
        selectedTagIds={[]}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onCreateTag={handleCreateTag}
        isLoading={isLoading}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Archive button */}
      {entityType !== "todo" && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleArchive}
          disabled={!hasSelection || isLoading || updateMutation.isPending}
          loading={updateMutation.isPending}
        >
          归档
        </Button>
      )}

      {/* Delete button */}
      <Button
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={!hasSelection || isLoading || deleteMutation.isPending}
        loading={deleteMutation.isPending}
      >
        删除
      </Button>

      {/* Cancel button */}
      <Button variant="ghost" size="sm" onClick={exitMode} disabled={isLoading}>
        取消
      </Button>

      {/* Click outside handler for dropdowns */}
      {(showStatusDropdown || showPriorityDropdown) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowStatusDropdown(false);
            setShowPriorityDropdown(false);
          }}
        />
      )}
    </motion.div>
  );
}
