"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BottomNavigation } from "../../../../../../components/layout/BottomNavigation";
import { ObjectionConfirmActions } from "../../../../../../components/layout/ObjectionConfirmActions";
import { ObjectionConfirmation } from "../../../../../../components/layout/ObjectionConfirmation";
import { ObjectionConfirmContent } from "../../../../../../components/layout/ObjectionConfirmContent";
import { PageHeader } from "../../../../../../components/layout/PageHeader";
import { SubmitterMemo } from "../../../../../../components/layout/SubmitterMemo";
import { TaskInfoCard } from "../../../../../../components/tasks/TaskInfoCard";
import { ImagePreview } from "../../../../../../components/ui/ImagePreview";
import { Loading } from "../../../../../../components/ui/Loading";
import { createObjection } from "../../../../../../lib/objectionApi";
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

export default function ObjectionConfirmPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const inputPath = `/tasks/${encodeURIComponent(taskId)}/objection`;

  const [draft, setDraft] = useState<ObjectionDraft | null>(null);
  const [task, setTask] = useState<ObjectionTask | null>(null);
  const [evidences, setEvidences] = useState<ObjectionEvidences | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        const stored = readObjectionDraft(`objection-draft:${taskId}`);
        if (!stored) {
          router.replace(inputPath);
          return;
        }

        const [taskResult, evidenceResult] = await Promise.all([
          fetchObjectionTask(taskId, controller.signal),
          fetchObjectionEvidences(taskId, controller.signal),
        ]);

        if (controller.signal.aborted) return;

        if (taskResult.viewer !== "friend" || taskResult.status !== "reviewing") {
          router.replace(inputPath);
          return;
        }

        setDraft(stored);
        setTask(taskResult);
        setEvidences(evidenceResult);
      } catch {
        if (!controller.signal.aborted) {
          setError("確認内容を読み込めませんでした。");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void load();
    return () => { controller.abort(); };
  }, [taskId, router, inputPath]);

  const handleSubmit = async () => {
    if (!draft || submittingRef.current) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    setError(null);

    try {
      const keyName = `objection-idempotency:${taskId}`;
      let key = sessionStorage.getItem(keyName);

      if (!key) {
        key = crypto.randomUUID();
        sessionStorage.setItem(keyName, key);
      }

      const result = await createObjection(taskId, draft, key);

      sessionStorage.setItem(
        `objection-complete:${taskId}`,
        JSON.stringify({
          ...draft,
          objectionId: result.id,
        }),
      );
      sessionStorage.removeItem(`objection-draft:${taskId}`);

      router.replace(`${inputPath}/complete`);
    } catch {
      setError("異議申し立てを送信できませんでした。もう一度お試しください。");
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loading message="確認内容を読み込んでいます..." />;

  if (!task || !evidences || !draft) {
    return <p role="alert">{error ?? "確認内容が見つかりません。"}</p>;
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
      <PageHeader title="内容の確認" backHref={inputPath} />
      <ObjectionConfirmContent>
        <TaskInfoCard
          title={task.title}
          deadline={deadline}
          submitter={{ name: "タスクの所有者" }}
        />
        <ImagePreview images={images} />
        <SubmitterMemo memo="" />
        <ObjectionConfirmation
          reasonType={draft.reasonType}
          reasonDetail={draft.reasonDetail}
        />
        {error && <p role="alert">{error}</p>}
        <ObjectionConfirmActions
          onBack={() => {
            if (!isSubmitting) router.push(inputPath);
          }}
          onSubmit={() => { void handleSubmit(); }}
          disabled={isSubmitting}
        />
      </ObjectionConfirmContent>
      <BottomNavigation />
    </>
  );
}
