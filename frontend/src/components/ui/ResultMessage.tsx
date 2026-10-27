
import styles from "./ResultMessage.module.css";

interface ResultMessageProps {
  title: string;
  description?: string;
  variant?: "success" | "error" | "warning";
}

export function ResultMessage({
  title,
  description,
  variant = "success",
}: ResultMessageProps) {
  return (
    <div className={styles["container"]}>
      <div
        className={`${styles["iconWrapper"] ?? ""} ${styles[variant] ?? ""}`}
        aria-hidden="true"
      >
        {variant === "success" && (
          <svg
            viewBox="0 0 160 160"
            className={styles["icon"]}
            fill="none"
          >
            <circle
              cx="80"
              cy="80"
              r="51"
              stroke="currentColor"
              strokeWidth="7"
            />
            <path
              d="M58 81L74 97L105 63"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <g
              stroke="currentColor"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.55"
            >
              <path d="M80 5V16" />
              <path d="M80 144V155" />
              <path d="M5 80H16" />
              <path d="M144 80H155" />
              <path d="M27 27L35 35" />
              <path d="M125 125L133 133" />
              <path d="M133 27L125 35" />
              <path d="M35 125L27 133" />
            </g>
          </svg>
        )}

        {variant === "error" && (
          <svg
            viewBox="0 0 160 160"
            className={styles["icon"]}
            fill="none"
          >
            <circle
              cx="80"
              cy="80"
              r="51"
              stroke="currentColor"
              strokeWidth="7"
            />
            <path
              d="M63 63L97 97M97 63L63 97"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        )}

        {variant === "warning" && (
          <svg
            viewBox="0 0 160 160"
            className={styles["icon"]}
            fill="none"
          >
            <circle
              cx="80"
              cy="80"
              r="51"
              stroke="currentColor"
              strokeWidth="7"
            />
            <path
              d="M80 51V86"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle cx="80" cy="108" r="5" fill="currentColor" />
          </svg>
        )}
      </div>

      <h2 className={styles["title"]}>{title}</h2>

      {description && (
        <p className={styles["description"]}>{description}</p>
      )}
    </div>
  );
}
