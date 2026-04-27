"use client";

import { Card } from "@/components/ui";

export interface EntityCountCardProps {
  count: number;
  label: string;
}

export function EntityCountCard({ count, label }: EntityCountCardProps) {
  return (
    <Card className="text-center py-3 px-2">
      <div
        className="text-xl font-bold tabular-nums"
        style={{ color: "var(--color-primary)" }}
      >
        {count}
      </div>
      <div
        className="text-xs mt-0.5 font-medium"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </div>
    </Card>
  );
}
