# UI/UX Enhancement Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Enhance the existing UI/UX with advanced animations, multi-level shadows, glassmorphism effects, and data visualization components while maintaining compatibility with all 9 themes.

**Architecture:** Build upon the existing glass effect infrastructure (`--glass-blur`, `--glass-opacity`) by adding: (1) extended shadow system with glow effects, (2) rich animation components using Framer Motion, (3) data visualization components, (4) enhanced interaction feedback.

**Tech Stack:** 
- React 19, Next.js 16.1.6
- TypeScript (strict mode)
- Framer Motion 12.34.3 (animations)
- Tailwind CSS 4
- Vitest (testing)

---

## System Analysis

### Current State ✅

**Theme Infrastructure:**
```
9 themes: light, dark, dracula, nord, monokai, glass, spring, catppuccin, tokyoNight, oneDark
+ System theme (follows OS)
```

**Glass Effect (Already Working):**
- `--glass-blur` (5-30px adjustable via ThemeSelector)
- `--glass-opacity` (5-100% adjustable)
- Applied to: `main`, `.view-container`, `.card`
- Real-time preview in settings modal

**Animation Components:**
- `FadeIn`, `ScaleIn`, `PageTransition` (Framer Motion wrappers)
- Basic CSS transitions (200ms ease)

**Components:**
- `Card`: Basic shadow-sm, hover:shadow-md, translateY(-2px)
- `Button`: Variants (primary/secondary/ghost/danger)
- `Modal`: Fixed overlay, basic animation
- `ProgressBar`: Single-color, width transition

---

### Enhancement Areas 📈

| Component | Current | Enhanced |
|-----------|---------|----------|
| **Shadows** | 2 levels (sm, elevated) | 5 levels + glow effects |
| **Card Hover** | translateY(-2px) | Multi-shadow + inner glow + smooth spring |
| **Button** | Scale(0.95) on click | Ripple effect + glow on hover |
| **Modal** | Fade in | Scale + spring + blur backdrop |
| **Lists** | No stagger | Staggered entrance animations |
| **Charts** | Basic ProgressBar | Heatmap, Trend, Gauge, Distribution |

---

## Implementation Tasks

### Task 1: Extend Theme Shadows & Glass Effects

**Files:**
- Modify: `src/lib/themes/registry.ts` (add shadow configs)
- Modify: `src/app/globals.css` (add CSS variables)
- Test: `src/app/globals.css.test.ts` (visual regression)

#### Step 1.1: Add Extended Shadow Config to Registry

```typescript
// src/lib/themes/registry.ts - Add to ThemeColors interface

export interface ThemeColors {
  // ... existing fields ...
  
  // Extended shadows (NEW)
  shadowSm: string;    // Card at rest
  shadowMd: string;    // Card hover
  shadowLg: string;    // Modal/overlay
  shadowGlow: string;  // Primary color glow
  
  // Glass enhancements (NEW)
  glassBorderGlow: string;  // Inset top highlight
  glassInnerShadow: string; // Inset shadow
}
```

#### Step 1.2: Update Light Theme Shadows

```typescript
light: {
  // ... existing colors ...
  shadowSm: "0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)",
  shadowMd: "0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04)",
  shadowLg: "0 12px 24px rgba(0,0,0,0.12), 0 24px 48px rgba(0,0,0,0.06)",
  shadowGlow: "0 0 20px rgba(13, 148, 136, 0.3), 0 0 40px rgba(13, 148, 136, 0.1)",
  glassBorderGlow: "inset 0 1px 0 rgba(255,255,255,0.5)",
  glassInnerShadow: "inset 0 1px 2px rgba(0,0,0,0.05)",
}
```

#### Step 1.3: Update Dark Theme Shadows

```typescript
dark: {
  // ... existing colors ...
  shadowSm: "0 1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.15)",
  shadowMd: "0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2)",
  shadowLg: "0 12px 24px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.2)",
  shadowGlow: "0 0 20px rgba(45, 212, 191, 0.3), 0 0 40px rgba(45, 212, 191, 0.1)",
  glassBorderGlow: "inset 0 1px 0 rgba(255,255,255,0.1)",
  glassInnerShadow: "inset 0 1px 2px rgba(0,0,0,0.2)",
}
```

