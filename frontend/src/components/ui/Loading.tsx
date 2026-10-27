
import styles from "./Loading.module.css";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  fullPage?: boolean;
}

export function Loading({
  message = "読み込み中...",
  size = "md",
  fullPage = false,
}: LoadingProps) {
  return (
    <div
      className={`${styles["container"] ?? ""} ${
        fullPage ? (styles["fullPage"] ?? "") : ""
      }`}
      role="status"
      aria-live="polite"
    >
      <div
        className={`${styles["spinner"] ?? ""} ${styles[size] ?? ""}`}
        aria-hidden="true"
      />

      {message && (
        <p className={styles["message"]}>{message}</p>
      )}
    </div>
  );
}
