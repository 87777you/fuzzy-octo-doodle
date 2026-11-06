"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "../../../../components/layout/AppLayout";
import { PageHeader } from "../../../../components/layout/PageHeader";
import {
  isTaskDraft,
  TASK_DRAFT_STORAGE_KEY,
  validateTaskDraft,
  type TaskDraft,
  type TaskVisibility,
} from "../../../../lib/taskDraft";
import styles from "./page.module.css";

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M7 3v4m10-4v4M3 10h18m-12 4h2m4 0h2m-8 4h2" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7h3l1.5-2h7L17 7h3a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
    </svg>
  );
}

function FriendsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20v-1.5a6.5 6.5 0 0 1 13 0V20Zm14-14a3.5 3.5 0 0 1 0 6.8m2 2.2a5 5 0 0 1 3 4.5V20h-3" />
    </svg>
  );
}

function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <ellipse cx="12" cy="5" rx="8" ry="3" />
      <path d="M4 5v5c0 1.7 3.6 3 8 3s8-1.3 8-3V5m-16 5v5c0 1.7 3.6 3 8 3s8-1.3 8-3v-5m-16 5v4c0 1.7 3.6 3 8 3s8-1.3 8-3v-4" />
    </svg>
  );
}

function RequiredBadge() {
  return <span className={styles["requiredBadge"]}>必須</span>;
}

