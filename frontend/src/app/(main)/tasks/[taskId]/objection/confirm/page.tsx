"use client";

import { useRouter } from "next/navigation";
import { BottomNavigation } from "../../../../../../components/layout/BottomNavigation";
import { ObjectionConfirmActions } from "../../../../../../components/layout/ObjectionConfirmActions";
import { ObjectionConfirmation } from "../../../../../../components/layout/ObjectionConfirmation";
import { ObjectionConfirmContent } from "../../../../../../components/layout/ObjectionConfirmContent";
import { PageHeader } from "../../../../../../components/layout/PageHeader";
import { SubmitterMemo } from "../../../../../../components/layout/SubmitterMemo";
import { TaskInfoCard } from "../../../../../../components/tasks/TaskInfoCard";
import { ImagePreview } from "../../../../../../components/ui/ImagePreview";
import type { ObjectionReasonType } from "../../../../../../components/layout/ObjectionReasonSelector";

const mockData = {
  taskId: "task-1",
  taskTitle: "毎日ストレッチする",
  deadline: "2025/04/25 23:59",
  submitter: { name: "りく", avatarUrl: "/images/pazul.jpg" },
  evidenceImages: [
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真1" },
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真2" },
  ],
  memo: "朝に10分ストレッチしました！\n肩まわりがすっきりしました。",
  reasonType: "insufficient_evidence" as ObjectionReasonType,
  reasonDetail: "写真の内容から、実際にストレッチをしたことを確認できません。",
};

export default function ObjectionConfirmPage() {
  const router = useRouter();

  const handleSubmit = () => {
    const mockRequest = {
      reason_type: mockData.reasonType,
      reason_detail: mockData.reasonDetail,
    };
    void mockRequest;
    router.push(`/tasks/${mockData.taskId}/objection/complete`);
  };

  return (
    <>
      <PageHeader title="内容の確認" />
      <ObjectionConfirmContent>
        <TaskInfoCard
          title={mockData.taskTitle}
          deadline={mockData.deadline}
          submitter={mockData.submitter}
        />
        <ImagePreview images={mockData.evidenceImages} />
        <SubmitterMemo memo={mockData.memo} />
        <ObjectionConfirmation
          reasonType={mockData.reasonType}
          reasonDetail={mockData.reasonDetail}
        />
        <ObjectionConfirmActions
          onBack={() => router.back()}
          onSubmit={handleSubmit}
        />
      </ObjectionConfirmContent>
      <BottomNavigation />
    </>
  );
}