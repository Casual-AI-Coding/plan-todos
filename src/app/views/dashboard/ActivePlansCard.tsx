"use client";

import { ProgressBar } from "@/components/ui";
import { Icons } from "@/components/ui/Icons";
import { SectionCard } from "./SectionCard";

interface ActivePlan {
  id: string;
  title: string;
  progress: number;
  task_count: number;
  completed_count: number;
}

interface ActivePlansCardProps {
  plans: ActivePlan[];
  onClickPlan: (id: string) => void;
}

export function ActivePlansCard({ plans, onClickPlan }: ActivePlansCardProps) {
  return (
    <SectionCard
      title="进行中的计划"
      icon={Icons.FolderOpen}
      accentColor="var(--color-secondary)"
      isEmpty={plans.length === 0}
      emptyMessage="暂无进行中的计划"
    >
      <div className="space-y-3">
        {plans.slice(0, 3).map((plan) => (
          <div
            key={plan.id}
            className="cursor-pointer hover:opacity-80 transition-all duration-200 p-2 rounded"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
            onClick={() => onClickPlan(plan.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickPlan(plan.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text)" }}>{plan.title}</span>
              <span style={{ color: "var(--color-primary)" }}>
                {plan.completed_count}/{plan.task_count}
              </span>
            </div>
            <ProgressBar value={plan.progress} color="teal" size="sm" />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
