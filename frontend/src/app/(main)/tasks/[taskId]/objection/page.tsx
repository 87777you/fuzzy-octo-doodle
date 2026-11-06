
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ObjectionDetailForm } from "../../../../../components/layout/ObjectionDetailForm";
import { ObjectionPageContent } from "../../../../../components/layout/ObjectionPageContent";
import {
  ObjectionReasonSelector,
  type ObjectionReasonOption,
  type ObjectionReasonType,
} from "../../../../../components/layout/ObjectionReasonSelector";
import { SubmitObjectionButton } from "../../../../../components/layout/SubmitObjectionButton";
import { BottomNavigation } from "../../../../../components/layout/BottomNavigation";
import { PageHeader } from "../../../../../components/layout/PageHeader";
import { SubmitterMemo } from "../../../../../components/layout/SubmitterMemo";
import { TaskInfoCard } from "../../../../../components/tasks/TaskInfoCard";
import { ImagePreview } from "../../../../../components/ui/ImagePreview";
import { ErrorState } from "../../../../../components/ui/ErrorState";
import { Loading } from "../../../../../components/ui/Loading";
import {
  fetchObjectionTask,
  fetchObjectionEvidences,
  type ObjectionTask,
  type ObjectionEvidences,
} from "../../../../../lib/objectionTaskApi";
import { readObjectionDraft } from "../../../../../lib/objectionDraft";

const reasonOptions: readonly ObjectionReasonOption[] = [
  {
    value: "insufficient_evidence",
    title: "証拠が不十分",
    description: "写真が不鮮明・内容が確認できないなど",
  },
  {
    value: "conditions_not_met",
    title: "達成条件を満たしていない",
    description: "タスクの内容と証拠が合っていないなど",
  },
  {
    value: "other",
    title: "その他",
    description: "上記以外の理由",
  },
];

export default function ObjectionPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const taskPath = `/tasks/${encodeURIComponent(taskId)}`;

  const [task, setTask] = useState<ObjectionTask | null>(null);
  const [evidences, setEvidences] = useState<ObjectionEvidences | null>(null);
  const [reasonType, setReasonType] =
    useState<ObjectionReasonType>("insufficient_evidence");
  const [reasonDetail, setReasonDetail] = useState("");
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setIsReady(false);
    setLoadError(null);
    setStorageError(null);
    setTask(null);
    setEvidences(null);
    setReasonType("insufficient_evidence");
    setReasonDetail("");

    async function load() {
      try {
        const [taskResult, evidenceResult] = await Promise.all([
          fetchObjectionTask(taskId, controller.signal),
          fetchObjectionEvidences(taskId, controller.signal),
        ]);

        if (controller.signal.aborted) return;

        setTask(taskResult);
        setEvidences(evidenceResult);

        const draft = readObjectionDraft(
          `objection-draft:${taskId}`,
        );

        if (draft) {
          setReasonType(draft.reasonType);
          setReasonDetail(draft.reasonDetail);
        }
      } catch {
        if (controller.signal.aborted) return;
        setLoadError("タスク情報を取得できませんでした。");
      } finally {
        if (!controller.signal.aborted) {
          setIsReady(true);
        }
      }
    }

    void load();

    return () => {
      controller.abort();
    };
  }, [taskId]);

  const handleSubmit = () => {
    if (!isReady || !reasonDetail.trim()) return;

    try {
      sessionStorage.setItem(
        `objection-draft:${taskId}`,
        JSON.stringify({
          reasonType,
          reasonDetail: reasonDetail.trim(),
        }),
      );

      // 入力内容が変わった場合は新しい送信キーを使う
      sessionStorage.removeItem(
        `objection-idempotency:${taskId}`,
      );

      setStorageError(null);
      router.push(`${taskPath}/objection/confirm`);
    } catch {
      setStorageError(
        "入力内容を保存できませんでした。もう一度お試しください。",
      );
    }
  };

  if (!isReady) {
    return <Loading message="タスク情報を読み込んでいます..." />;
  }

  if (loadError || !task || !evidences) {
    return (
      <ErrorState
        title="読み込みに失敗しました"
        description={loadError ?? "タスク情報が見つかりません。"}
      />
    );
  }

  const canObject =
    task.viewer === "friend" && task.status === "reviewing";

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
      <PageHeader
        title="異議申し立て"
        backHref={`${taskPath}/review`}
      />

      <ObjectionPageContent>
        {canObject ? (
          <>
            <TaskInfoCard
              title={task.title}
              deadline={deadline}
              submitter={{ name: "タスクの所有者" }}
            />

            <ImagePreview images={images} />

            <SubmitterMemo memo="" />

            <ObjectionReasonSelector
              options={reasonOptions}
              value={reasonType}
              onChange={setReasonType}
            />

            <ObjectionDetailForm
              value={reasonDetail}
              onChange={setReasonDetail}
            />

            {storageError && (
              <p role="alert">{storageError}</p>
            )}

            <SubmitObjectionButton
              disabled={!reasonDetail.trim()}
              onClick={handleSubmit}
            />
          </>
        ) : (
          <ErrorState
            title="異議申し立てできません"
            description="審査中のフレンドのタスクから異議申し立てを行ってください。"
          />
        )}
      </ObjectionPageContent>

      <BottomNavigation />
    </>
  );
}
