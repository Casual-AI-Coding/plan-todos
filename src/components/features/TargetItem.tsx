"use client";

import React from "react";
import { Card, ProgressBar, Checkbox } from "@/components/ui";
import { ReminderQuickButton } from "./ReminderQuickButton";
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
  // Shallow compare tags - check length and IDs
  const prevTags = prevProps.tags || [];
  const nextTags = nextProps.tags || [];
  const tagsEqual =
    prevTags.length === nextTags.length &&
    prevTags.every((tag, index) => tag.id === nextTags[index]?.id);

  // Compare steps
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
    JSON.stringify(prevProps.reminderTimes || []) ===
      JSON.stringify(nextProps.reminderTimes || [])
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
              <span
                key={tag.id}
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                }}
              >
                {tag.name}
              </span>
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
  );
}, areEqual);
