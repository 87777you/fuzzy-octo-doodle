"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "../layout/PageHeader";
import { BottomNavigation } from "../layout/BottomNavigation";
import { TaskInfoCard } from "../tasks/TaskInfoCard";
import { getEvidenceTask, listEvidence, type EvidenceItem, type EvidenceTask, type SubmissionType } from "../../lib/evidenceApi";
import styles from "./Evidence.module.css";

export function EvidenceComplete({ type }: { type: SubmissionType }) {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const [task, setTask] = useState<EvidenceTask | null>(null);
  const [item, setItem] = useState<EvidenceItem | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const additional = type === "additional";
  const base = `/tasks/${encodeURIComponent(taskId)}`;

  useEffect(() => {
    let active = true;
    Promise.all([getEvidenceTask(taskId), listEvidence(taskId)]).then(([t, list]) => {
      if (!active) return;
      setTask(t);
      setItem([...list.evidences].filter((e) => e.submissionType === type)
        .sort((a, b) => Date.parse(b.submittedAt) - Date.parse(a.submittedAt))[0] ?? null);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "提出情報を取得できませんでした");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [taskId, type]);

  return (
    <>
      <PageHeader title={additional ? "追加証拠の提出完了" : "証拠提出完了"} backHref={base} />
      <main className={styles.main}>
        {loading ? <p>提出情報を読み込んでいます...</p> : error ? (
          <p role="alert" className={styles.error}>{error}</p>
        ) : (
          <>
            <div className={styles.hero}>
              <div className={styles.check} aria-hidden="true">✓</div>
              <h2>{additional ? "追加証拠を提出しました" : "証拠を提出しました！"}</h2>
              <p>{additional ? "提出した証拠の確認をお待ちください。" : "フレンドの確認を待っています。"}</p>
            </div>
            {task && <TaskInfoCard title={task.title} deadline={new Intl.DateTimeFormat("ja-JP", {
              timeZone: "Asia/Tokyo", dateStyle: "short", timeStyle: "short",
            }).format(new Date(task.deadlineAt))} />}
            {item ? <section className={styles.submitted}>
              <h2>提出した証拠写真（{item.photoUrls.length}枚）</h2>
              <div className={styles.submittedImages}>
                {item.photoUrls.map((url, index) =>
                  <img key={`${index}-${url}`} src={url} alt={`提出写真${index + 1}`} />)}
              </div>
            </section> : <p className={styles.hint}>提出済みの証拠が見つかりませんでした。</p>}
            {!additional && <div className={styles.status}>
              <span>現在のステータス</span>
              <strong>確認待ち</strong>
              <p>フレンドが証拠を確認すると、タスクの達成が確定します。</p>
            </div>}
            <button type="button" className={styles.primary} onClick={() => router.push(base)}>
              {additional ? "マイタスクに戻る" : "タスク詳細に戻る"}
            </button>
          </>
        )}
      </main>
      <BottomNavigation />
    </>
  );
}
