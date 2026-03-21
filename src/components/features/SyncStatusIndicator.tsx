"use client";

import React from "react";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useSyncProgress } from "@/hooks/useSync";

/**
 * Sync status indicator component
 * Shows real-time sync progress: idle, syncing with progress bar, or error
 */
export function SyncStatusIndicator() {
  const { data: status } = useSyncProgress();

  if (!status) return null;

  return (
    <div className="p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
      {status.type === "idle" && (
        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <span>同步完成</span>
        </div>
      )}

      {status.type === "syncing" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
            <span>同步中 {status.progress}%</span>
          </div>
          <ProgressBar value={status.progress} />
        </div>
      )}

      {status.type === "error" && (
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>同步失败: {status.message}</span>
        </div>
      )}
    </div>
  );
}
