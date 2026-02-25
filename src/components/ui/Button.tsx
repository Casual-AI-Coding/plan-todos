"use client";

import { ButtonHTMLAttributes, forwardRef, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onDrag" | "onDragStart" | "onDragEnd" | "onTransitionEnd"> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className = "",
      children,
      loading = false,
      icon,
      disabled,
      onClick,
      ...props
    },
    ref,
  ) => {
    const [ripples, setRipples] = useState<Ripple[]>([]);

    const createRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled || loading) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const newRipple: Ripple = {
        id: Date.now(),
        x,
        y,
        size,
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 600);
    }, [disabled, loading]);

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        createRipple(e);
        onClick?.(e);
      },
      [createRipple, onClick],
    );

    const baseStyles =
      "relative overflow-hidden inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const getVariantStyles = () => {
      switch (variant) {
        case "primary":
          return {
            backgroundColor: "var(--color-primary)",
            color: "var(--color-text-inverse)",
          };
        case "secondary":
          return {
            backgroundColor: "var(--color-bg-card)",
            border: "2px solid var(--color-border)",
            color: "var(--color-text)",
          };
        case "ghost":
          return {
            backgroundColor: "transparent",
            color: "var(--color-text)",
          };
        case "danger":
          return {
            backgroundColor: "var(--color-error)",
            color: "var(--color-text-inverse)",
          };
        default:
          return {};
      }
    };

    const sizeStyles = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <motion.button
        ref={ref}
        className={`${baseStyles} ${sizeStyles[size]} ${className}`}
        style={{
          ...getVariantStyles(),
        }}
        onClick={handleClick}
        disabled={disabled || loading}
        whileHover={{
          scale: disabled || loading ? 1 : 1.02,
          boxShadow:
            variant === "primary"
              ? "var(--shadow-md), var(--shadow-glow)"
              : "var(--shadow-md)",
          transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
        }}
        whileTap={{
          scale: disabled || loading ? 1 : 0.95,
          transition: { duration: 0.1 },
        }}
        {...(props as HTMLMotionProps<"button">)}
      >
        {loading ? (
          <motion.div
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}

        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ opacity: 0.5, scale: 0 }}
              animate={{ opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: "rgba(255, 255, 255, 0.4)",
                borderRadius: "50%",
              }}
            />
          ))}
        </AnimatePresence>
      </motion.button>
    );
  },
);

Button.displayName = "Button";
