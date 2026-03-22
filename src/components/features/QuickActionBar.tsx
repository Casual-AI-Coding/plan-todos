"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Trash2, Archive } from "lucide-react";
import type { Todo, Plan, Target } from "@/lib/types";

interface QuickActionBarProps {
  entityType: "todo" | "plan" | "target";
  entity: Todo | Plan | Target;
  onToggle?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  isVisible: boolean;
}

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
}

function ActionButton({
  icon,
  label,
  onClick,
  variant = "default",
}: ActionButtonProps) {
  const baseStyles =
    "p-1.5 rounded transition-colors duration-150 flex items-center justify-center";

  const variantStyles = {
    default:
      "hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)]",
    danger: "hover:bg-red-50 text-red-500",
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]}`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={label}
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export function QuickActionBar({
  entityType,
  entity,
  onToggle,
  onDelete,
  onArchive,
  isVisible,
}: QuickActionBarProps) {
  const getToggleLabel = () => {
    if (entityType === "todo") {
      return (entity as Todo).status === "done" ? "标记未完成" : "标记完成";
    }
    if (entityType === "plan") {
      return (entity as Plan).status === "archived" ? "取消归档" : "归档";
    }
    return "切换状态";
  };

  const actions: ActionButtonProps[] = [];

  // Toggle action
  if (onToggle && entityType === "todo") {
    actions.push({
      icon: <Check className="w-4 h-4" />,
      label: getToggleLabel(),
      onClick: onToggle,
    });
  }

  // Archive action
  if (onArchive && entityType === "plan") {
    actions.push({
      icon: <Archive className="w-4 h-4" />,
      label: getToggleLabel(),
      onClick: onArchive,
    });
  }

  // Delete action
  if (onDelete) {
    actions.push({
      icon: <Trash2 className="w-4 h-4" />,
      label: "删除",
      onClick: onDelete,
      variant: "danger",
    });
  }

  return (
    <AnimatePresence>
      {isVisible && actions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 10 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 10 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1 px-1 py-0.5 rounded-md shadow-sm"
          style={{
            backgroundColor: "var(--color-bg-card)",
            border: "1px solid var(--color-border)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {actions.map((action, index) => (
            <ActionButton key={index} {...action} />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
