
import styles from "./TaskInfoCard.module.css";

type TaskInfoCardProps = {
  title: string;
  deadline: string;
  condition?: string;
  penaltyAmount?: number;
  showPenalty?: boolean;

  // 提出者情報（必要な画面だけ指定）
  submitter?: {
    name: string;
    avatarUrl?: string;
  };
};

export function TaskInfoCard({
  title,
  deadline,
  condition,
  penaltyAmount,
  showPenalty = false,
  submitter,
}: TaskInfoCardProps) {
  return (
    <section className={styles["card"]}>
      {submitter ? (
        <div className={styles["submitter"]}>
          <div className={styles["avatar"]}>
            {submitter.avatarUrl ? (
              <img
                src={submitter.avatarUrl}
                alt=""
                className={styles["avatarImage"]}
              />
            ) : (
              <span aria-hidden="true">
                {submitter.name.charAt(0)}
              </span>
            )}
          </div>

          <div className={styles["submitterInfo"]}>
            <p className={styles["submitterName"]}>
              {submitter.name}
            </p>
            <p className={styles["submitterDescription"]}>
              が提出したタスク
            </p>
          </div>
        </div>
      ) : (
        <p className={styles["label"]}>タスク名</p>
      )}

      <h2 className={styles["title"]}>{title}</h2>

      {condition && (
        <div className={styles["conditionBlock"]}>
          <p className={styles["label"]}>達成条件</p>
          <p className={styles["condition"]}>
            {condition}
          </p>
        </div>
      )}

      <div className={styles["deadline"]}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="5"
            width="18"
            height="16"
            rx="2"
          />
          <path d="M7 3v4M17 3v4M3 10h18M8 15l2 2 5-5" />
        </svg>

        <span>期限 {deadline}</span>
      </div>

      {showPenalty && penaltyAmount !== undefined && (
        <div className={styles["penalty"]}>
          <span>未提出時のペナルティ</span>
          <strong>
            {penaltyAmount.toLocaleString("ja-JP")}円
          </strong>
        </div>
      )}
    </section>
  );
}
