"use client";

import { useId } from "react";
import type { TextareaHTMLAttributes } from "react";
import styles from "./Textarea.module.css";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  helperText?: string;
  showCount?: boolean;
};

export function Textarea({
  label,
  error,
  helperText,
  showCount = false,
  required = false,
  maxLength,
  value,
  defaultValue,
  className,
  id,
  ...props
}: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const helperId = `${textareaId}-helper`;

  const currentLength = String(value ?? defaultValue ?? "").length;

  return (
    <div className={styles["field"]}>
      <div className={styles["labelRow"]}>
        <label htmlFor={textareaId} className={styles["label"]}>
          {label}
        </label>

        {required ? (
          <span className={styles["required"]}>必須</span>
        ) : (
          <span className={styles["optional"]}>任意</span>
        )}
      </div>

      <textarea
        {...props}
        id={textareaId}
        required={required}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        className={`${styles["textarea"]} ${
          error ? styles["error"] : ""
        } ${className ?? ""}`}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? errorId : helperText ? helperId : undefined
        }
      />

      <div className={styles["footer"]}>
        <div>
          {error ? (
            <p id={errorId} className={styles["errorText"]}>
              {error}
            </p>
          ) : helperText ? (
            <p id={helperId} className={styles["helperText"]}>
              {helperText}
            </p>
          ) : null}
        </div>

        {showCount && maxLength !== undefined && (
          <span className={styles["count"]}>
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
    </div>
  );
}