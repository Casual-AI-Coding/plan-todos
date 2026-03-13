"use client";

import { Card } from "@/components/ui";

export interface StatCardProps {
  value: number | string;
  label: string;
  color?: string;
  size?: "sm" | "lg";
}

export function StatCard({
  value,
  label,
  color = "var(--color-primary)",
  size = "lg",
}: StatCardProps) {
  const valueClass =
    size === "lg" ? "text-3xl font-bold" : "text-lg font-semibold";

  return (
    <Card className="py-4 px-5">
      <div
        className="text-xs font-medium uppercase tracking-wide mb-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </div>
      <div className={`${valueClass} tabular-nums`} style={{ color }}>
        {value}
      </div>
    </Card>
  );
}
