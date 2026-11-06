
import { PageHeader } from "../../../../../components/layout/PageHeader";
import { BottomNavigation } from "../../../../../components/layout/BottomNavigation";
import { TaskInfoCard } from "../../../../../components/tasks/TaskInfoCard";

export default function EvidencePage() {
  return (
    <>
      <PageHeader title="証拠提出" backHref="/" />

      <main style={{ padding: "20px" }}>
        <TaskInfoCard
          title="毎日ストレッチする"
          deadline="2025/04/25 23:59"
        />
      </main>

      <BottomNavigation />
    </>
  );
}
