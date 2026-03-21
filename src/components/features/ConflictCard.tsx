"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { SyncConflict } from "@/lib/api/sync";

interface ConflictCardProps {
  conflict: SyncConflict;
  onResolve: (resolution: "local" | "remote") => void;
  isResolving?: boolean;
}

const conflictTypeLabels: Record<string, string> = {
  both_modified: "两端修改",
  local_deleted: "本地已删除",
  remote_deleted: "远程已删除",
};

const entityTypeLabels: Record<string, string> = {
  todo: "待办",
  plan: "计划",
  target: "目标",
  milestone: "里程碑",
  circulation: "打卡",
  task: "任务",
  step: "步骤",
  tag: "标签",
};

/**
 * Conflict card component
 * Shows individual conflict details and resolution options
 */
export function ConflictCard({
  conflict,
  onResolve,
  isResolving,
}: ConflictCardProps) {
  const [showDiff, setShowDiff] = useState(false);

  // Get title from local or remote version
  const localVersion = conflict.local_version as Record<string, unknown> | null;
  const remoteVersion = conflict.remote_version as Record<
    string,
    unknown
  > | null;
  const title =
    (localVersion?.title as string) ||
    (remoteVersion?.title as string) ||
    "未知";

  return (
    <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)]">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {entityTypeLabels[conflict.entity_type] || conflict.entity_type}
          </Badge>
          <span className="font-medium">{title}</span>
        </div>
        <Badge variant="destructive">
          {conflictTypeLabels.both_modified || "冲突"}
        </Badge>
      </div>

      <div className="text-sm text-[var(--color-text-secondary)] mb-3">
        本地:{" "}
        {conflict.local_modified_at
          ? format(new Date(conflict.local_modified_at), "yyyy-MM-dd HH:mm")
          : "未知"}{" "}
        | 远程:{" "}
        {conflict.remote_modified_at
          ? format(new Date(conflict.remote_modified_at), "yyyy-MM-dd HH:mm")
          : "未知"}
      </div>

      {showDiff && (
        <div className="grid grid-cols-2 gap-4 mb-3 p-3 bg-[var(--color-muted)] rounded text-xs">
          <div>
            <h4 className="font-medium mb-1">本地版本</h4>
            <pre className="overflow-auto max-h-32 whitespace-pre-wrap">
              {JSON.stringify(localVersion, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-medium mb-1">远程版本</h4>
            <pre className="overflow-auto max-h-32 whitespace-pre-wrap">
              {JSON.stringify(remoteVersion, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onResolve("local")}
          disabled={isResolving}
        >
          保留本地
        </Button>
        <Button
          size="sm"
          onClick={() => onResolve("remote")}
          disabled={isResolving}
        >
          保留远程
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowDiff(!showDiff)}
        >
          {showDiff ? "隐藏详情" : "查看详情"}
        </Button>
      </div>
    </div>
  );
}
