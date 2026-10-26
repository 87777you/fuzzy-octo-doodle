"use client";

import { Button } from "./Button";
import styles from "./ErrorState.module.css";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  isRetrying?: boolean;
};

export function ErrorState({
  title = "読み込みに失敗しました",
  description = "通信状況を確認して、もう一度お試しください。",
  onRetry,
  retryText = "再試行する",
  isRetrying = false,
}: ErrorStateProps) {
  return (
    <div className={styles["container"]} role="alert">
      <div className={styles["icon"]} aria-hidden="true">
        <svg
          width="30"
          height="30"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6" />
          <circle cx="12" cy="17" r="1" fill="currentColor" stroke="none" />
        </svg>
      </div>

      <h3 className={styles["title"]}>{title}</h3>

      {description && (
        <p className={styles["description"]}>
          {description}
        </p>
      )}

      {onRetry && (
        <div className={styles["action"]}>
          <Button
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? "再試行中..." : retryText}
          </Button>
        </div>
      )}
    </div>
  );
}