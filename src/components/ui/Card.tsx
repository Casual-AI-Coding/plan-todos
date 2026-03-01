"use client";

import { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  hoverable?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  role?: string;
  style?: CSSProperties;
  tabIndex?: number;
}

export function Card({
  children,
  className = "",
  onClick,
  onKeyDown,
  hoverable = false,
  padding = "md",
  role,
  style,
  tabIndex,
}: CardProps) {
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      onClick={onClick}
      onKeyDown={onKeyDown}
      role={role}
      tabIndex={tabIndex}
      className={`
        rounded-lg border shadow-sm
        ${hoverable ? "hover:shadow-md transition-shadow cursor-pointer" : ""}
        ${paddingStyles[padding]}
        ${className}
      `}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
