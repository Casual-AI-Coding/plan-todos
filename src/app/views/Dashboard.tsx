"use client";

import { useDashboardViewModel } from "./dashboard/useDashboardViewModel";
import { DashboardSkeleton } from "./dashboard/DashboardSkeleton";
import { DashboardError } from "./dashboard/DashboardError";
import { StatsRow } from "./dashboard/StatsRow";
import { EntityCountsRow } from "./dashboard/EntityCountsRow";
import { CirculationSection } from "./dashboard/CirculationSection";
import { ProgressSection } from "./dashboard/ProgressSection";
import { TodayTodosCard } from "./dashboard/TodayTodosCard";
import { OverdueTodosCard } from "./dashboard/OverdueTodosCard";
import { ActivePlansCard } from "./dashboard/ActivePlansCard";
import { ActiveTargetsCard } from "./dashboard/ActiveTargetsCard";
import { ActiveMilestonesCard } from "./dashboard/ActiveMilestonesCard";

export function Dashboard() {
  const vm = useDashboardViewModel();

  if (vm.isLoading) {
    return <DashboardSkeleton />;
  }

  if (vm.error) {
    return <DashboardError message={vm.error.message} />;
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <h2
        className="text-xl sm:text-2xl font-semibold"
        style={{ color: "var(--color-text)" }}
      >
        今日总览
      </h2>

      <StatsRow
        todayTodosCount={vm.stats.todayTodosCount}
        upcoming3DaysCount={vm.stats.upcoming3DaysCount}
        completedTodayCount={vm.stats.completedTodayCount}
      />

      <EntityCountsRow
        todo={vm.entityCounts.todo}
        plan={vm.entityCounts.plan}
        task={vm.entityCounts.task}
        target={vm.entityCounts.target}
        milestone={vm.entityCounts.milestone}
        circulation={vm.entityCounts.circulation}
        weekCompleted={vm.entityCounts.weekCompleted}
      />

      {vm.circulationStats && (
        <CirculationSection stats={vm.circulationStats} />
      )}

      <ProgressSection
        productivityScore={vm.progressMetrics.productivityScore}
        todayProgress={vm.progressMetrics.todayProgress}
        streakProgress={vm.progressMetrics.streakProgress}
      />

      <TodayTodosCard
        todos={vm.todayTodos}
        onToggle={vm.handleToggleTodo}
      />

      <OverdueTodosCard
        todos={vm.overdueTodos}
        onToggle={vm.handleToggleTodo}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ActivePlansCard
          plans={vm.activePlans}
          onClickPlan={(id) => vm.handleNavigateToEntity("plans", id)}
        />
        <ActiveTargetsCard
          targets={vm.activeTargets}
          onClickTarget={(id) => vm.handleNavigateToEntity("targets", id)}
        />
      </div>

      <ActiveMilestonesCard
        milestones={vm.activeMilestones}
        onClickMilestone={(id) => vm.handleNavigateToEntity("milestones", id)}
      />
    </div>
  );
}
