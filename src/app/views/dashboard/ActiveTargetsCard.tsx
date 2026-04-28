"use client";

import { motion } from "framer-motion";
import { ProgressBar } from "@/components/ui";
import { Icons } from "@/components/ui/Icons";
import { SectionCard } from "./SectionCard";

interface ActiveTarget {
  id: string;
  title: string;
  progress: number;
  due_date: string | null;
}

interface ActiveTargetsCardProps {
  targets: ActiveTarget[];
  onClickTarget: (id: string) => void;
}

export function ActiveTargetsCard({
  targets,
  onClickTarget,
}: ActiveTargetsCardProps) {
  return (
    <SectionCard
      title="进行中的目标"
      icon={Icons.Target}
      accentColor="var(--color-cta)"
      isEmpty={targets.length === 0}
      emptyMessage="暂无进行中的目标"
    >
      <div className="space-y-3">
        {targets.slice(0, 3).map((target) => (
          <motion.div
            key={target.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.99 }}
            transition={{ duration: 0.2 }}
            className="cursor-pointer p-2 rounded"
            style={{ backgroundColor: "var(--color-bg-hover)" }}
            onClick={() => onClickTarget(target.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClickTarget(target.id);
              }
            }}
            role="button"
            tabIndex={0}
          >
            <div className="flex justify-between text-sm mb-1">
              <span style={{ color: "var(--color-text)" }}>{target.title}</span>
              <span style={{ color: "var(--color-warning)" }}>
                {target.progress}%
              </span>
            </div>
            <ProgressBar value={target.progress} color="orange" size="sm" />
          </motion.div>
        ))}
      </div>
    </SectionCard>
  );
}
