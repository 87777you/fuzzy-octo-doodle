"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import styles from "./PageHeader.module.css";

type PageHeaderProps = {
  title: string;
  backHref?: string;
  onBack?: () => void;
  rightContent?: ReactNode;
};

export function PageHeader({
  title,
  backHref,
  onBack,
  rightContent,
}: PageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (backHref) {
      router.push(backHref);
      return;
    }

    router.back();
  };

  return (
    <header className={styles["header"]}>
      <button
        type="button"
        className={styles["backButton"]}
        onClick={handleBack}
        aria-label="戻る"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <h1 className={styles["title"]}>{title}</h1>

      <div className={styles["right"]}>
        {rightContent}
      </div>
    </header>
  );
}