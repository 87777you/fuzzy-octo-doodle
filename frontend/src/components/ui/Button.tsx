import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
const buttonClass = [
  styles["button"],
  styles[variant],
  styles[size],
  fullWidth ? styles["fullWidth"] : "",
  className,
]
  .filter(Boolean)
  .join(" ");
  return (
    <button
      type={type}
      className={buttonClass}
      {...props}
    >
      {children}
    </button>
  );
}