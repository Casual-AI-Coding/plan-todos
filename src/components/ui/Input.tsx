"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--color-text)" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-2.5 border rounded-xl transition-all
            focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)]
            hover:border-[var(--color-primary)]/50
            placeholder:text-[var(--color-text-muted)]/60
            ${className}
          `}
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: error ? "var(--color-error)" : "var(--color-border)",
            color: "var(--color-text)",
            boxShadow: error
              ? "0 0 0 3px rgba(239, 68, 68, 0.1)"
              : "var(--shadow-xs, none)",
          }}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm" style={{ color: "var(--color-error)" }}>
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
