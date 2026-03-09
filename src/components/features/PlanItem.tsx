"use client";

import React from "react";
import { Card } from "@/components/ui";
import { ReminderQuickButton } from "./ReminderQuickButton";
import type { Plan, Tag } from "@/lib/types";

/**
 * Shallow compare two arrays of primitive values (numbers, strings)
 * More efficient than JSON.stringify for small arrays
 */
function arraysEqual(a: unknown[], b: unknown[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

export interface PlanItemProps {
  plan: Plan;
  tags?: Tag[];
  reminderTimes?: number[];
  onDelete?: (id: string) => void;
  onClick?: (plan: Plan) => void;
  onReminderUpdate?: (planId: string, times: number[]) => void;
}

/**
 * Custom comparison function for React.memo
 * Only re-render if plan data changes
 */
function areEqual(prevProps: PlanItemProps, nextProps: PlanItemProps): boolean {
  // Shallow compare tags - check length and IDs
  const prevTags = prevProps.tags || [];
  const nextTags = nextProps.tags || [];
  const tagsEqual =
    prevTags.length === nextTags.length &&
    prevTags.every((tag, index) => tag.id === nextTags[index]?.id);

  return (
    prevProps.plan.id === nextProps.plan.id &&
    prevProps.plan.title === nextProps.plan.title &&
    prevProps.plan.status === nextProps.plan.status &&
    prevProps.plan.start_date === nextProps.plan.start_date &&
    prevProps.plan.end_date === nextProps.plan.end_date &&
    tagsEqual &&
    arraysEqual(prevProps.reminderTimes || [], nextProps.reminderTimes || [])
  );
}

export const PlanItem = React.memo(function PlanItem({
  plan,
  tags,
  reminderTimes,
  onDelete,
  onClick,
  onReminderUpdate,
}: PlanItemProps) {
  return (
    <Card
      hoverable
      onClick={() => onClick?.(plan)}
      onKeyDown={(e) => e.key === "Enter" && onClick?.(plan)}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div
            className={
              plan.status === "archived" ? "line-through text-gray-400" : ""
            }
          >
            {plan.title}
          </div>
          {/* Reminder button */}
          <ReminderQuickButton
            entityType="plan"
            entityId={plan.id}
            reminderTimes={reminderTimes || []}
            onUpdate={(times) => onReminderUpdate?.(plan.id, times)}
          />
          {/* Tags display */}
          {tags && tags.length > 0 && (
            <div className="flex gap-1 mt-1 flex-wrap">
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
          {plan.start_date && (
            <div className="text-xs text-gray-500 mt-1">
              📅 {plan.start_date}
              {plan.start_date && plan.end_date && " ~ "}
              {plan.end_date || "进行中"}
            </div>
          )}
          {plan.description && (
            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
              {plan.description}
            </div>
          )}
        </div>
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(plan.id);
            }}
            className="text-gray-400 hover:text-red-500 px-2"
          >
            🗑️
          </button>
        )}
      </div>
    </Card>
  );
}, areEqual);
