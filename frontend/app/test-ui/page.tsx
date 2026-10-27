
import { TaskStatsCard } from "../../src/components/tasks/TaskStatsCard";

export default function TestUIPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f7fc",
        padding: "40px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "430px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#17134a",
            marginBottom: "8px",
          }}
        >
          マイページ
        </h1>

        <h2
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#17134a",
            marginBottom: "20px",
          }}
        >
          今までのタスク状況
        </h2>

        <TaskStatsCard
          completionRate={70}
          completedCount={14}
          overdueCount={3}
        />
      </div>
    </main>
  );
}
