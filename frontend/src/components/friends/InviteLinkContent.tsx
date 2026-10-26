
"use client";

import { useState } from "react";
import styles from "./InviteLinkContent.module.css";

type InviteLinkContentProps = {
  inviteUrl: string | null;
};

export function InviteLinkContent({
  inviteUrl,
}: InviteLinkContentProps) {
  const [message, setMessage] = useState("");

  const isAvailable = Boolean(inviteUrl);

  const copyLink = async () => {
    if (!inviteUrl) return;

    try {
      await navigator.clipboard.writeText(inviteUrl);
      setMessage("リンクをコピーしました");
    } catch {
      setMessage("コピーできませんでした");
    }
  };

  const shareLink = async () => {
    if (!inviteUrl) return;

    if (!navigator.share) {
      await copyLink();
      return;
    }

    try {
      await navigator.share({
        title: "Donee フレンド招待",
        text: "Doneeでフレンドになろう！",
        url: inviteUrl,
      });

      setMessage("");
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === "AbortError"
      ) {
        return;
      }

      setMessage("共有できませんでした");
    }
  };

  return (
    <div className={styles["container"]}>
      <p className={styles["description"]}>
        招待リンクを友達に送って、
        フレンド申請してもらいましょう。
      </p>

      <div className={styles["linkBox"]}>
        <input
          className={styles["linkInput"]}
          type="text"
          value={inviteUrl ?? "招待リンクを準備中です"}
          aria-label="招待リンク"
          readOnly
          onFocus={(event) => {
            if (inviteUrl) {
              event.currentTarget.select();
            }
          }}
        />
      </div>

      <div className={styles["actions"]}>
        <button
          type="button"
          className={styles["copyButton"]}
          onClick={copyLink}
          disabled={!isAvailable}
        >
          コピー
        </button>

        <button
          type="button"
          className={styles["shareButton"]}
          onClick={shareLink}
          disabled={!isAvailable}
        >
          共有する
        </button>
      </div>

      {message && (
        <p className={styles["feedback"]} role="status">
          {message}
        </p>
      )}
    </div>
  );
}
