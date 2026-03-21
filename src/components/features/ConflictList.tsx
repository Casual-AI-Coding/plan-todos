"use client";

import React from "react";
import {
  useConflicts,
  useResolveConflict,
  useSyncStatus,
} from "@/hooks/useSync";
import { ConflictCard } from "./ConflictCard";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToastContext } from "@/components/ui/ToastProvider";

interface ConflictListProps {
  onResolved?: () => void;
}

/**
 * Conflict list component
 * Shows all sync conflicts and provides resolution options
 */
export function ConflictList({ onResolved }: ConflictListProps) {
  const { data: conflicts, isLoading } = useConflicts();
  const { refetch: refetchStatus } = useSyncStatus();
  const toast = useToastContext();

  const resolveMutation = useResolveConflict({
    onSuccess: () => {
      toast.success("冲突已解决");
      refetchStatus();
      onResolved?.();
    },
    onError: (error) => {
      toast.error(`解决失败: ${error.message}`);
    },
  });

  const handleResolveAll = async (strategy: "local" | "remote") => {
    if (!conflicts?.length) return;

    let successCount = 0;
    for (const conflict of conflicts) {
      try {
        await resolveMutation.mutateAsync({
          conflictId: conflict.id,
          resolution: strategy,
        });
        successCount++;
      } catch {
        // Continue with other conflicts
      }
    }

    if (successCount > 0) {
      toast.success(`已解决 ${successCount} 个冲突`);
      refetchStatus();
      onResolved?.();
    }
  };

  if (isLoading) {
    return <Skeleton className="h-32 w-full" />;
  }

  if (!conflicts?.length) {
    return (
      <div className="text-center py-8 text-[var(--color-text-secondary)]">
        没有同步冲突
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">同步冲突 ({conflicts.length})</h3>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleResolveAll("local")}
            disabled={resolveMutation.isPending}
          >
            全部保留本地
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleResolveAll("remote")}
            disabled={resolveMutation.isPending}
          >
            全部保留远程
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {conflicts.map((conflict) => (
          <ConflictCard
            key={conflict.id}
            conflict={conflict}
            onResolve={(resolution) =>
              resolveMutation.mutate({
                conflictId: conflict.id,
                resolution,
              })
            }
            isResolving={resolveMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}
