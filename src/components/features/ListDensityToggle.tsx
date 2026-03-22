"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useListDensity, type ListDensity } from "@/stores/listDensity";

const DENSITY_OPTIONS: {
  value: ListDensity;
  label: string;
  description: string;
}[] = [
  { value: "compact", label: "紧凑", description: "更小的间距，显示更多内容" },
  { value: "standard", label: "标准", description: "平衡的间距和可读性" },
  { value: "comfortable", label: "舒适", description: "更大的间距，更易阅读" },
];

export function ListDensityToggle() {
  const { density, setDensity } = useListDensity();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        <span>{DENSITY_OPTIONS.find((o) => o.value === density)?.label}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-1 w-48 rounded-lg shadow-lg z-50 py-1"
              style={{
                backgroundColor: "var(--color-bg-card)",
                border: "1px solid var(--color-border)",
              }}
            >
              {DENSITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setDensity(option.value);
                    setIsOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left transition-colors"
                  style={{
                    backgroundColor:
                      density === option.value
                        ? "var(--color-bg-hover)"
                        : "transparent",
                    color: "var(--color-text)",
                  }}
                >
                  <div className="text-sm font-medium">{option.label}</div>
                  <div
                    className="text-xs"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {option.description}
                  </div>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