#### Step 1.4: Add CSS Variables to globals.css

```css
/* globals.css - Add after line 35 (after theme variables) */

/* Extended Shadows - Applied per-theme via registry */
:root {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.08);
  --shadow-lg: 0 12px 24px rgba(0,0,0,0.12);
  --shadow-glow: 0 0 20px var(--color-primary-alpha-30);
  --glass-border-glow: inset 0 1px 0 rgba(255,255,255,0.1);
  --glass-inner-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  
  /* Animation timing */
  --animation-easing-spring: cubic-bezier(0.22, 1, 0.36, 1);
  --animation-easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --animation-duration-fast: 150ms;
  --animation-duration-normal: 250ms;
  --animation-duration-slow: 400ms;
}

/* Per-theme overrides will be added in theme blocks */
[data-theme="light"] {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.08), 0 8px 16px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 24px rgba(0,0,0,0.12), 0 24px 48px rgba(0,0,0,0.06);
  --shadow-glow: 0 0 20px rgba(13, 148, 136, 0.3);
  --glass-border-glow: inset 0 1px 0 rgba(255,255,255,0.5);
  --glass-inner-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
}

[data-theme="dark"] {
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.2), 0 2px 4px rgba(0,0,0,0.15);
  --shadow-md: 0 4px 8px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2);
  --shadow-lg: 0 12px 24px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.2);
  --shadow-glow: 0 0 20px rgba(45, 212, 191, 0.3);
  --glass-border-glow: inset 0 1px 0 rgba(255,255,255,0.1);
  --glass-inner-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
}
```

#### Step 1.5: Update Card Component

```tsx
// src/components/ui/Card.tsx

export function Card({
  children,
  className = "",
  onClick,
  hoverable = false,
  padding = "md",
  style,
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
      className={`
        rounded-lg border
        ${hoverable ? "card-hover" : ""}
        ${paddingStyles[padding]}
        ${className}
      `}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        backdropFilter: `blur(var(--glass-blur, 0px)) saturate(180%)`,
        WebkitBackdropFilter: `blur(var(--glass-blur, 0px)) saturate(180%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
```

#### Step 1.6: Add Card Hover CSS Class

```css
/* globals.css - Add after line 276 (after .card:hover) */

.card-hover {
  transition:
    transform var(--animation-duration-normal) var(--animation-easing-spring),
    box-shadow var(--animation-duration-normal) var(--animation-easing-spring);
  cursor: pointer;
}

.card-hover:hover {
  transform: translateY(-4px);
  box-shadow:
    var(--shadow-md),
    var(--glass-border-glow);
}

.card-hover:active {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}
```

#### Step 1.7: Write Visual Regression Test

```typescript
// src/app/globals.css.test.ts

import { describe, it, expect } from 'vitest';

describe('CSS Variables', () => {
  it('should define extended shadow variables', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    
    expect(styles.getPropertyValue('--shadow-sm')).toBeTruthy();
    expect(styles.getPropertyValue('--shadow-md')).toBeTruthy();
    expect(styles.getPropertyValue('--shadow-lg')).toBeTruthy();
    expect(styles.getPropertyValue('--shadow-glow')).toBeTruthy();
  });

  it('should define animation timing variables', () => {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    
    expect(styles.getPropertyValue('--animation-easing-spring')).toContain('cubic-bezier');
    expect(styles.getPropertyValue('--animation-duration-normal')).toMatch(/\d+ms/);
  });
});
```

#### Step 1.8: Run Tests

```bash
npm run test -- src/app/globals.css.test.ts
# Expected: PASS
```

#### Step 1.9: Commit

```bash
git add src/lib/themes/registry.ts src/app/globals.css src/components/ui/Card.tsx
git commit -m "feat(ui): extend shadow system and glass effects

