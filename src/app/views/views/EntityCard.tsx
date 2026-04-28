"use client";

import { motion } from "framer-motion";
import { ProgressBar } from "@/components/ui";
import { ENTITY_TYPE_CONFIG } from "./types";
import type { EntityItem } from "./types";

interface EntityCardProps {
  item: EntityItem;
  onHover?: (item: EntityItem, event: React.MouseEvent) => void;
  onLeave?: () => void;
  onClick?: (type: string, id: string) => void;
  showProgress?: boolean;
  progressColor?: "gray" | "orange" | "teal";
  showIcon?: boolean;
}

export function EntityCard({
  item,
  onHover,
  onLeave,
  onClick,
  showProgress = true,
  progressColor = "teal",
  showIcon = true,
}: EntityCardProps) {
  const config = ENTITY_TYPE_CONFIG[item.type];
  const hasProgress = "progress" in item.data;
  const title = "title" in item.data ? item.data.title : "";
  const id = "id" in item.data ? item.data.id : "";
  const IconComponent = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{
        scale: 1.03,
        y: -2,
        transition: { duration: 0.15 },
      }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="p-2.5 rounded-lg border cursor-pointer"
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: config.borderColor,
      }}
      onMouseEnter={(e) => onHover?.(item, e)}
      onMouseLeave={() => onLeave?.()}
      onClick={() => onClick?.(item.type, id)}
    >
      <motion.div
        className="flex items-center gap-2 mb-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {showIcon && IconComponent && (
          <motion.div
            whileHover={{ rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.3 }}
          >
            <IconComponent
              size={14}
              style={{ color: config.accentColor }}
              className="shrink-0"
            />
          </motion.div>
        )}
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded ${config.bgColor} ${config.textColor}`}
        >
          {config.label}
        </span>
      </motion.div>
      <div
        className="font-medium text-sm truncate"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </div>
      {showProgress && hasProgress && (
        <motion.div
          className="mt-2"
          initial={{ opacity: 0, width: 0 }}
          animate={{ opacity: 1, width: "100%" }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <ProgressBar
            value={(item.data as { progress: number }).progress}
            color={progressColor}
            size="sm"
          />
        </motion.div>
      )}
    </motion.div>
  );
}