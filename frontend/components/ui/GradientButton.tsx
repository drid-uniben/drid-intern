"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { type ReactNode } from "react";

type Variant = "gradient" | "glass" | "danger";

interface GradientButtonProps {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
}

const variantClasses: Record<Variant, string> = {
  gradient: "btn-gradient",
  glass: "btn-glass",
  danger: "btn-gradient",
};

export function GradientButton({
  children,
  variant = "gradient",
  href,
  loading = false,
  className = "",
  disabled,
  type = "button",
  onClick,
}: GradientButtonProps) {
  const classes = `${variantClasses[variant]} ${className}`;

  const inner = loading ? (
    <span className="flex items-center gap-2">
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
    </span>
  ) : (
    children
  );

  if (href) {
    return (
      <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
        <Link className={classes} href={href}>
          {inner}
        </Link>
      </m.div>
    );
  }

  return (
    <m.button
      className={classes}
      disabled={disabled || loading}
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {inner}
    </m.button>
  );
}

