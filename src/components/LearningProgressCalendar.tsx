"use client";

import React, { useState, useEffect } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

interface Progress {
  completedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

export default function LearningProgressCalendar() {
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const { getAuth } = await import("firebase/auth");
        const auth = getAuth();
        const token = await auth.currentUser?.getIdToken();

        if (!token) {
          throw new Error("User is not authenticated");
        }

        const response = await fetch(`/api/progress?token=${token}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch progress data: ${response.statusText} - ${errorText}`);
        }

        const progress: Progress[] = await response.json();

        // 日付ごとのカウントを計算
        const dateCountMap: Record<string, number> = {};
        progress.forEach((item) => {
          const date = new Date(item.completedAt._seconds * 1000).toISOString().split("T")[0];
          dateCountMap[date] = (dateCountMap[date] || 0) + 1;
        });

        console.log("Date Count Map:", dateCountMap);

        // ヒートマップ用のデータ形式に変換
        const activityData = Object.entries(dateCountMap).map(([date, count]) => ({
          date,
          count,
        }));

        console.log("Activity Data for Calendar:", activityData);

        setActivityData(activityData);
      } catch (error) {
        console.error("Error fetching progress data:", error);
      }
    };

    fetchProgressData();
  }, []);

  return (
    <div className="flex justify-center items-center p-4">
      <CalendarHeatmap
        startDate={new Date("2024-01-01")}
        endDate={new Date("2024-12-31")}
        values={activityData}
        classForValue={(value) => {
          console.log("Rendering value:", value); // 値を確認
          if (!value) {
            return "color-empty";
          }
          if (value.count > 7) {
            return "color-high";
          }
          if (value.count > 3) {
            return "color-medium";
          }
          return "color-low";
        }}
      />
      <style jsx global>{`
        .color-empty {
          fill: #ebedf0;
        }
        .color-low {
          fill: #c6e48b;
        }
        .color-medium {
          fill: #7bc96f;
        }
        .color-high {
          fill: #239a3b;
        }
      `}</style>
    </div>
  );
}
