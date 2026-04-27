"use client";

import { Card, ProgressBar } from "@/components/ui";
import type { Todo, Task, Plan, Target, Step, Milestone } from "@/lib/types";

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
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            🚀 计划 (Plans)
          </h3>
          {plans.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无计划</p>
          ) : (
            <div className="space-y-4">
              {plans.map((plan) => (
                <div key={plan.id} className="border-l-4 border-teal-400 pl-4 cursor-pointer hover:bg-gray-50 rounded-r p-2 -mr-2 transition-colors" onClick={() => onNavigate?.("plan", plan.id)}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{plan.title}</div>
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
                    <p className="text-sm text-gray-500 mt-1">
                      {plan.description}
                    </p>
                  )}
                  {plan.start_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      📅 {plan.start_date}{" "}
                      {plan.end_date && `~ ${plan.end_date}`}
                    </p>
                  )}
                  {/* Tasks under plan */}
                  {filters.task && (tasksByPlan[plan.id] || []).length > 0 && (
                    <div className="mt-2 pl-4 space-y-2">
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
                              task.status === "done"
                                ? "line-through text-gray-400"
                                : ""
                            }
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
        </Card>
      )}

      {/* Targets with Steps */}
      {filters.target && (
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            🎯 目标 (Targets)
          </h3>
          {targets.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无目标</p>
          ) : (
            <div className="space-y-4">
              {targets.map((target) => (
                <div
                  key={target.id}
                  className="border-l-4 border-orange-400 pl-4 cursor-pointer hover:bg-gray-50 rounded-r p-2 -mr-2 transition-colors"
                  onClick={() => onNavigate?.("target", target.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{target.title}</div>
                    <span className="text-orange-500 font-medium">
                      {target.progress}%
                    </span>
                  </div>
                  {target.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {target.description}
                    </p>
                  )}
                  {target.due_date && (
                    <p className="text-xs text-gray-400 mt-1">
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
                    <div className="mt-2 pl-4 space-y-2">
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
                                ? "line-through text-gray-400"
                                : ""
                            }
                          >
                            {step.title}
                          </span>
                          <span className="text-xs bg-gray-200 px-1 rounded">
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
        </Card>
      )}

      {/* Standalone Todos - hide completed */}
      {filters.todo && (
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            ✅ 待办 (Todos)
          </h3>
          {todos.filter((t) => t.status !== "done").length === 0 ? (
            <p className="text-gray-400 text-sm">暂无待办</p>
          ) : (
            <div className="space-y-2">
              {todos
                .filter((t) => t.status !== "done")
                .map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
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
                          ? "line-through text-gray-400 flex-1"
                          : "flex-1"
                      }
                    >
                      {todo.title}
                    </span>
                    {todo.due_date && (
                      <span className="text-xs text-gray-500">
                        📅 {todo.due_date}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          )}
        </Card>
      )}

      {/* Milestones */}
      {filters.milestone && (
        <Card>
          <h3
            className="font-semibold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            🏁 里程碑 (Milestones)
          </h3>
          {milestones.length === 0 ? (
            <p className="text-gray-400 text-sm">暂无里程碑</p>
          ) : (
            <div className="space-y-2">
              {milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => onNavigate?.("milestone", m.id)}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.status === "completed" ? "bg-green-500" : "bg-gray-300"
                    }`}
                  ></span>
                  <span className="flex-1">{m.title}</span>
                  <span className="text-xs text-gray-500">{m.progress}%</span>
                  {m.target_date && (
                    <span className="text-xs text-gray-500">
                      📅 {m.target_date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
