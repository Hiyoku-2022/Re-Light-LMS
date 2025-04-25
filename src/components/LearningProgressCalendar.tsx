"use client";

import React, { useState, useEffect, useCallback } from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

interface Progress {
  completedAt: { _seconds: number; _nanoseconds: number };
}

const getYearRange = (year: number) => ({
  start: new Date(`${year}-01-01`),
  end: new Date(`${year}-12-31`),
});

export default function LearningProgressCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [activityData, setActivityData] = useState<{ date: string; count: number }[]>([]);
  const currentYear = new Date().getFullYear();

  const fetchProgressData = useCallback(async (targetYear: number) => {
    try {
      const { getAuth } = await import("firebase/auth");
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("User is not authenticated");

      const response = await fetch(`/api/progress?token=${token}`);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch progress data: ${response.statusText} - ${errorText}`);
      }
      const progress: Progress[] = await response.json();
      const dateCountMap: Record<string, number> = {};
      progress.forEach((item) => {
        if (item.completedAt && item.completedAt._seconds) {
          const dateObj = new Date(item.completedAt._seconds * 1000);
          if (dateObj.getFullYear() !== targetYear) return;
          const date = dateObj.toISOString().split("T")[0];
          dateCountMap[date] = (dateCountMap[date] || 0) + 1;
        } else {
          console.warn("Skipping invalid progress item:", item);
        }
      });
      setActivityData(Object.entries(dateCountMap).map(([date, count]) => ({ date, count })));
    } catch (error) {
      console.error("Error fetching progress data:", error);
    }
  }, []);

  useEffect(() => {
    fetchProgressData(year);
  }, [year, fetchProgressData]);

  const handlePrevYear = () => setYear((y) => y - 1);
  const handleNextYear = () => setYear((y) => y + 1);

  const { start, end } = getYearRange(year);

  return (
    <div className="flex flex-col items-center p-4">
      <CalendarHeatmap
        startDate={start}
        endDate={end}
        values={activityData}
        classForValue={(value) => {
          if (!value) return "color-empty";
          if (value.count > 7) return "color-high";
          if (value.count > 3) return "color-medium";
          return "color-low";
        }}
      />
      <div className="flex justify-between items-center mt-4 w-full max-w-md text-sm text-gray-600">
        {/* 前年ボタン */}
        <button
          onClick={handlePrevYear}
          className="flex items-center hover:text-gray-900"
          aria-label="前年に移動"
        >
          <span className="mr-1">←</span>
          <span>{year - 1}</span>
        </button>

        {/* 現在の年 */}
        <span className="font-semibold text-lg">{year}</span>

        {/* 翌年ボタン */}
        <button
          onClick={handleNextYear}
          className="flex items-center hover:text-gray-900"
          aria-label="翌年に移動"
          style={{ visibility: year < currentYear ? 'visible' : 'hidden' }}
        >
          <span>{year + 1}</span>
          <span className="ml-1">→</span>
        </button>
      </div>
      <style jsx global>{`
        .color-empty { fill: #ebedf0; }
        .color-low   { fill: #c6e48b; }
        .color-medium{ fill: #7bc96f; }
        .color-high  { fill: #239a3b; }
      `}</style>
    </div>
  );
}
