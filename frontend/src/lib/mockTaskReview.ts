import { mockPosts } from "./mockFeed";

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

// API 未接続のレビュー・異議画面で使う表示用サンプル。
export function getMockTaskReview(taskId: string) {
  const post = mockPosts.find((item) => item.taskId === taskId);
  if (!post) return null;

  const isReviewing = post.status === "審査中" || post.status === "reviewing";
  const reviewEndsAt = isReviewing ? post.reviewEndsAt : undefined;
  const submittedAt = reviewEndsAt
    ? new Date(Date.parse(reviewEndsAt) - 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  return {
    taskTitle: post.taskTitle,
    deadline: post.deadlineAt
      ? formatDateTime(post.deadlineAt)
      : "未設定（サンプル）",
    submitter: {
      name: post.userName,
      ...(post.avatarUrl !== undefined ? { avatarUrl: post.avatarUrl } : {}),
    },
    evidenceImages: isReviewing
      ? [{ src: "/images/pazul.jpg", alt: "画面確認用の証拠写真" }]
      : [],
    memo: isReviewing ? "画面確認用のサンプルです。" : "",
    submittedAt,
    reviewEndsAt,
    canObject: isReviewing,
  };
}
