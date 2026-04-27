"use client";

import { CirculationStatsCard } from "@/components/features/CirculationStatsCard";

interface CirculationSectionProps {
  stats: {
    todayPending: number;
    todayCompleted: number;
    currentStreak: number;
  };
}

export function CirculationSection({ stats }: CirculationSectionProps) {
  return (
    <CirculationStatsCard
      todayPending={stats.todayPending}
      todayCompleted={stats.todayCompleted}
      currentStreak={stats.currentStreak}
    />
  );
}
