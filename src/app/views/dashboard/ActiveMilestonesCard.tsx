"use client";

import { motion } from "framer-motion";
import { ProgressBar } from "@/components/ui";
import { Icons } from "@/components/ui/Icons";
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
    <SectionCard
      title="进行中的里程碑"
      icon={Icons.Flag}
      accentColor="var(--color-text-muted)"
    >
      <div className="space-y-3">
        {milestones.slice(0, 3).map((milestone) => (
          <motion.div
            key={milestone.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer p-2 rounded"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
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
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}