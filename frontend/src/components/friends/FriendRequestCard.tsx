
import styles from "./FriendRequestCard.module.css";

export interface FriendRequest {
  id: string;
  name: string;
  avatarUrl?: string;
  requestedAtText: string;
  direction: "received" | "sent";
}

interface FriendRequestCardProps {
  request: FriendRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  disabled?: boolean;
}

export function FriendRequestCard({
  request,
  onAccept,
  onReject,
  disabled = false,
}: FriendRequestCardProps) {
  const received = request.direction === "received";

  return (
    <article className={styles["card"]}>
      <div className={styles["avatar"]}>
        {request.avatarUrl ? (
          <img
            src={request.avatarUrl}
            alt=""
            className={styles["avatarImage"]}
          />
        ) : (
          <span aria-hidden="true">
            {request.name.charAt(0)}
          </span>
        )}
      </div>

      <div className={styles["info"]}>
        <p className={styles["name"]}>{request.name}</p>
        <p className={styles["date"]}>
          {request.requestedAtText}
        </p>
      </div>

      {received ? (
        <div className={styles["actions"]}>
          <button
            type="button"
            className={styles["reject"]}
            onClick={() => {
              onReject?.(request.id);
            }}
            disabled={disabled || !onReject}
            aria-label={`${request.name}の申請を拒否`}
          >
            拒否
          </button>

          <button
            type="button"
            className={styles["accept"]}
            onClick={() => {
              onAccept?.(request.id);
            }}
            disabled={disabled || !onAccept}
            aria-label={`${request.name}の申請を承認`}
          >
            承認
          </button>
        </div>
      ) : (
        <span className={styles["pending"]}>承認待ち</span>
      )}
    </article>
  );
}
