"use client";

import * as m from "motion/react-m";
import { useAppStore } from "@/lib/store";

export function ThemeToggle() {
  const theme = useAppStore((state) => state.theme);
  const toggleTheme = useAppStore((state) => state.toggleTheme);

  return (
    <button
      className="p-2 rounded-full transition-colors hover:bg-[var(--glass-bg)]"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      type="button"
    >
      <m.span
        key={theme}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{ display: "inline-block", fontSize: "1.2rem" }}
      >
        {theme === "light" ? "🌙" : "☀️"}
      </m.span>
    </button>
  );
}
