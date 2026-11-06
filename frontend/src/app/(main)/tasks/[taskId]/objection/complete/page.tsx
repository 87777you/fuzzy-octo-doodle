"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNavigation } from "../../../../../../components/layout/BottomNavigation";
import { ObjectionCompleteContent } from "../../../../../../components/layout/ObjectionCompleteContent";
import { ObjectionCompleteHero } from "../../../../../../components/layout/ObjectionCompleteHero";
import { ObjectionConfirmation } from "../../../../../../components/layout/ObjectionConfirmation";
import { PageHeader } from "../../../../../../components/layout/PageHeader";
import { Button } from "../../../../../../components/ui/Button";
import styles from "../../../../../../components/layout/ObjectionCompleteContent.module.css";
import { SubmitterMemo } from "../../../../../../components/layout/SubmitterMemo";
import { TaskInfoCard } from "../../../../../../components/tasks/TaskInfoCard";
import { ImagePreview } from "../../../../../../components/ui/ImagePreview";
import { Loading } from "../../../../../../components/ui/Loading";
import {
  fetchObjectionTask,
  fetchObjectionEvidences,
  type ObjectionTask,
  type ObjectionEvidences,
} from "../../../../../../lib/objectionTaskApi";
import {
  readObjectionDraft,
  type ObjectionDraft,
} from "../../../../../../lib/objectionDraft";

export default function ObjectionCompletePage() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();

  const [completed, setCompleted] = useState<ObjectionDraft | null>(null);
  const [task, setTask] = useState<ObjectionTask | null>(null);
  const [evidences, setEvidences] = useState<ObjectionEvidences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const saved = readObjectionDraft(`objection-complete:${taskId}`);
        if (!saved) {
          router.replace("/");
          return;
        }

        const [taskResult, evidenceResult] = await Promise.all([
          fetchObjectionTask(taskId, controller.signal),
          fetchObjectionEvidences(taskId, controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setCompleted(saved);
        setTask(taskResult);
        setEvidences(evidenceResult);
      } catch {
        if (!controller.signal.aborted) {
          setError("送信結果を読み込めませんでした。");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    return () => { controller.abort(); };
  }, [taskId, router]);

  if (isLoading) return <Loading message="送信結果を読み込んでいます..." />;

  if (!completed || !task || !evidences) {
    return <p role="alert">{error ?? "送信結果が見つかりません。"}</p>;
  }

  const images = evidences.evidences.flatMap((evidence) =>
    evidence.photoUrls.map((src, index) => ({
      src,
      alt: `証拠写真 ${String(index + 1)}`,
    })),
  );

  const deadline = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(task.deadlineAt));

  return (
    <>
      <PageHeader title="異議申し立て完了" backHref="/" />
      <ObjectionCompleteContent>
        <ObjectionCompleteHero />
        <TaskInfoCard
          title={task.title}
          deadline={deadline}
          submitter={{ name: "タスクの所有者" }}
        />
        <ImagePreview images={images} />
        <SubmitterMemo memo="" />
        <ObjectionConfirmation
          reasonType={completed.reasonType}
          reasonDetail={completed.reasonDetail}
        />
        <div className={styles["action"]}>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => { router.push("/"); }}
          >
            ‹ フレンドのタスク一覧に戻る
          </Button>
        </div>
      </ObjectionCompleteContent>
      <BottomNavigation />
    </>
  );
}
