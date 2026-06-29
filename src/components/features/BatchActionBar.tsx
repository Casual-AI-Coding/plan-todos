"use client";

import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/Button";

import { TagSelector } from "./TagSelector";
import {
  PRIORITY_OPTIONS,
  STATUS_OPTIONS,
  type BatchEntityType,
} from "./batchActionBarOptions";
import { useBatchActionController } from "./useBatchActionController";

type BatchActionBarProps = {
  readonly entityType: BatchEntityType;
  readonly allIds: string[];
};

export function BatchActionBar({ entityType, allIds }: BatchActionBarProps) {
  const {
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
    handleAddTag,
    handleRemoveTag,
    handleCreateTag,
    isAllSelected,
    isLoading,
    hasSelection,
    isUpdating,
    isDeleting,
  } = useBatchActionController({ entityType, allIds });

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
      <span
        className="text-sm font-medium"
        style={{ color: "var(--color-text-secondary)" }}
      >
        已选中{" "}
        <span style={{ color: "var(--color-primary)" }}>{selectedIds.length}</span>{" "}
        项
      </span>

      <button
        onClick={isAllSelected ? deselectAll : handleSelectAll}
        className="text-sm hover:underline transition-colors"
        style={{ color: "var(--color-primary)" }}
        disabled={allIds.length === 0}
      >
        {isAllSelected ? "取消全选" : "全选"}
      </button>

      <div
        className="h-4 w-px"
        style={{ backgroundColor: "var(--color-border)" }}
      />

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

      <TagSelector
        tags={tags}
        selectedTagIds={[]}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
        onCreateTag={handleCreateTag}
        isLoading={isLoading}
      />

      <div className="flex-1" />

      {entityType !== "todo" && (
        <Button
          variant="secondary"
          size="sm"
          onClick={handleArchive}
          disabled={!hasSelection || isLoading || isUpdating}
          loading={isUpdating}
        >
          归档
        </Button>
      )}

      <Button
        variant="danger"
        size="sm"
        onClick={handleDelete}
        disabled={!hasSelection || isLoading || isDeleting}
        loading={isDeleting}
      >
        删除
      </Button>

      <Button variant="ghost" size="sm" onClick={exitMode} disabled={isLoading}>
        取消
      </Button>

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
