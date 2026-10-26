
"use client";

import { useState } from "react";
import { AppLayout } from "../../src/components/layout/AppLayout";
import { TaskStatsCard } from "../../src/components/tasks/TaskStatsCard";

export default function TestUIPage() {
  const [rate, setRate] = useState(68);
  const [active, setActive] = useState(3);
  const [overdue, setOverdue] = useState(1);

  return (
    <AppLayout title="共通コンポーネント確認">
      <div
        style={{
          maxWidth: 760,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <h2>TaskStatsCard</h2>

        <TaskStatsCard
          completionRate={rate}
          activeCount={active}
          overdueCount={overdue}
        />

        <div
          style={{
            display: "grid",
            gap: 12,
            padding: 16,
            background: "#fff",
            borderRadius: 12,
          }}
        >
          <label>
            達成率：{rate}%
            <input
              type="range"
              min={0}
              max={100}
              value={rate}
              onChange={(event) =>
                setRate(Number(event.target.value))
              }
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            進行中のタスク数
            <input
              type="number"
              min={0}
              value={active}
              onChange={(event) =>
                setActive(
                  Math.max(0, Number(event.target.value))
                )
              }
              style={{ display: "block", width: "100%" }}
            />
          </label>

          <label>
            期限切れのタスク数
            <input
              type="number"
              min={0}
              value={overdue}
              onChange={(event) =>
                setOverdue(
                  Math.max(0, Number(event.target.value))
                )
              }
              style={{ display: "block", width: "100%" }}
            />
          </label>
        </div>
      </div>
    </AppLayout>
  );
}
