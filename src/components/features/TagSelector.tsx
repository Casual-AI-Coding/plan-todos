"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tag, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Tag as TagType } from "@/lib/types";

interface TagSelectorProps {
  tags: TagType[];
  selectedTagIds: string[];
  onAddTag: (tagId: string) => void;
  onRemoveTag: (tagId: string) => void;
  onCreateTag?: (name: string, color: string) => Promise<TagType>;
  isLoading?: boolean;
}

const PRESET_COLORS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Purple
  "#85C1E9", // Sky
];

export function TagSelector({
  tags,
  selectedTagIds,
  onAddTag,
  onRemoveTag,
  onCreateTag,
  isLoading = false,
}: TagSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(PRESET_COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleTagClick = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onRemoveTag(tagId);
    } else {
      onAddTag(tagId);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;

    setIsCreating(true);
    try {
      const tag = await onCreateTag(newTagName.trim(), newTagColor);
      onAddTag(tag.id);
      setNewTagName("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create tag:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        icon={<Tag className="w-4 h-4" />}
      >
        管理标签
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 w-64 rounded-lg shadow-lg z-50"
            style={{
              backgroundColor: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}
          >
            <div className="p-2">
              <div className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                选择标签
              </div>

              {/* Tag list */}
              <div className="max-h-48 overflow-y-auto space-y-1">
                {tags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => handleTagClick(tag.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left hover:bg-[var(--color-bg-hover)] transition-colors"
                    >
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 truncate">{tag.name}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}

                {tags.length === 0 && (
                  <div className="text-sm text-[var(--color-text-secondary)] py-2 text-center">
                    暂无标签
                  </div>
                )}
              </div>

              {/* Create new tag */}
              {onCreateTag && (
                <>
                  <div
                    className="my-2 h-px"
                    style={{ backgroundColor: "var(--color-border)" }}
                  />

                  {showCreateForm ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="标签名称"
                        className="w-full px-2 py-1.5 text-sm rounded border"
                        style={{
                          backgroundColor: "var(--color-bg)",
                          borderColor: "var(--color-border)",
                          color: "var(--color-text)",
                        }}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateTag();
                          if (e.key === "Escape") setShowCreateForm(false);
                        }}
                      />

                      {/* Color picker */}
                      <div className="flex flex-wrap gap-1">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewTagColor(color)}
                            className="w-5 h-5 rounded-full border-2 transition-transform"
                            style={{
                              backgroundColor: color,
                              borderColor:
                                newTagColor === color
                                  ? "var(--color-text)"
                                  : "transparent",
                              transform:
                                newTagColor === color
                                  ? "scale(1.1)"
                                  : "scale(1)",
                            }}
                          />
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={handleCreateTag}
                          disabled={!newTagName.trim() || isCreating}
                          className="flex-1"
                        >
                          {isCreating ? "创建中..." : "创建"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setShowCreateForm(false);
                            setNewTagName("");
                          }}
                        >
                          取消
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(true)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left hover:bg-[var(--color-bg-hover)] transition-colors text-[var(--color-primary)]"
                    >
                      <Plus className="w-4 h-4" />
                      创建新标签
                    </button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
