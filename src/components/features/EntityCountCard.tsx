"use client";

import { Card } from "@/components/ui";

export interface EntityCountCardProps {
  count: number;
  label: string;
}

export function EntityCountCard({ count, label }: EntityCountCardProps) {
  return (
    <Card className="text-center py-2">
      <div
        className="text-lg font-semibold"
        style={{ color: "var(--color-primary)" }}
      >
        {count}
      </div>
      <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
        {label}
      </div>
    </Card>
  );
}
