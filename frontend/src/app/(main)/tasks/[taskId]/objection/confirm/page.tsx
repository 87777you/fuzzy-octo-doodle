"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomNavigation } from "../../../../../../components/layout/BottomNavigation";
import { ObjectionConfirmActions } from "../../../../../../components/layout/ObjectionConfirmActions";
import { ObjectionConfirmation } from "../../../../../../components/layout/ObjectionConfirmation";
import { ObjectionConfirmContent } from "../../../../../../components/layout/ObjectionConfirmContent";
import { PageHeader } from "../../../../../../components/layout/PageHeader";
import { SubmitterMemo } from "../../../../../../components/layout/SubmitterMemo";
import { TaskInfoCard } from "../../../../../../components/tasks/TaskInfoCard";
import { ImagePreview } from "../../../../../../components/ui/ImagePreview";
import type { ObjectionReasonType } from "../../../../../../components/layout/ObjectionReasonSelector";

// APIが未実装でも確認画面を表示できるようにする仮のタスク情報。
const mockData = {
  taskTitle: "毎日ストレッチする",
  deadline: "2025/04/25 23:59",
  submitter: { name: "りく", avatarUrl: "/images/pazul.jpg" },
  evidenceImages: [
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真1" },
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真2" },
  ],
  memo: "朝に10分ストレッチしました！\n肩まわりがすっきりしました。",
};

interface ObjectionDraft {
  // 異議理由と詳細は、前の入力画面からsessionStorageで受け取る。
  reasonType: ObjectionReasonType;
  reasonDetail: string;
}

const objectionReasonTypes = [
  "insufficient_evidence",
  "conditions_not_met",
  "other",
] as const;

function isObjectionReasonType(value: string): value is ObjectionReasonType {
  return (objectionReasonTypes as readonly string[]).includes(value);
}

export default function ObjectionConfirmPage() {
  // URLのtaskIdを、保存データの読み込みと完了画面への遷移に使う。
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();

  // sessionStorageから読み込んだ異議内容。読み込み前はnull。
  const [draft, setDraft] = useState<ObjectionDraft | null>(null);

  useEffect(() => {
    // 入力画面で保存したタスク別の下書きを取得する。
    const storedDraft = sessionStorage.getItem(`objection-draft:${taskId}`);
    if (!storedDraft) {
      router.replace(`/tasks/${taskId}/objection`);
      return;
    }

    try {
      // sessionStorageの値は文字列なので、JSONとして解析する。
      const parsedDraft: unknown = JSON.parse(storedDraft);

      // 外部から変更できるデータのため、オブジェクトと各プロパティを確認する。
      if (
        typeof parsedDraft === "object" &&
        parsedDraft !== null &&
        "reasonType" in parsedDraft &&
        "reasonDetail" in parsedDraft &&
        typeof parsedDraft.reasonType === "string" &&
        typeof parsedDraft.reasonDetail === "string" &&
        isObjectionReasonType(parsedDraft.reasonType) &&
        parsedDraft.reasonDetail.trim().length > 0
      ) {
        // 検証した入力内容を確認画面に反映する。
        setDraft({
          reasonType: parsedDraft.reasonType,
          reasonDetail: parsedDraft.reasonDetail,
        });
      } else {
        sessionStorage.removeItem(`objection-draft:${taskId}`);
        router.replace(`/tasks/${taskId}/objection`);
      }
    } catch {
      // 壊れたJSONは削除し、無効な入力を残さない。
      sessionStorage.removeItem(`objection-draft:${taskId}`);
      router.replace(`/tasks/${taskId}/objection`);
    }
  }, [router, taskId]);

  // 確認した異議内容をモック送信し、完了画面へ移動する。
  const handleSubmit = () => {
    // 下書きが読み込めていない場合は送信しない。
    if (!draft) return;

    // APIの代わりに完了画面へ遷移する。
    router.push(`/tasks/${taskId}/objection/complete`);
  };

  return (
    <>
      {/* ページタイトルと戻る操作を表示する。 */}
      <PageHeader title="内容の確認" />
      <ObjectionConfirmContent>
        {/* 異議対象のタスク情報を表示する。 */}
        <TaskInfoCard
          title={mockData.taskTitle}
          deadline={mockData.deadline}
          submitter={mockData.submitter}
        />
        {/* 提出された証拠写真を表示する。 */}
        <ImagePreview images={mockData.evidenceImages} />
        {/* 提出者のメモを表示する。 */}
        <SubmitterMemo memo={mockData.memo} />
        {draft ? (
          // 読み込み成功後は、入力画面の内容を表示する。
          <ObjectionConfirmation
            reasonType={draft.reasonType}
            reasonDetail={draft.reasonDetail}
          />
        ) : (
          // sessionStorageの読み込み中、またはデータがない場合。
          <p>入力内容を読み込んでいます...</p>
        )}
        {/* 戻る、またはモック送信を実行するボタン。 */}
        <ObjectionConfirmActions
          onBack={() => {
            router.back();
          }}
          onSubmit={handleSubmit}
          disabled={!draft}
        />
      </ObjectionConfirmContent>
      {/* モバイル画面下部の共通ナビゲーション。 */}
      <BottomNavigation />
    </>
  );
}