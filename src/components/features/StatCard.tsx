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
    <Card className="py-4 px-5 relative overflow-hidden">
      <div
        className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-[0.04]"
        style={{ backgroundColor: color, transform: "translate(30%, -30%)" }}
      />
      <div
        className="text-xs font-medium uppercase tracking-wider mb-2"
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
