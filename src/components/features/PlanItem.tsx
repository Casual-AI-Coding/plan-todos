"use client";

import React from "react";
import { Trash2, Archive } from "lucide-react";
import {
  Card,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui";
import { TagBadge } from "@/components/ui/TagBadge";
import { ReminderQuickButton } from "./ReminderQuickButton";
import { arraysEqual, areTagsEqual } from "@/lib/utils/compare";
import type { Plan, Tag } from "@/lib/types";

export interface PlanItemProps {
  plan: Plan;
  tags?: Tag[];
  reminderTimes?: number[];
  onDelete?: (id: string) => void;
  onClick?: (plan: Plan) => void;
  onReminderUpdate?: (planId: string, times: number[]) => void;
  onArchive?: (plan: Plan) => void;
}

/**
 * Custom comparison function for React.memo
 * Only re-render if plan data changes
 */
function areEqual(prevProps: PlanItemProps, nextProps: PlanItemProps): boolean {
  const prevTags = prevProps.tags || [];
  const nextTags = nextProps.tags || [];
  const tagsEqual = areTagsEqual(prevTags, nextTags);

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
  onArchive,
}: PlanItemProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
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
                    <TagBadge key={tag.id} tag={tag} size="sm" />
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
                aria-label="删除计划"
              >
                🗑️
              </button>
            )}
          </div>
        </Card>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {onArchive && (
          <ContextMenuItem
            icon={<Archive className="w-4 h-4" />}
            onClick={() => onArchive(plan)}
          >
            {plan.status === "archived" ? "取消归档" : "归档"}
          </ContextMenuItem>
        )}
        {onDelete && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem
              icon={<Trash2 className="w-4 h-4" />}
              variant="danger"
              onClick={() => onDelete(plan.id)}
            >
              删除
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}, areEqual);
