"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Modal } from "./Modal";
import styles from "./ReportMenu.module.css";

interface ReportMenuProps {
  onReport?: () => void;
  disabled?: boolean;
}

export function ReportMenu({
  onReport,
  disabled = false,
}: ReportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleReportClick = () => {
    setIsOpen(false);
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);
    onReport?.();
  };

  return (
    <>
      <div ref={menuRef} className={styles["container"]}>
        <button
          ref={triggerRef}
          type="button"
          className={styles["trigger"]}
          aria-label="投稿メニューを開く"
          aria-expanded={isOpen}
          aria-controls={isOpen ? menuId : undefined}
          onClick={() => { setIsOpen((previous) => !previous); }}
          disabled={disabled}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <circle cx="12" cy="5" r="1.8" />
            <circle cx="12" cy="12" r="1.8" />
            <circle cx="12" cy="19" r="1.8" />
          </svg>
        </button>

        {isOpen && (
          <div id={menuId} className={styles["dropdown"]}>
            <button
              type="button"
              className={styles["menuItem"]}
              onClick={handleReportClick}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M5 21V5a2 2 0 0 1 2-2h11l-3 5 3 5H7" />
              </svg>

              投稿を報告する
            </button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isConfirmOpen}
        title="投稿を報告"
        confirmText="報告する"
        cancelText="キャンセル"
        confirmVariant="danger"
        onConfirm={handleConfirm}
        onClose={() => { setIsConfirmOpen(false); }}
      >
        <p className={styles["modalText"]}>
          この投稿を報告しますか？
        </p>
      </Modal>
    </>
  );
}