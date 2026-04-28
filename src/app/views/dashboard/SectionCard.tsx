"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface SectionCardProps {
  title: string;
  titleColor?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: ReactNode;
  headerRight?: ReactNode;
  icon?: LucideIcon;
  accentColor?: string;
}

export function SectionCard({
  title,
  titleColor = "var(--color-text)",
  emptyMessage,
  isEmpty = false,
  children,
  headerRight,
  icon,
  accentColor,
}: SectionCardProps) {
  const IconComponent = icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
    >
      <Card className="relative overflow-hidden">
        {accentColor && (
          <motion.div
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ backgroundColor: accentColor }}
            whileHover={{
              boxShadow: `0 0 12px ${accentColor}`,
              transition: { duration: 0.2 },
            }}
          />
        )}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {IconComponent && (
              <IconComponent
                size={18}
                style={{ color: titleColor }}
                className="shrink-0"
              />
            )}
            <h3 className="font-semibold" style={{ color: titleColor }}>
              {title}
            </h3>
          </div>
          {headerRight}
        </div>
        {isEmpty && emptyMessage ? (
          <p
            className="text-sm py-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            {emptyMessage}
          </p>
        ) : (
          children
        )}
      </Card>
    </motion.div>
  );
}