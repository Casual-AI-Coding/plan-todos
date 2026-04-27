"use client";

import { StaggeredList, StaggeredListItem, HoverCard } from "@/components/ui/animations";
import { EntityCountCard } from "@/components/features/EntityCountCard";

interface EntityCountsRowProps {
  todo: number;
  plan: number;
  task: number;
  target: number;
  milestone: number;
  circulation: number;
  weekCompleted: number;
}

export function EntityCountsRow({
  todo,
  plan,
  task,
  target,
  milestone,
  circulation,
  weekCompleted,
}: EntityCountsRowProps) {
  return (
    <StaggeredList
      className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2"
      staggerDelay={50}
    >
      <StaggeredListItem>
        <HoverCard hoverElevation={-2} glowOnHover className="p-2">
          <EntityCountCard count={todo} label="待办" />
        </HoverCard>
      </StaggeredListItem>
      <StaggeredListItem>
        <HoverCard hoverElevation={-2} glowOnHover className="p-2">
          <EntityCountCard count={plan} label="计划" />
        </HoverCard>
      </StaggeredListItem>
      <StaggeredListItem>
        <HoverCard hoverElevation={-2} glowOnHover className="p-2">
          <EntityCountCard count={task} label="任务" />
        </HoverCard>
      </StaggeredListItem>
      <StaggeredListItem>
        <HoverCard hoverElevation={-2} glowOnHover className="p-2">
          <EntityCountCard count={target} label="目标" />
        </HoverCard>
      </StaggeredListItem>
      <StaggeredListItem>
        <HoverCard hoverElevation={-2} glowOnHover className="p-2">
          <EntityCountCard count={milestone} label="里程碑" />
        </HoverCard>
      </StaggeredListItem>
      <StaggeredListItem>
        <HoverCard hoverElevation={-2} glowOnHover className="p-2">
          <EntityCountCard count={circulation} label="打卡" />
        </HoverCard>
      </StaggeredListItem>
      <StaggeredListItem>
        <HoverCard hoverElevation={-2} glowOnHover className="p-2">
          <EntityCountCard count={weekCompleted} label="本周完成" />
        </HoverCard>
      </StaggeredListItem>
    </StaggeredList>
  );
}
