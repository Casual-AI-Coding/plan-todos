"use client";

import type { Tag } from "@/lib/types";

export interface TagBadgeProps {
  tag: Tag;
  selected?: boolean;
  onClick?: (tagId: string) => void;
  size?: "sm" | "md";
}

export function TagBadge({
  tag,
  selected = false,
  onClick,
  size = "sm",
}: TagBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
  };

  return (
    <button
      type="button"
      onClick={() => onClick?.(tag.id)}
      disabled={!onClick}
      className={`${sizeClasses[size]} rounded-full border transition-colors ${
        selected
          ? "border-teal-500 bg-teal-50 text-teal-700"
          : "border-gray-200 text-gray-600 hover:border-teal-300"
      } ${onClick ? "cursor-pointer" : "cursor-default"}`}
      style={
        selected
          ? {}
          : {
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              borderColor: tag.color,
            }
      }
    >
      {tag.name}
    </button>
  );
}

export interface TagBadgeListProps {
  tags: Tag[];
  selectedIds?: string[];
  onToggle?: (tagId: string) => void;
  size?: "sm" | "md";
}

export function TagBadgeList({
  tags,
  selectedIds = [],
  onToggle,
  size = "sm",
}: TagBadgeListProps) {
  if (tags.length === 0) {
    return <span className="text-sm text-gray-400">暂无标签</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <TagBadge
          key={tag.id}
          tag={tag}
          selected={selectedIds.includes(tag.id)}
          onClick={onToggle}
          size={size}
        />
      ))}
    </div>
  );
}
