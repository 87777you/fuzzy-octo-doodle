"use client";

import { useState } from "react";
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

// APIが未実装でも画面を確認できるようにする仮のタスク情報。
const mockObjectionData = {
  taskTitle: "毎日ストレッチする",
  deadline: "2025/04/25 23:59",
  submitter: { name: "りく", avatarUrl: "/images/pazul.jpg" },
  evidenceImages: [
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真1" },
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真2" },
  ],
  memo: "朝に10分ストレッチしました！\n肩まわりがすっきりしました。",
};

// バックエンドのReasonTypeに合わせた異議理由の表示設定。
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
  { value: "other", title: "その他", description: "上記以外の理由" },
];

export default function ObjectionPage() {
  // URLのtaskIdを使って、入力内容をタスクごとに保存する。
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();

  // 選択中の異議理由。初期状態では「証拠が不十分」を選択する。
  const [reasonType, setReasonType] = useState<ObjectionReasonType | null>(
    "insufficient_evidence",
  );

  // ユーザーが入力した異議の詳細理由。
  const [reasonDetail, setReasonDetail] = useState("");

  // 入力内容を一時保存して、確認画面へ遷移する。
  const handleSubmit = () => {
    // 理由と詳細理由がない場合は送信できない。
    if (!reasonType || !reasonDetail.trim()) return;

    // APIが使えないため、確認画面とのデータ受け渡しにsessionStorageを使う。
    sessionStorage.setItem(
      `objection-draft:${taskId}`,
      JSON.stringify({
        reasonType,
        reasonDetail: reasonDetail.trim(),
      }),
    );
    router.push(`/tasks/${taskId}/objection/confirm`);
  };

  return (
    <>
      {/* ページタイトルと戻るボタンを表示する。 */}
      <PageHeader title="異議申し立て" />
      <ObjectionPageContent>
        {/* 異議対象となるタスクの基本情報。 */}
        <TaskInfoCard
          title={mockObjectionData.taskTitle}
          deadline={mockObjectionData.deadline}
          submitter={mockObjectionData.submitter}
        />

        {/* 提出された証拠写真を表示する。 */}
        <ImagePreview images={mockObjectionData.evidenceImages} />

        {/* 提出者が付けたメモを表示する。 */}
        <SubmitterMemo memo={mockObjectionData.memo} />

        {/* 異議の理由を1つ選択する。 */}
        <ObjectionReasonSelector
          options={reasonOptions}
          value={reasonType}
          onChange={setReasonType}
        />

        {/* 異議の具体的な内容を入力する。 */}
        <ObjectionDetailForm
          value={reasonDetail}
          onChange={setReasonDetail}
        />

        {/* 入力済みの場合だけ確認画面へ進める。 */}
        <SubmitObjectionButton
          disabled={!reasonType || !reasonDetail.trim()}
          onClick={handleSubmit}
        />
      </ObjectionPageContent>

      {/* モバイル画面下部の共通ナビゲーション。 */}
      <BottomNavigation />
    </>
  );
}
