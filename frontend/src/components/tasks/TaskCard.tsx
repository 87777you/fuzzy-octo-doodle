
"use client";

import type { TaskStatus } from "../../types/task";
import { TaskStatusBadge } from "./TaskStatusBadge";
import styles from "./TaskCard.module.css";

interface TaskCardProps {
  title: string;
  description?: string;
  deadline: string;
  status: TaskStatus;
  remainingText?: string;
  onClick?: () => void;
  onMenuClick?: () => void;
}

const statusIcon: Record<TaskStatus, string> = {
  active: "○",
  reviewing: "◷",
  disputed: "!",
  success: "✓",
  failed: "×",
  indeterminate: "?",
  closed: "−",
};

export function TaskCard({
  title,
  description,
  deadline,
  status,
  remainingText,
  onClick,
  onMenuClick,
}: TaskCardProps) {
  return (
    <article className={styles["card"]}>
      <span
        className={`${styles["statusIcon"] ?? ""} ${styles[status] ?? ""}`}
        aria-hidden="true"
      >
        {statusIcon[status]}
      </span>

      <div className={styles["content"]}>
        <div className={styles["heading"]}>
          {onClick ? (
            <button
              type="button"
              className={styles["titleButton"]}
              onClick={onClick}
            >
              {title}
            </button>
          ) : (
            <h3 className={styles["title"]}>{title}</h3>
          )}

          <TaskStatusBadge status={status} />
        </div>

        {description && (
          <p className={styles["description"]}>{description}</p>
        )}

        <div className={styles["meta"]}>
          <span className={styles["deadline"]}>
            <span aria-hidden="true">▦</span>
            {deadline}
          </span>

          {remainingText && (
            <span
              className={
                status === "reviewing"
                  ? styles["reviewTime"]
                  : styles["remainingTime"]
              }
            >
              {remainingText}
            </span>
          )}
        </div>
      </div>

      {onMenuClick && (
        <button
          type="button"
          className={styles["menuButton"]}
          onClick={onMenuClick}
          aria-label={`${title}のメニューを開く`}
        >
          ⋯
        </button>
      )}
    </article>
  );
}