export default function CreateTaskPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [reward, setReward] = useState("500");
  const [visibility, setVisibility] = useState<TaskVisibility>("private");
  const [draftError, setDraftError] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [rewardError, setRewardError] = useState("");

  useEffect(() => {
    const storedDraft = window.sessionStorage.getItem(TASK_DRAFT_STORAGE_KEY);
    if (!storedDraft) {
      const defaultDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const localDeadline = new Date(
        defaultDeadline.getTime() -
          defaultDeadline.getTimezoneOffset() * 60 * 1000,
      )
        .toISOString()
        .slice(0, 16);
      setDeadline(localDeadline);
      return;
    }

    let parsedDraft: unknown;
    try {
      parsedDraft = JSON.parse(storedDraft);
    } catch {
      setDraftError("保存された入力内容を読み込めませんでした。入力し直してください。");
      return;
    }

    if (!isTaskDraft(parsedDraft)) {
      setDraftError("保存された入力内容を読み込めませんでした。入力し直してください。");
      return;
    }

    setTitle(parsedDraft.title);
    setDescription(parsedDraft.description);
    setDeadline(parsedDraft.deadline);
    setReward(parsedDraft.reward);
    setVisibility(parsedDraft.visibility);
  }, []);

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const draft: TaskDraft = {
      title,
      description,
      deadline,
      reward,
      visibility,
    };
    const now = Date.now();
    const titleError = validateTaskDraft(draft, now, "title");
    const nextDeadlineError = validateTaskDraft(draft, now, "deadline");
    const nextRewardError = validateTaskDraft(draft, now, "reward");
    setDraftError(titleError ?? "");
    setDeadlineError(nextDeadlineError ?? "");
    setRewardError(nextRewardError ?? "");
    if (titleError || nextDeadlineError || nextRewardError) {
      return;
    }

    const serialized = JSON.stringify(draft);
    try {
      window.sessionStorage.setItem(TASK_DRAFT_STORAGE_KEY, serialized);
    } catch {
      setDraftError("入力内容を保存できませんでした。もう一度お試しください。");
      return;
    }
    router.push("/tasks/create/confirm");
  };

  return (
    <AppLayout showHeader={false}>
      <div className={styles["screen"]}>
        <PageHeader title="タスク作成" backHref="/tasks" />

        <form className={styles["formCard"]} onSubmit={handleSubmit} noValidate>
          {draftError && <p className={styles["fieldError"]} role="alert">{draftError}</p>}
          <div className={styles["field"]}>
            <label className={styles["labelRow"]} htmlFor="task-title">
              <span className={styles["label"]}>タスク名</span>
              <RequiredBadge />
            </label>
            <input
              id="task-title"
              className={styles["textInput"]}
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              placeholder="タスク名を入力してください"
              maxLength={100}
              required
            />
            <p className={styles["counter"]}>{title.length}/100</p>
          </div>

          <div className={styles["field"]}>
            <label className={styles["labelRow"]} htmlFor="task-description">
              <span className={styles["label"]}>詳細</span>
              <span className={styles["optionalBadge"]}>任意</span>
            </label>
            <textarea
              id="task-description"
              className={[
                styles["textInput"] ?? "",
                styles["textarea"] ?? "",
              ].join(" ")}
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
              }}
              placeholder="タスクの詳細を入力してください"
              maxLength={200}
            />
            <p className={styles["counter"]}>{description.length}/200</p>
          </div>

          <div className={styles["field"]}>
            <label className={styles["labelRow"]} htmlFor="task-deadline">
              <span className={styles["label"]}>期限</span>
              <RequiredBadge />
            </label>
            <div className={styles["inputWithIcon"]}>
              <span className={styles["fieldIcon"]}>
                <CalendarIcon />
              </span>
              <input
                id="task-deadline"
                className={styles["dateInput"]}
                type="datetime-local"
                value={deadline}
                aria-invalid={!!deadlineError}
                aria-describedby={deadlineError ? "deadline-error" : undefined}
                onChange={(event) => {
                  const nextDeadline = event.target.value;
                  setDeadline(nextDeadline);
                  if (deadlineError) {
                    setDeadlineError(
                      validateTaskDraft(
                        { title, description, deadline: nextDeadline, reward, visibility },
                        Date.now(),
                        "deadline",
                      ) ?? "",
                    );
                  }
                }}
                required
              />
            </div>
            {deadlineError && <p id="deadline-error" className={styles["fieldError"]} role="alert">{deadlineError}</p>}
          </div>

          <fieldset
            className={[styles["field"] ?? "", styles["fieldset"] ?? ""].join(
              " ",
            )}
          >
            <legend className={styles["labelRow"]}>
              <span className={styles["label"]}>達成条件</span>
              <RequiredBadge />
            </legend>
            <label className={styles["evidenceOption"]}>
              <input type="radio" name="evidence" value="photo" defaultChecked />
              <span className={styles["evidenceIcon"]}>
                <CameraIcon />
              </span>
              <span className={styles["optionText"]}>
                <span className={styles["optionTitle"]}>写真で判定</span>
                <span className={styles["optionDescription"]}>
                  達成時にスクリーンショットや写真を1枚以上提出します
                </span>
              </span>
            </label>
          </fieldset>

          <div className={styles["field"]}>
            <label className={styles["labelRow"]} htmlFor="task-reward">
              <span className={styles["label"]}>金額設定</span>
              <RequiredBadge />
            </label>
            <div className={styles["inputWithIcon"]}>
              <span className={styles["fieldIcon"]}>
                <CoinIcon />
              </span>
              <input
                id="task-reward"
                className={styles["numberInput"]}
                type="number"
                min="100"
                max="10000"
                step="1"
                value={reward}
                aria-invalid={!!rewardError}
                aria-describedby={rewardError ? "reward-error" : undefined}
                onChange={(event) => {
                  const nextReward = event.target.value;
                  setReward(nextReward);
                  if (rewardError) {
                    setRewardError(
                      validateTaskDraft(
                        { title, description, deadline, reward: nextReward, visibility },
                        Date.now(),
                        "reward",
                      ) ?? "",
                    );
                  }
                }}
                required
              />
              <span className={styles["currency"]}>円</span>
            </div>
            {rewardError && <p id="reward-error" className={styles["fieldError"]} role="alert">{rewardError}</p>}
            <p className={styles["hint"]}>
              100〜10,000円。タスクを達成できなかった場合、この金額を支払います。
            </p>
          </div>

          <fieldset
            className={[styles["field"] ?? "", styles["fieldset"] ?? ""].join(
              " ",
            )}
          >
            <legend className={styles["labelRow"]}>
              <span className={styles["label"]}>金額の公開設定</span>
              <RequiredBadge />
            </legend>
            <div className={styles["visibilityOptions"]}>
              <label
                className={[
                  styles["visibilityOption"] ?? "",
                  visibility === "private" ? styles["selected"] ?? "" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === "private"}
                  onChange={() => {
                    setVisibility("private");
                  }}
                />
                <span className={styles["visibilityIcon"]}>
                  <LockIcon />
                </span>
                <span className={styles["visibilityText"]}>
                  <span className={styles["optionTitle"]}>公開しない</span>
                  <span className={styles["optionDescription"]}>
                    自分のみに表示します
                  </span>
                </span>
                <span className={styles["radioMark"]} aria-hidden="true" />
              </label>
              <label
                className={[
                  styles["visibilityOption"] ?? "",
                  visibility === "public" ? styles["selected"] ?? "" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === "public"}
                  onChange={() => {
                    setVisibility("public");
                  }}
                />
                <span className={styles["visibilityIcon"]}>
                  <FriendsIcon />
                </span>
                <span className={styles["visibilityText"]}>
                  <span className={styles["optionTitle"]}>公開する</span>
                  <span className={styles["optionDescription"]}>
                    招待したフレンドに金額を表示します
                  </span>
                </span>
                <span className={styles["radioMark"]} aria-hidden="true" />
              </label>
            </div>
          </fieldset>

          <button type="submit" className={styles["submitButton"]}>
            確認画面へ
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
