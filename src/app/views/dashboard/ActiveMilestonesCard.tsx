"use client";

import { ProgressBar } from "@/components/ui";
import { SectionCard } from "./SectionCard";

interface ActiveMilestone {
  id: string;
  title: string;
  progress: number;
  target_date: string | null;
}

interface ActiveMilestonesCardProps {
  milestones: ActiveMilestone[];
  onClickMilestone: (id: string) => void;
}

export function ActiveMilestonesCard({
  milestones,
  onClickMilestone,
}: ActiveMilestonesCardProps) {
  if (milestones.length === 0) return null;

  return (
    <SectionCard title="进行中的里程碑">
      <div className="space-y-3">
        {milestones.slice(0, 3).map((milestone) => (
          <div
            key={milestone.id}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => onClickMilestone(milestone.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickMilestone(milestone.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text)" }}>
                {milestone.title}
              </span>
              <span style={{ color: "var(--color-primary)" }}>
                {milestone.progress}%
              </span>
            </div>
            <ProgressBar
              value={milestone.progress}
              color="teal"
              size="sm"
            />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
