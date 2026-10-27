
"use client";

import { Card } from "../ui/Card";
import { ReportMenu } from "../ui/ReportMenu";
import styles from "./CommunityTaskCard.module.css";

interface Reaction {
  emoji: string;
  count: number;
  reacted?: boolean;
}

interface CommunityTaskCardProps {
  userName: string;
  avatarUrl?: string;
  timeAgo: string;
  taskTitle: string;
  status: string;
  remainingTime?: string;
  reactions: Reaction[];
  onReactionClick?: (emoji: string) => void;
  onDetailClick?: () => void;
  onReport?: () => void;
}

export function CommunityTaskCard({
  userName,
  avatarUrl,
  timeAgo,
  taskTitle,
  status,
  remainingTime,
  reactions,
  onReactionClick,
  onDetailClick,
  onReport,
}: CommunityTaskCardProps) {
  return (
    <Card padding="md" variant="outlined">
      <article className={styles["content"]}>
        {/* ユーザー情報 */}
        <div className={styles["header"]}>
          <div className={styles["userInfo"]}>
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className={styles["avatar"]}
              />
            ) : (
              <div className={styles["avatarPlaceholder"]}>
                {userName.charAt(0)}
              </div>
            )}

            <div>
              <p className={styles["userName"]}>
                {userName}
              </p>

              <p className={styles["time"]}>
                タスクを作成しました・{timeAgo}
              </p>
            </div>
          </div>

          {/* 投稿メニュー */}
          <ReportMenu
            {...(onReport !== undefined ? { onReport } : {})}
          />
        </div>

        {/* タスク名 */}
        <h3 className={styles["taskTitle"]}>
          {taskTitle}
        </h3>

        {/* ステータス・残り時間 */}
        <div className={styles["statusRow"]}>
          <span className={styles["status"]}>
            {status}
          </span>

          {remainingTime && (
            <span className={styles["remaining"]}>
              ◷ {remainingTime}
            </span>
          )}
        </div>

        {/* リアクション・詳細ボタン */}
        <div className={styles["footer"]}>
          <div className={styles["reactions"]}>
            {reactions.map((reaction) => (
              <button
                key={reaction.emoji}
                type="button"
                className={[
                  styles["reactionButton"],
                  reaction.reacted ? styles["reacted"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => {
                  onReactionClick?.(reaction.emoji);
                }}
                disabled={!onReactionClick}
                aria-pressed={reaction.reacted ?? false}
                aria-label={`${reaction.emoji} リアクション ${String(reaction.count)}件`}
              >
                <span>{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            className={styles["detailButton"]}
            onClick={onDetailClick}
            disabled={!onDetailClick}
          >
            詳細を見る →
          </button>
        </div>
      </article>
    </Card>
  );
}
