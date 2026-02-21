"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type Variant = "default" | "subtle" | "strong";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  variant?: Variant;
  hover?: boolean;
  glow?: boolean;
}

const variantClass: Record<Variant, string> = {
  default: "glass",
  subtle: "glass-subtle",
  strong: "glass-strong",
};

export function GlassCard({
  variant = "default",
  hover = true,
  glow = false,
  className = "",
  children,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      className={`${variantClass[variant]} rounded-2xl p-6 ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={
        hover
          ? { y: -4, boxShadow: glow ? "0 0 30px var(--glow-color)" : undefined }
          : undefined
      }
      {...rest}
    >
      {children}
    </motion.div>
  );
}
