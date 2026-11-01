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
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const [reasonType, setReasonType] = useState<ObjectionReasonType | null>(
    "insufficient_evidence",
  );
  const [reasonDetail, setReasonDetail] = useState("");

  const handleSubmit = () => {
    if (!reasonType || !reasonDetail.trim()) return;

    router.push(`/tasks/${taskId}/objection/confirm`);
  };

  return (
    <>
      <PageHeader title="異議申し立て" />
      <ObjectionPageContent>
        <TaskInfoCard
          title={mockObjectionData.taskTitle}
          deadline={mockObjectionData.deadline}
          submitter={mockObjectionData.submitter}
        />
        <ImagePreview images={mockObjectionData.evidenceImages} />
        <SubmitterMemo memo={mockObjectionData.memo} />
        <ObjectionReasonSelector
          options={reasonOptions}
          value={reasonType}
          onChange={setReasonType}
        />
        <ObjectionDetailForm
          value={reasonDetail}
          onChange={setReasonDetail}
        />
        <SubmitObjectionButton
          disabled={!reasonType || !reasonDetail.trim()}
          onClick={handleSubmit}
        />
      </ObjectionPageContent>
      <BottomNavigation />
    </>
  );
}
