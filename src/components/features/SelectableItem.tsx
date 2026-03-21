// src/components/features/SelectableItem.tsx
"use client";

import { useBatchSelect } from "@/hooks/useBatchSelect";
import { cn } from "@/lib/utils/cn";

interface SelectableItemProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectableItem({
  id,
  children,
  className,
}: SelectableItemProps) {
  const mode = useBatchSelect((s) => s.mode);
  const isSelected = useBatchSelect((s) => s.isSelected(id));
  const toggle = useBatchSelect((s) => s.toggle);

  if (!mode) {
    return <>{children}</>;
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggle(id);
        }}
        className={cn(
          "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
          isSelected
            ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
            : "border-[var(--color-border)] hover:border-[var(--color-primary)]",
        )}
        aria-label={isSelected ? "取消选择" : "选择"}
        aria-checked={isSelected}
        role="checkbox"
      >
        {isSelected && (
          <svg
            className="w-3 h-3 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
