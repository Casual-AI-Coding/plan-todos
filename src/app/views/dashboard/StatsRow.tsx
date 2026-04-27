"use client";

import { StaggeredList, StaggeredListItem, HoverCard } from "@/components/ui/animations";
import { StatCard } from "@/components/features/StatCard";

interface StatsRowProps {
  todayTodosCount: number;
  upcoming3DaysCount: number;
  completedTodayCount: number;
}

export function StatsRow({
  todayTodosCount,
  upcoming3DaysCount,
  completedTodayCount,
}: StatsRowProps) {
  return (
    <StaggeredList
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      staggerDelay={100}
    >
      <StaggeredListItem>
        <HoverCard hoverElevation={-4} glowOnHover className="p-4">
          <StatCard value={todayTodosCount} label="今日待办" />
        </HoverCard>
      </StaggeredListItem>
      <StaggeredListItem>
        <HoverCard hoverElevation={-4} glowOnHover className="p-4">
          <StatCard
            value={upcoming3DaysCount}
            label="即将到期 (3天内)"
            color="var(--color-warning)"
          />
        </HoverCard>
      </StaggeredListItem>
      <StaggeredListItem>
        <HoverCard hoverElevation={-4} glowOnHover className="p-4">
          <StatCard value={completedTodayCount} label="今日完成" />
        </HoverCard>
      </StaggeredListItem>
    </StaggeredList>
  );
}
