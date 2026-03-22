"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// Context
// ============================================================================

interface ContextMenuContextValue {
  isOpen: boolean;
  position: { x: number; y: number };
  open: (x: number, y: number) => void;
  close: () => void;
}

const ContextMenuContext = createContext<ContextMenuContextValue | null>(null);

function useContextMenu() {
  const context = useContext(ContextMenuContext);
  if (!context) {
    throw new Error(
      "useContextMenu must be used within a ContextMenu provider",
    );
  }
  return context;
}

// ============================================================================
// ContextMenu Root
// ============================================================================

interface ContextMenuProps {
  children: ReactNode;
}

export function ContextMenu({ children }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const open = useCallback((x: number, y: number) => {
    setPosition({ x, y });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, close]);

  return (
    <ContextMenuContext.Provider value={{ isOpen, position, open, close }}>
      {children}
    </ContextMenuContext.Provider>
  );
}

// ============================================================================
// ContextMenu Trigger
// ============================================================================

interface ContextMenuTriggerProps {
  children: ReactNode;
}

export function ContextMenuTrigger({ children }: ContextMenuTriggerProps) {
  const { open, close } = useContextMenu();

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      open(e.clientX, e.clientY);
    },
    [open],
  );

  // Close on click outside
  useEffect(() => {
    const handleClick = () => close();
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [close]);

  return (
    <div onContextMenu={handleContextMenu} className="contents">
      {children}
    </div>
  );
}

// ============================================================================
// ContextMenu Content
// ============================================================================

interface ContextMenuContentProps {
  children: ReactNode;
  className?: string;
}

export function ContextMenuContent({
  children,
  className = "",
}: ContextMenuContentProps) {
  const { isOpen, position } = useContextMenu();
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={contentRef}
          className={`fixed z-50 min-w-[160px] py-1 shadow-lg rounded-lg ${className}`}
          style={{
            left: Math.min(position.x, window.innerWidth - 180),
            top: Math.min(position.y, window.innerHeight - 200),
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// ContextMenu Item
// ============================================================================

interface ContextMenuItemProps {
  children: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
  onClick?: () => void;
}

export function ContextMenuItem({
  children,
  icon,
  variant = "default",
  disabled = false,
  onClick,
}: ContextMenuItemProps) {
  const { close } = useContextMenu();

  const handleClick = useCallback(() => {
    if (disabled) return;
    onClick?.();
    close();
  }, [disabled, onClick, close]);

  const baseStyles =
    "flex items-center gap-2 w-full px-3 py-2 text-sm text-left transition-colors duration-150 cursor-pointer";

  const variantStyles =
    variant === "danger"
      ? "hover:bg-red-50 active:bg-red-100 text-red-600"
      : "hover:bg-gray-100 active:bg-gray-200 text-gray-900";

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles} ${disabledStyles}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}

// ============================================================================
// ContextMenu Separator
// ============================================================================

export function ContextMenuSeparator() {
  return (
    <div
      className="my-1 h-px w-full"
      style={{ backgroundColor: "var(--color-border)" }}
    />
  );
}

// ============================================================================
// ContextMenu Label
// ============================================================================

interface ContextMenuLabelProps {
  children: ReactNode;
}

export function ContextMenuLabel({ children }: ContextMenuLabelProps) {
  return (
    <div className="px-3 py-1.5 text-xs text-[var(--color-text-secondary)] font-medium">
      {children}
    </div>
  );
}
