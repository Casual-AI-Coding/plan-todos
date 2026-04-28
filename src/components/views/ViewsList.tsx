"use client";

import { Card, ProgressBar } from "@/components/ui";
import { Icons } from "@/components/ui/Icons";
import type { Todo, Task, Plan, Target, Step, Milestone } from "@/lib/types";
import type { LucideIcon } from "lucide-react";

export interface ViewsListProps {
  todos: Todo[];
  plans: Plan[];
  targets: Target[];
  milestones: Milestone[];
  tasksByPlan: Record<string, Task[]>;
  targetSteps: Record<string, Step[]>;
  filters: {
    todo: boolean;
    task: boolean;
    plan: boolean;
    target: boolean;
    milestone: boolean;
  };
  onNavigate?: (type: string, id: string) => void;
}

const sectionConfig: {
  key: string;
  emoji: string;
  label: string;
  icon: LucideIcon;
  borderColor: string;
  accentColor: string;
}[] = [
  {
    key: "plan",
    emoji: "🚀",
    label: "计划",
    icon: Icons.FolderOpen,
    borderColor: "var(--color-primary)",
    accentColor: "var(--color-primary)",
  },
  {
    key: "target",
    emoji: "🎯",
    label: "目标",
    icon: Icons.Target,
    borderColor: "var(--color-cta)",
    accentColor: "var(--color-cta)",
  },
  {
    key: "todo",
    emoji: "✅",
    label: "待办",
    icon: Icons.CheckSquare,
    borderColor: "var(--color-secondary)",
    accentColor: "var(--color-secondary)",
  },
  {
    key: "milestone",
    emoji: "🏁",
    label: "里程碑",
    icon: Icons.Flag,
    borderColor: "var(--color-text-muted)",
    accentColor: "var(--color-text-muted)",
  },
];

