"use client";

import { QuickActions } from "@/components/features/QuickActions";

interface ProgressSectionProps {
  productivityScore: number;
  todayProgress: number;
  streakProgress: number;
}

export function ProgressSection({
  productivityScore,
  todayProgress,
  streakProgress,
}: ProgressSectionProps) {
  return (
    <QuickActions
      productivityScore={productivityScore}
      todayProgress={todayProgress}
      streakProgress={streakProgress}
    />
  );
}
