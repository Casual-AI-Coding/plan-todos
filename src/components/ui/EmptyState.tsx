"use client";

import { ReactNode } from "react";

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
    <div
      className={`
        flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl
        ${className}
      `}
      style={{
        background: "linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-hover) 100%)",
      }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 flex items-center justify-center rounded-2xl text-4xl mb-5"
        style={{
          backgroundColor: "color-mix(in srgb, var(--color-primary) 8%, transparent)",
        }}
        role="img"
        aria-label={icon}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className="text-lg font-semibold mb-2"
        style={{ color: "var(--color-text)" }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="text-sm mb-6 max-w-sm leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </p>
      )}

      {/* Action Button */}
      {action && <div>{action}</div>}
    </div>
  );
}

export default EmptyState;
