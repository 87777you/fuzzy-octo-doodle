"use client";

import { PageHeader } from "../../../../../components/layout/PageHeader";
import { ObjectionButton } from "../../../../../components/layout/ObjectionButton";
import { ReviewStatusPanel } from "../../../../../components/layout/ReviewStatusPanel";
import { SubmitterMemo } from "../../../../../components/layout/SubmitterMemo";
import { TaskInfoCard } from "../../../../../components/tasks/TaskInfoCard";
import { BottomNavigation } from "../../../../../components/layout/BottomNavigation";
import { ImagePreview } from "../../../../../components/ui/ImagePreview";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ReviewData {
  taskId: string;
  taskTitle: string;
  submitter: {
    name: string;
    avatarUrl?: string;
  };
  deadline: string;
  evidenceImages: {
    src: string;
    alt: string;
  }[];
  memo?: string;
  submittedAt: string;
  reviewEndsAt: string;
}

const mockReviewData: ReviewData = {
  taskId: "task-1",
  taskTitle: "毎日ストレッチする",
  submitter: {
    name: "りく",
    avatarUrl: "/images/pazul.jpg",
  },
  deadline: "2025/04/25 23:59",
  evidenceImages: [
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真1" },
    { src: "/images/pazul.jpg", alt: "ストレッチの証拠写真2" },
  ],
  memo: "朝に10分ストレッチしました！\n肩まわりがすっきりしました。",
  submittedAt: "2025/04/20 08:12",
  reviewEndsAt: "2026-11-02T22:42:00+09:00",
};

export default function ReviewHome() {
  const { taskId } = useParams<{ taskId: string }>();
  const router = useRouter();
  const [data, setData] = useState<ReviewData>(mockReviewData);

  useEffect(() => {
    async function loadReview() {
      try {
        const response = await fetch(`/api/tasks/${taskId}`);
        if (!response.ok) return;

        const reviewData = (await response.json()) as ReviewData;
        setData(reviewData);
      } catch {
        // API未実装時は仮データを表示する。
      }
    }

    void loadReview();
  }, [taskId]);

  return (
    <>
      <PageHeader title="証拠の確認" />
      <TaskInfoCard
        title={data.taskTitle}
        deadline={data.deadline}
        submitter={{
          name: data.submitter.name,
          ...(data.submitter.avatarUrl !== undefined
            ? { avatarUrl: data.submitter.avatarUrl }
            : {}),
        }}
      />
      <ImagePreview images={data.evidenceImages} />
      {data.memo && <SubmitterMemo memo={data.memo} />}
      <ReviewStatusPanel
        submittedAt={data.submittedAt}
        reviewEndsAt={data.reviewEndsAt}
      />
      <ObjectionButton
        onClick={() => {
          router.push(`/tasks/${taskId}/objection`);
        }}
      />
      <BottomNavigation />
    </>
  );
}