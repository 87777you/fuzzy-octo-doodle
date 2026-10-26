"use client";

import { useId } from "react";
import type { SelectHTMLAttributes } from "react";
import styles from "./Select.module.css";

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> & {
  label: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  helperText?: string;
};

export function Select({
  label,
  options,
  placeholder = "選択してください",
  error,
  helperText,
  required = false,
  id,
  className,
  ...props
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = `${selectId}-error`;
  const helperId = `${selectId}-helper`;

  return (
    <div className={styles["field"]}>
      <div className={styles["labelRow"]}>
        <label htmlFor={selectId} className={styles["label"]}>
          {label}
        </label>

        {required ? (
          <span className={styles["required"]}>必須</span>
        ) : (
          <span className={styles["optional"]}>任意</span>
        )}
      </div>

      <div className={styles["selectWrapper"]}>
        <select
          {...props}
          id={selectId}
          required={required}
          className={`${styles["select"]} ${
            error ? styles["error"] : ""
          } ${className ?? ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
        >
          <option value="" disabled>
            {placeholder}
          </option>

          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <span className={styles["arrow"]} aria-hidden="true">
          ▾
        </span>
      </div>

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
  );
}