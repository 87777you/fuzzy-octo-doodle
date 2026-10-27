
import type { ReactNode } from "react";
import styles from "./StatusInfoCard.module.css";

interface StatusInfoCardProps {
  title: string;
  description?: string;
  icon?: "clock" | "hourglass" | "check" | "info";
  variant?: "outlined" | "tinted";
  label?: string;
  footer?: ReactNode;
}

export function StatusInfoCard({
  title,
  description,
  icon = "clock",
  variant = "tinted",
  label,
  footer,
}: StatusInfoCardProps) {
  return (
    <section
      className={[
        styles["card"],
        styles[variant],
      ].join(" ")}
    >
      <div className={styles["content"]}>
        <div className={styles["iconWrapper"]} aria-hidden="true">
          {icon === "clock" && (
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 7V12L15.5 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}

          {icon === "hourglass" && (
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M6 3H18M6 21H18M7 3V6C7 9 10 10 12 12C14 10 17 9 17 6V3M7 21V18C7 15 10 14 12 12C14 14 17 15 17 18V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {icon === "check" && (
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M7.5 12L10.5 15L16.5 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          {icon === "info" && (
            <svg viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M12 11V16M12 8V8.1"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </div>

        <div className={styles["textContent"]}>
          {label && (
            <p className={styles["label"]}>{label}</p>
          )}

          <h3 className={styles["title"]}>{title}</h3>

          {description && (
            <p className={styles["description"]}>
              {description}
            </p>
          )}
        </div>
      </div>

      {footer && (
        <div className={styles["footer"]}>
          {footer}
        </div>
      )}
    </section>
  );
}
