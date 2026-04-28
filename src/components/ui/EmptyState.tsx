"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * EmptyState Component
 *
 * Display empty state with icon, title, description, and optional action button.
 *
 * Usage:
 * ```tsx
 * <EmptyState
 *   icon="📋"
 *   title="暂无待办"
 *   description="创建你的第一个待办事项"
 *   action={<Button onClick={handleCreate}>创建待办</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon = "📋",
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`
        flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl
        ${className}
      `}
      style={{
        background:
          "linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-hover) 100%)",
      }}
    >
      {/* Icon */}
      <motion.div
        className="w-16 h-16 flex items-center justify-center rounded-2xl text-4xl mb-5"
        style={{
          backgroundColor:
            "color-mix(in srgb, var(--color-primary) 8%, transparent)",
        }}
        role="img"
        aria-label={icon}
        animate={{
          y: [0, -8, 0],
          boxShadow: [
            "0 0 0 0 rgba(13, 148, 136, 0)",
            "0 0 20px 5px rgba(13, 148, 136, 0.2)",
            "0 0 0 0 rgba(13, 148, 136, 0)",
          ],
        }}
        transition={{
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          boxShadow: { duration: 3, repeat: Infinity },
        }}
      >
        {icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </motion.h3>

      {/* Description */}
      {description && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="text-sm mb-6 max-w-sm leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </motion.p>
      )}

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.3 }}
          whileHover={{ y: -2, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}

export default EmptyState;
