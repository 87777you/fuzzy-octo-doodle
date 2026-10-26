import { useId } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

type InputProps = {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  optional?: boolean;
} & InputHTMLAttributes<HTMLInputElement>;

export function Input({
  label,
  error,
  fullWidth = false,
  optional = false,
  required = false,
  className = "",
  id,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div
      className={[
        styles["field"],
        fullWidth ? styles["fullWidth"] : "",
      ].filter(Boolean).join(" ")}
    >
      {label && (
        <label htmlFor={inputId} className={styles["label"]}>
          {label}

          {required && (
            <span className={styles["requiredBadge"]}>必須</span>
          )}

          {!required && optional && (
            <span className={styles["optionalText"]}>（任意）</span>
          )}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        required={required}
        className={[
          styles["input"],
          error ? styles["error"] : "",
          className,
        ].filter(Boolean).join(" ")}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
      />

      {error && (
        <p id={`${inputId}-error`} className={styles["errorText"]}>
          {error}
        </p>
      )}
    </div>
  );
}