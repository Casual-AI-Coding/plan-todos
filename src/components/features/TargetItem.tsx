"use client";

import React from "react";
import { Trash2, ChevronDown, ChevronRight } from "lucide-react";
import {
  Card,
  ProgressBar,
  Checkbox,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui";
import { TagBadge } from "@/components/ui/TagBadge";
import { ReminderQuickButton } from "./ReminderQuickButton";
import { arraysEqual, areTagsEqual } from "@/lib/utils/compare";
import type { Target, Tag, Step } from "@/lib/types";

export interface TargetItemProps {
  target: Target;
  tags?: Tag[];
  steps?: Step[];
  reminderTimes?: number[];
  onDelete?: (id: string) => void;
  onClick?: (target: Target) => void;
  onToggleStep?: (step: Step) => void;
  onDeleteStep?: (id: string) => void;
  onReminderUpdate?: (targetId: string, times: number[]) => void;
  expanded?: boolean;
  onToggleExpand?: (targetId: string) => void;
}

/**
 * Custom comparison function for React.memo
 * Only re-render if target data changes
 */
function areEqual(
  prevProps: TargetItemProps,
  nextProps: TargetItemProps,
): boolean {
  const prevTags = prevProps.tags || [];
  const nextTags = nextProps.tags || [];
  const tagsEqual = areTagsEqual(prevTags, nextTags);

  const prevSteps = prevProps.steps || [];
  const nextSteps = nextProps.steps || [];
  const stepsEqual =
    prevSteps.length === nextSteps.length &&
    prevSteps.every(
      (step, index) =>
        step.id === nextSteps[index]?.id &&
        step.status === nextSteps[index]?.status,
    );

  return (
    prevProps.target.id === nextProps.target.id &&
    prevProps.target.title === nextProps.target.title &&
    prevProps.target.status === nextProps.target.status &&
    prevProps.target.progress === nextProps.target.progress &&
    prevProps.target.due_date === nextProps.target.due_date &&
    tagsEqual &&
    stepsEqual &&
    prevProps.expanded === nextProps.expanded &&
    arraysEqual(prevProps.reminderTimes || [], nextProps.reminderTimes || [])
  );
}

export const TargetItem = React.memo(function TargetItem({
  target,
  tags,
  steps = [],
  reminderTimes,
  onDelete,
  onClick,
  onToggleStep,
  onDeleteStep,
  onReminderUpdate,
  expanded = false,
  onToggleExpand,
}: TargetItemProps) {
  const totalWeight = steps.reduce((sum, s) => sum + s.weight, 0);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card hoverable onClick={() => onClick?.(target)}>
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="text-lg cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand?.(target.id);
                  }}
                  onKeyDown={(e) =>
                    e.key === "Enter" && onToggleExpand?.(target.id)
                  }
                  role="button"
                  tabIndex={0}
                  aria-label={expanded ? "折叠步骤" : "展开步骤"}
                >
                  {expanded ? "▼" : "▶"}
                </span>
                <span
                  className="font-semibold"
                  style={{ color: "var(--color-text)" }}
                >
                  {target.title}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-orange-500 font-medium">
                  {target.progress}%
                </span>
                {/* Reminder button */}
                <ReminderQuickButton
                  entityType="target"
                  entityId={target.id}
                  reminderTimes={reminderTimes || []}
                  onUpdate={(times) => onReminderUpdate?.(target.id, times)}
                />
                {onDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(target.id);
                    }}
                    className="text-gray-400 hover:text-red-500 px-2"
                    aria-label="删除目标"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>
            <ProgressBar
              value={target.progress}
              color="orange"
              size="sm"
              className="mt-2"
            />
            {/* Tags display */}
            {tags && tags.length > 0 && (
              <div className="flex gap-1 mt-2 flex-wrap">
                {tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} size="sm" />
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-1">
              权重总和: {totalWeight}/100
              {target.due_date && (
                <span className="ml-2">📅 {target.due_date}</span>
              )}
            </div>
            {expanded && (
              <div className="mt-4 pl-6 space-y-2 border-l-2 border-orange-200 ml-4">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded"
                  >
                    <Checkbox
                      checked={step.status === "completed"}
                      onChange={() => onToggleStep?.(step)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="flex-1">{step.title}</span>
                    <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                      {step.weight}%
                    </span>
                    {onDeleteStep && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteStep(step.id);
                        }}
                        className="text-gray-400 hover:text-red-500"
                        aria-label="删除步骤"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
                {steps.length === 0 && (
                  <p className="text-gray-400 text-sm">暂无步骤</p>
                )}
                {totalWeight < 100 && (
                  <p className="text-xs text-orange-500 mt-2">
                    剩余可用权重: {100 - totalWeight}%
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          icon={
            expanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )
          }
          onClick={() => onToggleExpand?.(target.id)}
        >
          {expanded ? "折叠步骤" : "展开步骤"}
        </ContextMenuItem>
        {onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              icon={<Trash2 className="w-4 h-4" />}
              variant="danger"
              onClick={() => onDelete(target.id)}
            >
              删除
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}, areEqual);
