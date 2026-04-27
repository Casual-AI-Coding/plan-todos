"use client";

import { Card } from "@/components/ui";
import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  titleColor?: string;
  emptyMessage?: string;
  isEmpty?: boolean;
  children: ReactNode;
  headerRight?: ReactNode;
}

export function SectionCard({
  title,
  titleColor = "var(--color-text)",
  emptyMessage,
  isEmpty = false,
  children,
  headerRight,
}: SectionCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold" style={{ color: titleColor }}>
          {title}
        </h3>
        {headerRight}
      </div>
      {isEmpty && emptyMessage ? (
        <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
          {emptyMessage}
        </p>
      ) : (
        children
      )}
    </Card>
  );
}
