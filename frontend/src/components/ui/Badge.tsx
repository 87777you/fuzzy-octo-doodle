import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Badge.module.css";

type BadgeVariant =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "review";

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: "sm" | "md";
} & HTMLAttributes<HTMLSpanElement>;

export function Badge({
  children,
  variant = "neutral",
  size = "md",
  className = "",
  ...props
}: BadgeProps) {
  const badgeClass = [
    styles["badge"],
    styles[variant],
    styles[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <span className={badgeClass} {...props}>
      {children}
    </span>
  );
}