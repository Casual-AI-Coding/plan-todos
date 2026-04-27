import { type HTMLAttributes, forwardRef } from "react";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className = "", variant = "default", children, ...props }, ref) => {
    const getVariantStyle = (): React.CSSProperties => {
      switch (variant) {
        case "default":
          return {
            backgroundColor:
              "color-mix(in srgb, var(--color-primary) 12%, transparent)",
            color: "var(--color-primary)",
          };
        case "secondary":
          return {
            backgroundColor:
              "color-mix(in srgb, var(--color-secondary) 12%, transparent)",
            color: "var(--color-secondary)",
          };
        case "destructive":
          return {
            backgroundColor:
              "color-mix(in srgb, var(--color-error) 12%, transparent)",
            color: "var(--color-error)",
          };
        case "outline":
          return {
            backgroundColor: "transparent",
            border: "1px solid var(--color-border)",
            color: "var(--color-text)",
          };
        case "success":
          return {
            backgroundColor:
              "color-mix(in srgb, var(--color-success) 12%, transparent)",
            color: "var(--color-success)",
          };
        case "warning":
          return {
            backgroundColor:
              "color-mix(in srgb, var(--color-warning) 12%, transparent)",
            color: "var(--color-warning)",
          };
        default:
          return {};
      }
    };

    return (
      <span
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${className}`}
        style={getVariantStyle()}
        {...props}
      >
        {children}
      </span>
    );
  },
);

Badge.displayName = "Badge";
