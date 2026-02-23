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
    <Card className="text-center">
      <div className={`${valueClass}`} style={{ color }}>
        {value}
      </div>
      <div
        className="text-sm mt-1"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </div>
    </Card>
  );
}
