"use client";

import { Card, ProgressBar, Checkbox } from "@/components/ui";
import {
  StaggeredList,
  StaggeredListItem,
  HoverCard,
} from "@/components/ui/animations";
import { useDashboard } from "@/hooks/useDashboard";
import { StatCard } from "@/components/features/StatCard";
import { EntityCountCard } from "@/components/features/EntityCountCard";
import { CirculationStatsCard } from "@/components/features/CirculationStatsCard";
import { QuickActions } from "@/components/features/QuickActions";

export function Dashboard() {
  const { data: dashboard, isLoading, error } = useDashboard();

  if (error) {
    return (
      <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          今日总览
        </h2>
        <p className="text-red-500">加载失败: {error.message}</p>
      </div>
    );
  }

  if (isLoading || !dashboard) {
    return (
      <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <h2
          className="text-xl sm:text-2xl font-semibold"
          style={{ color: "var(--color-text)" }}
        >
          今日总览
        </h2>
        <div className="flex items-center justify-center h-64">
          <div style={{ color: "var(--color-text-muted)" }}>加载中...</div>
        </div>
      </div>
    );
  }

  const {
    overview,
    week,
    counts,
    today_todos,
    overdue_todos,
    active_plans,
    active_targets,
    active_milestones,
  } = dashboard;

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <h2
        className="text-xl sm:text-2xl font-semibold"
        style={{ color: "var(--color-text)" }}
      >
        今日总览
      </h2>

      {/* Stats Cards - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
      <StaggeredList
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        staggerDelay={100}
      >
        <StaggeredListItem>
          <HoverCard hoverElevation={-4} glowOnHover className="p-4">
            <StatCard value={overview.today_todos_count} label="今日待办" />
          </HoverCard>
        </StaggeredListItem>
        <StaggeredListItem>
          <HoverCard hoverElevation={-4} glowOnHover className="p-4">
            <StatCard
              value={overview.upcoming_3days_count}
              label="即将到期 (3天内)"
              color="var(--color-warning)"
            />
          </HoverCard>
        </StaggeredListItem>
        <StaggeredListItem>
          <HoverCard hoverElevation={-4} glowOnHover className="p-4">
            <StatCard value={overview.completed_today_count} label="今日完成" />
          </HoverCard>
        </StaggeredListItem>
      </StaggeredList>

      {/* Entity Counts - Responsive: 3 col mobile, 5 col tablet, 7 col desktop */}
      <StaggeredList
        className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-7 gap-2"
        staggerDelay={50}
      >
        <StaggeredListItem>
          <HoverCard hoverElevation={-2} glowOnHover className="p-2">
            <EntityCountCard count={counts.todo} label="待办" />
          </HoverCard>
        </StaggeredListItem>
        <StaggeredListItem>
          <HoverCard hoverElevation={-2} glowOnHover className="p-2">
            <EntityCountCard count={counts.plan} label="计划" />
          </HoverCard>
        </StaggeredListItem>
        <StaggeredListItem>
          <HoverCard hoverElevation={-2} glowOnHover className="p-2">
            <EntityCountCard count={counts.task} label="任务" />
          </HoverCard>
        </StaggeredListItem>
        <StaggeredListItem>
          <HoverCard hoverElevation={-2} glowOnHover className="p-2">
            <EntityCountCard count={counts.target} label="目标" />
          </HoverCard>
        </StaggeredListItem>
        <StaggeredListItem>
          <HoverCard hoverElevation={-2} glowOnHover className="p-2">
            <EntityCountCard count={counts.milestone} label="里程碑" />
          </HoverCard>
        </StaggeredListItem>
        <StaggeredListItem>
          <HoverCard hoverElevation={-2} glowOnHover className="p-2">
            <EntityCountCard count={counts.circulation || 0} label="打卡" />
          </HoverCard>
        </StaggeredListItem>
        <StaggeredListItem>
          <HoverCard hoverElevation={-2} glowOnHover className="p-2">
            <EntityCountCard count={week.completed_count} label="本周完成" />
          </HoverCard>
        </StaggeredListItem>
      </StaggeredList>

      {/* Circulation Stats */}
      {dashboard.circulation_stats && (
        <CirculationStatsCard
          todayPending={dashboard.circulation_stats.today_pending}
          todayCompleted={dashboard.circulation_stats.today_completed}
          currentStreak={dashboard.circulation_stats.current_streak}
        />
      )}

      {/* Progress Rings */}
      <QuickActions
        productivityScore={overview.productivity_score || 0}
        todayProgress={
          overview.completed_today_count > 0
            ? Math.min(
                100,
                (overview.completed_today_count / overview.today_todos_count) *
                  100,
              )
            : 0
        }
        streakProgress={
          dashboard.circulation_stats
            ? Math.min(
                100,
                (dashboard.circulation_stats.current_streak / 30) * 100,
              )
            : 0
        }
      />

      {/* Today's Tasks */}
      <Card>
        <h3
          className="font-semibold mb-4"
          style={{ color: "var(--color-text)" }}
        >
          今日待办
        </h3>
        {today_todos.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            暂无今日待办
          </p>
        ) : (
          <div className="space-y-2">
            {today_todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-2 rounded"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
              >
                <Checkbox checked={todo.status === "done"} readOnly />
                <span
                  className={todo.status === "done" ? "line-through" : ""}
                  style={{
                    color:
                      todo.status === "done"
                        ? "var(--color-text-muted)"
                        : "var(--color-text)",
                  }}
                >
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Overdue Tasks */}
      {overdue_todos.length > 0 && (
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-error)" }}
          >
            已过期
          </h3>
          <div className="space-y-2">
            {overdue_todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-2 rounded"
                style={{ backgroundColor: "var(--color-bg-hover)" }}
              >
                <Checkbox checked={todo.status === "done"} readOnly />
                <span
                  className={todo.status === "done" ? "line-through" : ""}
                  style={{
                    color:
                      todo.status === "done"
                        ? "var(--color-text-muted)"
                        : "var(--color-text)",
                  }}
                >
                  {todo.title}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active Plans & Targets - Responsive: 1 col mobile, 2 col tablet+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            进行中的计划
          </h3>
          {active_plans.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              暂无进行中的计划
            </p>
          ) : (
            <div className="space-y-3">
              {active_plans.slice(0, 3).map((plan) => (
                <div key={plan.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "var(--color-text)" }}>
                      {plan.title}
                    </span>
                    <span style={{ color: "var(--color-primary)" }}>
                      {plan.completed_count}/{plan.task_count}
                    </span>
                  </div>
                  <ProgressBar value={plan.progress} color="teal" size="sm" />
                </div>
              ))}
            </div>
          )}
        </Card>
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            进行中的目标
          </h3>
          {active_targets.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              暂无进行中的目标
            </p>
          ) : (
            <div className="space-y-3">
              {active_targets.slice(0, 3).map((target) => (
                <div key={target.id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: "var(--color-text)" }}>
                      {target.title}
                    </span>
                    <span style={{ color: "var(--color-warning)" }}>
                      {target.progress}%
                    </span>
                  </div>
                  <ProgressBar
                    value={target.progress}
                    color="orange"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Active Milestones */}
      {active_milestones.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4" style={{ color: "#134E4A" }}>
            进行中的里程碑
          </h3>
          <div className="space-y-3">
            {active_milestones.slice(0, 3).map((milestone) => (
              <div key={milestone.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{milestone.title}</span>
                  <span className="text-teal-600">{milestone.progress}%</span>
                </div>
                <ProgressBar
                  value={milestone.progress}
                  color="teal"
                  size="sm"
                />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