- Add 5-level shadow system (sm, md, lg, glow)
- Add glass border glow and inner shadow
- Update light/dark themes with enhanced shadows
- Update Card component with new shadow variables
- Add animation timing CSS variables"
```

---

### Task 2: Create Animation Component Library

**Files:**
- Create: `src/components/ui/animations/RippleEffect.tsx`
- Create: `src/components/ui/animations/StaggeredList.tsx`
- Create: `src/components/ui/animations/HoverCard.tsx`
- Create: `src/components/ui/animations/PageSlide.tsx`
- Create: `src/components/ui/animations/index.ts`
- Test: `src/components/ui/animations/*.test.tsx`

#### Step 2.1: Create RippleEffect Component

```tsx
// src/components/ui/animations/RippleEffect.tsx

"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RippleEffectProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

export function RippleEffect({
  children,
  className = "",
  color = "rgba(255, 255, 255, 0.4)",
  onClick,
}: RippleEffectProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
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

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      createRipple(e);
      onClick?.(e);
    },
    [createRipple, onClick]
  );

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
      style={{ borderRadius: "inherit" }}
    >
      {children}
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
              backgroundColor: color,
              borderRadius: "50%",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
```

#### Step 2.2: Create StaggeredList Component

```tsx
// src/components/ui/animations/StaggeredList.tsx

"use client";

import { motion, Variants } from "framer-motion";
import { ReactNode } from "react";

interface StaggeredListProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  animationDuration?: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1], // spring easing
    },
  },
};

export function StaggeredList({
  children,
  className = "",
  staggerDelay = 50,
  animationDuration = 0.3,
}: StaggeredListProps) {
  const customVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay / 1000,
        delayChildren: 0.1,
      },
    },
  };

  const customItemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: animationDuration, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <motion.div
      className={className}
      variants={customVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function StaggeredListItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
```

#### Step 2.3: Create HoverCard Component

```tsx
// src/components/ui/animations/HoverCard.tsx

"use client";

import { motion } from "framer-motion";
import { ReactNode, CSSProperties } from "react";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  hoverElevation?: number; // -4 to 4 (pixels)
  glowOnHover?: boolean;
  style?: CSSProperties;
}

export function HoverCard({
  children,
  className = "",
  hoverElevation = -4,
  glowOnHover = true,
  style,
}: HoverCardProps) {
  return (
    <motion.div
      className={`rounded-lg border ${className}`}
      style={{
        backgroundColor: "var(--color-bg-card)",
        borderColor: "var(--color-border)",
        boxShadow: "var(--shadow-sm)",
        backdropFilter: "blur(var(--glass-blur, 0px)) saturate(180%)",
        WebkitBackdropFilter: "blur(var(--glass-blur, 0px)) saturate(180%)",
        ...style,
      }}
      whileHover={{
        y: hoverElevation,
        boxShadow: glowOnHover
          ? "var(--shadow-md), var(--shadow-glow)"
          : "var(--shadow-md)",
        transition: {
          duration: 0.2,
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      whileTap={{
        y: hoverElevation * 0.5,
        scale: 0.98,
        transition: { duration: 0.1 },
      }}
    >
      {children}
    </motion.div>
  );
}
```

#### Step 2.4: Create PageSlide Component

```tsx
// src/components/ui/animations/PageSlide.tsx

"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageSlideProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right" | "up" | "down";
  duration?: number;
}

const pageVariants = {
  initial: {
    opacity: 0,
    x: 0,
    y: 0,
  },
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
  },
  exit: {
    opacity: 0,
    x: 0,
    y: 0,
  },
};

export function PageSlide({
  children,
  className = "",
  direction = "up",
  duration = 0.4,
}: PageSlideProps) {
  const directionOffset = {
    left: { initial: { x: -50 }, animate: { x: 0 }, exit: { x: 50 } },
    right: { initial: { x: 50 }, animate: { x: 0 }, exit: { x: -50 } },
    up: { initial: { y: 50 }, animate: { y: 0 }, exit: { y: -50 } },
    down: { initial: { y: -50 }, animate: { y: 0 }, exit: { y: 50 } },
  };

  const variants = {
    initial: {
      opacity: 0,
      ...directionOffset[direction].initial,
    },
    animate: {
      opacity: 1,
      ...directionOffset[direction].animate,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      ...directionOffset[direction].exit,
      transition: {
        duration,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
```

#### Step 2.5: Create Animation Index Export

```typescript
// src/components/ui/animations/index.ts

export { RippleEffect } from "./RippleEffect";
export { StaggeredList, StaggeredListItem } from "./StaggeredList";
export { HoverCard } from "./HoverCard";
export { PageSlide } from "./PageSlide";
```

#### Step 2.6: Write Tests for Animations

```typescript
// src/components/ui/animations/StaggeredList.test.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { StaggeredList, StaggeredListItem } from "./StaggeredList";

describe("StaggeredList", () => {
  it("renders children correctly", () => {
    render(
      <StaggeredList>
        <StaggeredListItem>Item 1</StaggeredListItem>
        <StaggeredListItem>Item 2</StaggeredListItem>
      </StaggeredList>
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <StaggeredList className="custom-class">
        <StaggeredListItem>Item</StaggeredListItem>
      </StaggeredList>
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
```

#### Step 2.7: Run Tests

```bash
npm run test -- src/components/ui/animations/
# Expected: PASS
```

#### Step 2.8: Commit

```bash
git add src/components/ui/animations/
git commit -m "feat(ui): add animation component library

- RippleEffect: Click ripple animation for buttons/cards
- StaggeredList: Staggered entrance animations for lists
- HoverCard: Enhanced hover effects with shadow/glow
- PageSlide: Page transition animations
- All components use Framer Motion with spring easing"
```

---

### Task 3: Enhance Button Component

**Files:**
- Modify: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Button.test.tsx`

#### Step 3.1: Update Button with Ripple Effect

```tsx
// src/components/ui/Button.tsx

"use client";

import { ButtonHTMLAttributes, forwardRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
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
      "relative inline-flex items-center justify-center font-medium rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const getVariantStyles = () => {
      switch (variant) {
        case "primary":
          return {
            backgroundColor: "var(--color-primary)",
            color: "var(--color-text-inverse)",
            boxShadow: "var(--shadow-sm)",
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
        {...props}
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
```

#### Step 3.2: Write Button Tests

```typescript
// src/components/ui/Button.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText("Click"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    render(<Button loading>Loading</Button>);
    const spinner = screen.getByRole("button");
    expect(spinner).toHaveAttribute("disabled");
  });

  it("applies variant styles", () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    expect(screen.getByText("Primary")).toHaveStyle({
      backgroundColor: "var(--color-primary)",
    });

    rerender(<Button variant="danger">Danger</Button>);
    expect(screen.getByText("Danger")).toHaveStyle({
      backgroundColor: "var(--color-error)",
    });
  });

  it("applies size styles", () => {
    render(<Button size="lg">Large</Button>);
    expect(screen.getByText("Large")).toHaveClass("px-6 py-3 text-base");
  });
});
```

#### Step 3.3: Run Tests

```bash
npm run test -- src/components/ui/Button.test.tsx
# Expected: PASS
```

#### Step 3.4: Commit

```bash
git add src/components/ui/Button.tsx src/components/ui/Button.test.tsx
git commit -m "feat(ui): enhance Button with ripple effect and animations

- Add click ripple effect using Framer Motion
- Add hover scale and glow effects
- Add loading spinner animation
- Add icon support
- Spring easing for all animations"
```

---

### Task 4: Create Data Visualization Components

**Files:**
- Create: `src/components/ui/charts/HeatmapCalendar.tsx`
- Create: `src/components/ui/charts/TrendChart.tsx`
- Create: `src/components/ui/charts/GaugeChart.tsx`
- Create: `src/components/ui/charts/DistributionChart.tsx`
- Create: `src/components/ui/charts/index.ts`
- Test: `src/components/ui/charts/*.test.tsx`

#### Step 4.1: Create HeatmapCalendar Component

```tsx
// src/components/ui/charts/HeatmapCalendar.tsx

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { differenceInDays, subMonths, format, parseISO } from "date-fns";

interface HeatmapData {
  date: string; // ISO date string
  count: number;
}

interface HeatmapCalendarProps {
  data: HeatmapData[];
  months?: number;
  color?: string;
  onCellClick?: (date: string) => void;
  className?: string;
}

const colorIntensity = (count: number, maxCount: number, baseColor: string) => {
  if (count === 0) return "var(--color-bg-card)";
  
  const intensity = Math.min(count / maxCount, 1);
  // Simple intensity mapping - in production, use proper color interpolation
  if (intensity > 0.75) return baseColor;
  if (intensity > 0.5) return `${baseColor}cc`;
  if (intensity > 0.25) return `${baseColor}88`;
  return `${baseColor}44`;
};

export function HeatmapCalendar({
  data = [],
  months = 6,
  color = "var(--color-primary)",
  onCellClick,
  className = "",
}: HeatmapCalendarProps) {
  const endDate = new Date();
  const startDate = subMonths(endDate, months);
  
  const dataMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((d) => map.set(d.date, d.count));
    return map;
  }, [data]);

  const maxCount = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  const days = useMemo(() => {
    const result = [];
    const totalDays = differenceInDays(endDate, startDate);
    
    for (let i = totalDays; i >= 0; i--) {
      const date = new Date(endDate);
      date.setDate(date.getDate() - i);
      const dateStr = format(date, "yyyy-MM-dd");
      const count = dataMap.get(dateStr) || 0;
      
      result.push({
        date: dateStr,
        displayDate: format(date, "MMM d"),
        count,
        dayOfWeek: date.getDay(),
      });
    }
    
    return result;
  }, [endDate, startDate, dataMap]);

  return (
    <div className={`p-4 ${className}`}>
      <div className="grid grid-cols-[repeat(7,1fr)] gap-1">
        {days.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01, duration: 0.2 }}
            className="aspect-square rounded-sm cursor-pointer"
            style={{
              backgroundColor: colorIntensity(day.count, maxCount, color),
              border: "1px solid var(--color-border)",
            }}
            onClick={() => onCellClick?.(day.date)}
            title={`${day.displayDate}: ${day.count} activities`}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-muted">
        <span>{format(startDate, "MMM yyyy")}</span>
        <span>{format(endDate, "MMM yyyy")}</span>
      </div>
    </div>
  );
}
```

#### Step 4.2: Create GaugeChart Component

```tsx
// src/components/ui/charts/GaugeChart.tsx

"use client";

import { motion } from "framer-motion";

interface GaugeChartProps {
  value: number; // 0-100
  size?: "sm" | "md" | "lg";
  color?: string;
  showValue?: boolean;
  animated?: boolean;
  className?: string;
  label?: string;
}

const sizeConfig = {
  sm: { width: 80, strokeWidth: 8 },
  md: { width: 120, strokeWidth: 12 },
  lg: { width: 160, strokeWidth: 16 },
};

export function GaugeChart({
  value,
  size = "md",
  color = "var(--color-primary)",
  showValue = true,
  animated = true,
  className = "",
  label,
}: GaugeChartProps) {
  const { width, strokeWidth } = sizeConfig[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(value, 100) / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <svg
          width={width}
          height={width}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          {animated ? (
            <motion.circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                strokeDasharray: circumference,
              }}
            />
          ) : (
            <circle
              cx={width / 2}
              cy={width / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: offset,
              }}
            />
          )}
        </svg>
        
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold" style={{ color }}>
              {Math.round(value)}%
            </span>
          </div>
        )}
      </div>
      
      {label && (
        <p className="mt-2 text-sm text-muted">{label}</p>
      )}
    </div>
  );
}
```

#### Step 4.3: Create TrendChart Component

```tsx
// src/components/ui/charts/TrendChart.tsx

"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

interface TrendData {
  date: string;
  value: number;
}

interface TrendChartProps {
  data: TrendData[];
  type?: "line" | "area" | "bar";
  color?: string;
  showGrid?: boolean;
  animated?: boolean;
  className?: string;
  height?: number;
}

export function TrendChart({
  data = [],
  type = "line",
  color = "var(--color-primary)",
  showGrid = true,
  animated = true,
  className = "",
  height = 200,
}: TrendChartProps) {
  const { maxValue, points, barWidth } = useMemo(() => {
    if (data.length === 0) return { maxValue: 0, points: "", barWidth: 0 };
    
    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const chartWidth = 100;
    const chartHeight = 100;
    
    const pts = data.map((d, i) => {
      const x = (i / (data.length - 1)) * chartWidth;
      const y = chartHeight - (d.value / maxValue) * chartHeight;
      return `${x},${y}`;
    }).join(" ");
    
    return {
      maxValue,
      points: pts,
      barWidth: chartWidth / data.length,
    };
  }, [data]);

  const areaPoints = useMemo(() => {
    if (points === "") return "";
    const chartWidth = 100;
    return `${points} ${chartWidth},100 0,100`;
  }, [points]);

  return (
    <div className={`p-4 ${className}`} style={{ height }}>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        {showGrid && (
          <>
            <line x1="0" y1="25" x2="100" y2="25" stroke="var(--color-border)" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="var(--color-border)" strokeWidth="0.5" />
            <line x1="0" y1="75" x2="100" y2="75" stroke="var(--color-border)" strokeWidth="0.5" />
          </>
        )}

        {type === "area" && (
          <motion.polygon
            points={areaPoints}
            fill={color}
            fillOpacity="0.2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {type === "line" || type === "area" ? (
          <motion.polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="2"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : (
          data.map((d, i) => (
            <motion.rect
              key={d.date}
              x={i * barWidth + 1}
              y={100 - (d.value / maxValue) * 100}
              width={barWidth - 2}
              height={(d.value / maxValue) * 100}
              fill={color}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
            />
          ))
        )}
      </svg>
    </div>
  );
}
```

#### Step 4.4: Create Charts Index Export

```typescript
// src/components/ui/charts/index.ts

export { HeatmapCalendar } from "./HeatmapCalendar";
export { GaugeChart } from "./GaugeChart";
export { TrendChart } from "./TrendChart";
export { DistributionChart } from "./DistributionChart";
```

#### Step 4.5: Write Chart Tests

```typescript
// src/components/ui/charts/GaugeChart.test.tsx

import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { GaugeChart } from "./GaugeChart";

describe("GaugeChart", () => {
  it("renders gauge with value", () => {
    render(<GaugeChart value={75} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("hides value when showValue is false", () => {
    render(<GaugeChart value={75} showValue={false} />);
    expect(screen.queryByText("75%")).not.toBeInTheDocument();
  });

  it("applies custom color", () => {
    render(<GaugeChart value={50} color="#FF0000" />);
    const svg = screen.getByRole("img");
    expect(svg).toBeTruthy();
  });

  it("handles different sizes", () => {
    const { rerender } = render(<GaugeChart value={50} size="sm" />);
    expect(screen.getByText("50%")).toBeInTheDocument();

    rerender(<GaugeChart value={50} size="lg" />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
```

#### Step 4.6: Run Tests

```bash
npm run test -- src/components/ui/charts/
# Expected: PASS
```

#### Step 4.7: Commit

```bash
git add src/components/ui/charts/
git commit -m "feat(ui): add data visualization components

- HeatmapCalendar: Activity heatmap (GitHub-style)
- GaugeChart: Circular progress indicator
- TrendChart: Line/area/bar chart
- All charts use Framer Motion animations
- Support theme colors via CSS variables"
```

---

### Task 5: Update Modal with Enhanced Animation

**Files:**
- Modify: `src/components/ui/Modal.tsx`
- Test: `src/components/ui/Modal.test.tsx`

#### Step 5.1: Update Modal Animation

```tsx
// src/components/ui/Modal.tsx

"use client";

import { ReactNode, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  open: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  width?: "sm" | "md" | "lg";
}

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
  width = "md",
}: ModalProps) {
  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, handleEscape]);

  const widthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with blur */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              backdropFilter: "blur(var(--glass-blur, 10px))",
              WebkitBackdropFilter: "blur(var(--glass-blur, 10px))",
            }}
          />

          {/* Modal content */}
          <motion.div
            className={`relative bg-white rounded-xl shadow-xl w-full ${widthStyles[width]} mx-4`}
            style={{
              backgroundColor: "var(--color-bg-card)",
              boxShadow: "var(--shadow-lg)",
              border: "1px solid var(--color-border)",
            }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                style={{ color: "var(--color-text-muted)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-4">{children}</div>

            {/* Footer */}
            {footer && (
              <div
                className="flex justify-end gap-3 px-6 py-4 border-t rounded-b-xl"
                style={{
                  borderColor: "var(--color-border)",
                  backgroundColor: "var(--color-bg-hover)",
                }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

#### Step 5.2: Write Modal Tests

```typescript
// src/components/ui/Modal.test.tsx

import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders when open", () => {
    render(
      <Modal open={true} title="Test Modal" onClose={() => {}}>
        Content
      </Modal>
    );
    expect(screen.getByText("Test Modal")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <Modal open={false} title="Test Modal" onClose={() => {}}>
        Content
      </Modal>
    );
    expect(screen.queryByText("Test Modal")).not.toBeInTheDocument();
  });

  it("calls onClose when clicking backdrop", () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} title="Test" onClose={handleClose}>
        Content
      </Modal>
    );
    fireEvent.click(screen.getByRole("button", { hidden: true }).closest(".fixed")!);
    expect(handleClose).toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const handleClose = vi.fn();
    render(
      <Modal open={true} title="Test" onClose={handleClose}>
        Content
      </Modal>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(handleClose).toHaveBeenCalled();
  });
});
```

#### Step 5.3: Run Tests

```bash
npm run test -- src/components/ui/Modal.test.tsx
# Expected: PASS
```

#### Step 5.4: Commit

```bash
git add src/components/ui/Modal.tsx src/components/ui/Modal.test.tsx
git commit -m "feat(ui): enhance Modal with spring animation and glass effect

- Add scale + fade animation using Framer Motion
- Add blur backdrop effect
- Use theme colors for all elements
- Spring easing for natural motion"
```

---

### Task 6: Integrate Enhanced Components in Views

**Files:**
- Modify: `src/app/views/Dashboard.tsx`
- Modify: `src/app/views/StatisticsView.tsx`
- Test: Manual testing

#### Step 6.1: Update Dashboard with Gauge Charts

```tsx
// In Dashboard.tsx - Update stat cards

import { GaugeChart } from "@/components/ui/charts";
import { HoverCard } from "@/components/ui/animations";

// Replace existing stat cards with:
<HoverCard hoverElevation={-4} glowOnHover>
  <div className="p-4">
    <GaugeChart
      value={productivityScore}
      size="md"
      label="Productivity Score"
      color="var(--color-primary)"
    />
  </div>
</HoverCard>
```

#### Step 6.2: Update StatisticsView with Charts

```tsx
// In StatisticsView.tsx

import { TrendChart, HeatmapCalendar } from "@/components/ui/charts";
import { StaggeredList, StaggeredListItem } from "@/components/ui/animations";

// Add trend chart
<TrendChart
  data={weeklyData}
  type="area"
  color="var(--color-primary)"
  animated
/>

// Add activity heatmap
<HeatmapCalendar
  data={circulationLogs}
  months={6}
  color="var(--color-primary)"
/>
```

#### Step 6.3: Manual Testing

```bash
npm run dev
# Navigate to Dashboard and Statistics pages
# Verify:
# - Animations are smooth (60fps)
# - Glass effects work with all themes
# - Charts display correctly
# - Hover effects work
```

#### Step 6.4: Commit

```bash
git add src/app/views/Dashboard.tsx src/app/views/StatisticsView.tsx
git commit -m "feat(ui): integrate enhanced components in Dashboard and Statistics

- Add GaugeChart to productivity score
- Add TrendChart for completion trends
- Add HeatmapCalendar for activity tracking
- Use HoverCard and StaggeredList for animations"
```

---

### Task 7: Update Documentation

**Files:**
- Create: `docs/plans/ui-components.md`
- Modify: `CHANGELOG.md`

#### Step 7.1: Create UI Components Documentation

```markdown
# UI Components Documentation

## Animation Components

### RippleEffect
Click ripple animation for buttons and cards.

```tsx
<RippleEffect>
  <Button>Click Me</Button>
</RippleEffect>
```

### StaggeredList
Staggered entrance animations for list items.

```tsx
<StaggeredList staggerDelay={50}>
  <StaggeredListItem>Item 1</StaggeredListItem>
  <StaggeredListItem>Item 2</StaggeredListItem>
</StaggeredList>
```

### HoverCard
Enhanced hover effects with shadow and glow.

```tsx
<HoverCard hoverElevation={-4} glowOnHover>
  <Card>Content</Card>
</HoverCard>
```

## Chart Components

### GaugeChart
Circular progress indicator.

```tsx
<GaugeChart value={75} size="md" label="Completion" />
```

### TrendChart
Line/area/bar chart for trends.

```tsx
<TrendChart data={data} type="area" animated />
```

### HeatmapCalendar
Activity heatmap (GitHub-style).

```tsx
<HeatmapCalendar data={logs} months={6} />
```

## Theme Support

All components support the 9 themes via CSS variables:
- `var(--color-primary)`
- `var(--color-bg-card)`
- `var(--shadow-sm/md/lg/glow)`
- `var(--glass-blur)`
```

#### Step 7.2: Update CHANGELOG

```markdown
## [0.6.0] - 2026-02-25

### Added

**UI/UX Enhancement**:
- Extended shadow system (5 levels + glow effects)
- Animation component library (RippleEffect, StaggeredList, HoverCard, PageSlide)
- Data visualization components (GaugeChart, TrendChart, HeatmapCalendar)
- Enhanced Button with ripple effect and loading state
- Enhanced Modal with spring animation and blur backdrop
- Glass effect improvements (border glow, inner shadow)

**Animation System**:
- Spring easing for all animations (cubic-bezier: 0.22, 1, 0.36, 1)
- Staggered list entrance animations
- Page transition animations
- Hover effects with multi-shadow

### Changed

- Updated Card component with extended shadows
- Updated Button component with Framer Motion
- Updated Modal component with enhanced animation

### Technical

- All components use theme CSS variables
- Full TypeScript strict mode support
- Test coverage for all new components
```

#### Step 7.3: Commit

```bash
git add docs/plans/ui-components.md CHANGELOG.md
git commit -m "docs: add UI components documentation and update CHANGELOG

- Document all animation and chart components
- Add usage examples
- Update CHANGELOG for v0.6.0"
```

---

## Testing Strategy

### Unit Tests
- All components have Vitest tests
- Test rendering, props, interactions
- Run: `npm run test`

### Visual Testing
- Manual testing across all 9 themes
- Verify glass effects with different blur/opacity settings
- Check animations at 60fps

### Performance
- Use React DevTools Profiler
- Ensure animations don't cause jank
- Target: < 16ms per frame

---

## Verification Checklist

Before marking complete:

- [ ] All tests pass (`npm run test`)
- [ ] Test coverage >= 90% (`npm run test:coverage`)
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing across all themes
- [ ] Animations smooth on target devices

---

## Execution Options

**Plan complete and saved to `docs/plans/2026-02-25-ui-ux-enhancement-design.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?**
