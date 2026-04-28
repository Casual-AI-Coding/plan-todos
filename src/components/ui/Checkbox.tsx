"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { motion } from "framer-motion";

interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className = "", checked, onChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = useState(checked ?? false);
    
    return (
      <motion.label 
        className="inline-flex items-center gap-2 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <motion.div
          className={`relative w-5 h-5 rounded border-2 ${className}`}
          animate={isChecked ? "checked" : "unchecked"}
          variants={{
            checked: { 
              scale: [1, 1.2, 1], 
              backgroundColor: "var(--color-primary)",
              borderColor: "var(--color-primary)",
            },
            unchecked: { 
              scale: 1, 
              backgroundColor: "transparent",
              borderColor: "var(--color-border)",
            },
          }}
          transition={{ duration: 0.2 }}
        >
          <input
            ref={ref}
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            onChange={(e) => {
              setIsChecked(e.target.checked);
              onChange?.(e);
            }}
            {...props}
          />
          <motion.svg
            viewBox="0 0 24 24"
            className="absolute inset-0 w-full h-full p-0.5"
            initial="unchecked"
            animate={isChecked ? "checked" : "unchecked"}
          >
            <motion.path
              d="M5 13l4 4L19 7"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              variants={{
                checked: { pathLength: 1, opacity: 1 },
                unchecked: { pathLength: 0, opacity: 0 },
              }}
              transition={{ duration: 0.2 }}
            />
          </motion.svg>
        </motion.div>
        {label && <span style={{ color: "var(--color-text)" }}>{label}</span>}
      </motion.label>
    );
  },
);

Checkbox.displayName = "Checkbox";