"use client";

import { useRouter } from "next/navigation";
import { BottomNavigation } from "../../../../../../components/layout/BottomNavigation";
import { ObjectionCompleteContent } from "../../../../../../components/layout/ObjectionCompleteContent";
import { ObjectionCompleteHero } from "../../../../../../components/layout/ObjectionCompleteHero";
import { ObjectionNextSteps } from "../../../../../../components/layout/ObjectionNextSteps";
import { ObjectionConfirmation } from "../../../../../../components/layout/ObjectionConfirmation";
import { PageHeader } from "../../../../../../components/layout/PageHeader";
import { Button } from "../../../../../../components/ui/Button";
import styles from "../../../../../../components/layout/ObjectionCompleteContent.module.css";
import { SubmitterMemo } from "../../../../../../components/layout/SubmitterMemo";
import { TaskInfoCard } from "../../../../../../components/tasks/TaskInfoCard";
import { ImagePreview } from "../../../../../../components/ui/ImagePreview";
import type { ObjectionReasonType } from "../../../../../../components/layout/ObjectionReasonSelector";

const mockData = {
  taskTitle: "毎日ストレッチする",
  deadline: "2025/04/25 23:59",
  submitter: { name: "りく", avatarUrl: "/images/pazul.jpg" },
  evidenceImages: [
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真1" },
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真2" },
  ],
  memo: "朝に10分ストレッチしました！\n肩まわりがすっきりしました。",
  submittedAt: "2025/04/20 08:12",
  reasonType: "insufficient_evidence" as ObjectionReasonType,
  reasonDetail: "写真ではストレッチの内容が確認できませんでした。",
};

export default function ObjectionCompletePage() {
  const router = useRouter();

  return (
    <>
      <PageHeader title="異議申し立て完了" />
      <ObjectionCompleteContent>
        <ObjectionCompleteHero />
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
        <ObjectionNextSteps />
        <div className={styles["action"]}>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={() => {
              router.push("/");
            }}
          >
            ‹ フレンドのタスク一覧に戻る
          </Button>
        </div>
      </ObjectionCompleteContent>
      <BottomNavigation />
    </>
  );
}