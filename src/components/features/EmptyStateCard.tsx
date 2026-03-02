"use client";

import { Card } from "@/components/ui";
import { EmptyState, EmptyStateProps } from "@/components/ui/EmptyState";

export interface EmptyStateCardProps extends Omit<
  EmptyStateProps,
  "className"
> {
  className?: string;
}

/**
 * EmptyStateCard Component
 *
 * EmptyState wrapped in a Card component for consistent styling.
 *
 * Usage:
 * ```tsx
 * <EmptyStateCard
 *   icon="📋"
 *   title="暂无待办"
 *   description="创建你的第一个待办事项"
 *   action={<Button onClick={handleCreate}>创建待办</Button>}
 * />
 * ```
 */
export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateCardProps) {
  return (
    <Card
      className={className}
      style={{
        background: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
      }}
    >
      <EmptyState
        icon={icon}
        title={title}
        description={description}
        action={action}
      />
    </Card>
  );
}

export default EmptyStateCard;