export function ViewsList({
  todos,
  plans,
  targets,
  milestones,
  tasksByPlan,
  targetSteps,
  filters,
  onNavigate,
}: ViewsListProps) {
  return (
    <div className="space-y-6">
      {/* Plans with Tasks */}
      {filters.plan && (
        <Card className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: sectionConfig[0].borderColor }}
          />
          <div className="pl-2">
            <div className="flex items-center gap-2 mb-4">
              {sectionConfig[0].icon &&
                (() => {
                  const Icon = sectionConfig[0].icon;
                  return (
                    <Icon
                      size={18}
                      style={{ color: sectionConfig[0].accentColor }}
                    />
                  );
                })()}
              <h3
                className="font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {sectionConfig[0].emoji} {sectionConfig[0].label} (Plans)
              </h3>
            </div>
            {plans.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                暂无计划
              </p>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="pl-4 pr-2 py-2 cursor-pointer hover:opacity-80 rounded-r transition-opacity border-l-2"
                    style={{ borderLeftColor: sectionConfig[0].borderColor }}
                    onClick={() => onNavigate?.("plan", plan.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {plan.title}
                      </div>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          plan.status === "active"
                            ? "bg-teal-100 text-teal-700"
                            : plan.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {plan.status}
                      </span>
                    </div>
                    {plan.description && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {plan.description}
                      </p>
                    )}
                    {plan.start_date && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        📅 {plan.start_date}{" "}
                        {plan.end_date && `~ ${plan.end_date}`}
                      </p>
                    )}
                    {/* Tasks under plan */}
                    {filters.task &&
                      (tasksByPlan[plan.id] || []).length > 0 && (
                        <div className="mt-3 pl-4 space-y-2">
                          {(tasksByPlan[plan.id] || []).map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  task.status === "done"
                                    ? "bg-green-500"
                                    : task.status === "in-progress"
                                      ? "bg-orange-500"
                                      : "bg-gray-300"
                                }`}
                              ></span>
                              <span
                                className={
                                  task.status === "done" ? "line-through" : ""
                                }
                                style={{
                                  color:
                                    task.status === "done"
                                      ? "var(--color-text-muted)"
                                      : "var(--color-text)",
                                }}
                              >
                                {task.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Targets with Steps */}
      {filters.target && (
        <Card className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: sectionConfig[1].borderColor }}
          />
          <div className="pl-2">
            <div className="flex items-center gap-2 mb-4">
              {sectionConfig[1].icon &&
                (() => {
                  const Icon = sectionConfig[1].icon;
                  return (
                    <Icon
                      size={18}
                      style={{ color: sectionConfig[1].accentColor }}
                    />
                  );
                })()}
              <h3
                className="font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {sectionConfig[1].emoji} {sectionConfig[1].label} (Targets)
              </h3>
            </div>
            {targets.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                暂无目标
              </p>
            ) : (
              <div className="space-y-3">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    className="pl-4 pr-2 py-2 cursor-pointer hover:opacity-80 rounded-r transition-opacity border-l-2"
                    style={{ borderLeftColor: sectionConfig[1].borderColor }}
                    onClick={() => onNavigate?.("target", target.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="font-medium"
                        style={{ color: "var(--color-text)" }}
                      >
                        {target.title}
                      </div>
                      <span
                        className="font-medium"
                        style={{ color: "var(--color-warning)" }}
                      >
                        {target.progress}%
                      </span>
                    </div>
                    {target.description && (
                      <p
                        className="text-sm mt-1"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {target.description}
                      </p>
                    )}
                    {target.due_date && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        📅 {target.due_date}
                      </p>
                    )}
                    <ProgressBar
                      value={target.progress}
                      color="orange"
                      size="sm"
                      className="mt-2"
                    />
                    {/* Steps under target */}
                    {(targetSteps[target.id] || []).length > 0 && (
                      <div className="mt-3 pl-4 space-y-2">
                        {(targetSteps[target.id] || []).map((step) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                step.status === "completed"
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            ></span>
                            <span
                              className={
                                step.status === "completed"
                                  ? "line-through"
                                  : ""
                              }
                              style={{
                                color:
                                  step.status === "completed"
                                    ? "var(--color-text-muted)"
                                    : "var(--color-text)",
                              }}
                            >
                              {step.title}
                            </span>
                            <span
                              className="text-xs px-1 rounded"
                              style={{
                                backgroundColor: "var(--color-bg-hover)",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {step.weight}%
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Standalone Todos */}
      {filters.todo && (
        <Card className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: sectionConfig[2].borderColor }}
          />
          <div className="pl-2">
            <div className="flex items-center gap-2 mb-4">
              {sectionConfig[2].icon &&
                (() => {
                  const Icon = sectionConfig[2].icon;
                  return (
                    <Icon
                      size={18}
                      style={{ color: sectionConfig[2].accentColor }}
                    />
                  );
                })()}
              <h3
                className="font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {sectionConfig[2].emoji} {sectionConfig[2].label} (Todos)
              </h3>
            </div>
            {todos.filter((t) => t.status !== "done").length === 0 ? (
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                暂无待办
              </p>
            ) : (
              <div className="space-y-2">
                {todos
                  .filter((t) => t.status !== "done")
                  .map((todo) => (
                    <div
                      key={todo.id}
                      className="flex items-center gap-3 p-2 rounded cursor-pointer transition-colors"
                      style={{ backgroundColor: "var(--color-bg-hover)" }}
                      onClick={() => onNavigate?.("todo", todo.id)}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          todo.status === "done"
                            ? "bg-green-500"
                            : todo.status === "in-progress"
                              ? "bg-orange-500"
                              : "bg-gray-300"
                        }`}
                      ></span>
                      <span
                        className={
                          todo.status === "done"
                            ? "line-through flex-1"
                            : "flex-1"
                        }
                        style={{
                          color:
                            todo.status === "done"
                              ? "var(--color-text-muted)"
                              : "var(--color-text)",
                        }}
                      >
                        {todo.title}
                      </span>
                      {todo.due_date && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          📅 {todo.due_date}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Milestones */}
      {filters.milestone && (
        <Card className="relative overflow-hidden">
          <div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: sectionConfig[3].borderColor }}
          />
          <div className="pl-2">
            <div className="flex items-center gap-2 mb-4">
              {sectionConfig[3].icon &&
                (() => {
                  const Icon = sectionConfig[3].icon;
                  return (
                    <Icon
                      size={18}
                      style={{ color: sectionConfig[3].accentColor }}
                    />
                  );
                })()}
              <h3
                className="font-semibold"
                style={{ color: "var(--color-text)" }}
              >
                {sectionConfig[3].emoji} {sectionConfig[3].label} (Milestones)
              </h3>
            </div>
            {milestones.length === 0 ? (
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                暂无里程碑
              </p>
            ) : (
              <div className="space-y-2">
                {milestones.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 p-2 rounded cursor-pointer transition-colors"
                    style={{ backgroundColor: "var(--color-bg-hover)" }}
                    onClick={() => onNavigate?.("milestone", m.id)}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        m.status === "completed"
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    ></span>
                    <span
                      className="flex-1"
                      style={{ color: "var(--color-text)" }}
                    >
                      {m.title}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {m.progress}%
                    </span>
                    {m.target_date && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        📅 {m.target_date}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
