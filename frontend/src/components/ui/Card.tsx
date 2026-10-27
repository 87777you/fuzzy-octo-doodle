import type { HTMLAttributes, ReactNode } from "react";
import styles from "./Card.module.css";

type CardProps = {
  children: ReactNode;
  padding?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "tinted" | "warm";
} & HTMLAttributes<HTMLDivElement>;

export function Card({
  children,
  padding = "md",
  variant = "default",
  className = "",
  ...props
}: CardProps) {
  const cardClass = [
    styles["card"],
    styles[padding],
    styles[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
}