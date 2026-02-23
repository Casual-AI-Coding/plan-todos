"use client";

import { Card } from "@/components/ui";
import { ProgressRing } from "@/components/ui/ProgressRing";

export interface QuickActionsProps {
  productivityScore: number;
  todayProgress: number;
  streakProgress: number;
}

export function QuickActions({
  productivityScore,
  todayProgress,
  streakProgress,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="flex flex-col items-center justify-center py-6">
        <ProgressRing
          value={productivityScore}
          size={100}
          strokeWidth={8}
          label="效率"
        />
        <div
          className="text-sm mt-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          效率评分
        </div>
      </Card>
      <Card className="flex flex-col items-center justify-center py-6">
        <ProgressRing
          value={todayProgress}
          size={100}
          strokeWidth={8}
          label="完成"
        />
        <div
          className="text-sm mt-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          今日进度
        </div>
      </Card>
      <Card className="flex flex-col items-center justify-center py-6">
        <ProgressRing
          value={streakProgress}
          size={100}
          strokeWidth={8}
          label="连续"
        />
        <div
          className="text-sm mt-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          30天连续
        </div>
      </Card>
    </div>
  );
}
