"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import Dashboard, { DashboardProps } from "@/components/Dashboard";

const DashboardPage = () => {
  const [data, setData] = useState<DashboardProps | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const response = await fetch(`/api/get-dashboard-data?userId=${user.uid}`);
          if (response.ok) {
            const result: DashboardProps = await response.json();
            setData(result);
          } else {
            console.error("Failed to fetch dashboard data");
          }
        } catch (error) {
          console.error("Error fetching dashboard data:", error);
        }
      } else {
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!data) {
    return <div>No data available</div>;
  }

  return <Dashboard {...data} />;
};

export default DashboardPage;
