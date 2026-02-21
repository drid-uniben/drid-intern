"use client";

import { motion, type HTMLMotionProps } from "motion/react";

type Variant = "gradient" | "glass" | "danger";

interface GradientButtonProps extends Omit<HTMLMotionProps<"button">, "type"> {
  variant?: Variant;
  loading?: boolean;
  type?: "button" | "submit" | "reset";
}

const variantClass: Record<Variant, string> = {
  gradient: "btn-gradient",
  glass: "btn-glass",
  danger: "btn-gradient",
};

const dangerStyle = {
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
};

export function GradientButton({
  variant = "gradient",
  loading = false,
  children,
  className = "",
  disabled,
  style,
  ...rest
}: GradientButtonProps) {
  return (
    <motion.button
      className={`${variantClass[variant]} ${className}`}
      style={variant === "danger" ? { ...dangerStyle, ...style } : style}
      whileHover={disabled || loading ? undefined : { scale: 1.02 }}
      whileTap={disabled || loading ? undefined : { scale: 0.98 }}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 16,
              height: 16,
              border: "2px solid rgba(255,255,255,0.3)",
              borderTopColor: "#fff",
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.6s linear infinite",
            }}
          />
          {children}
        </>
      ) : (
        children
      )}
    </motion.button>
  );
}
