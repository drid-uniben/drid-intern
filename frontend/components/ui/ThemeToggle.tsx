"use client";

import { motion } from "motion/react";
import { useTheme } from "@/app/providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="btn-glass !p-2 !rounded-full"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      type="button"
    >
      <motion.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 90, opacity: 0 }}
        transition={{ duration: 0.2 }}
        style={{ display: "block", fontSize: "1.1rem", lineHeight: 1 }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </motion.span>
    </motion.button>
  );
}
