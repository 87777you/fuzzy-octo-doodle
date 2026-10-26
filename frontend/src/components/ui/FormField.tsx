import type { ReactNode } from "react";
import styles from "./FormField.module.css";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
};

export function FormField({
  label,
  htmlFor,
  required = false,
  optional = false,
  description,
  error,
  children,
}: FormFieldProps) {
  return (
    <div className={styles["field"]}>
      <div className={styles["labelRow"]}>
        {htmlFor ? (
          <label htmlFor={htmlFor} className={styles["label"]}>
            {label}
          </label>
        ) : (
          <span className={styles["label"]}>{label}</span>
        )}

        {required && (
          <span className={styles["required"]}>必須</span>
        )}

        {!required && optional && (
          <span className={styles["optional"]}>任意</span>
        )}
      </div>

      {description && (
        <p className={styles["description"]}>{description}</p>
      )}

      <div className={styles["control"]}>{children}</div>

      {error && (
        <p className={styles["error"]} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}