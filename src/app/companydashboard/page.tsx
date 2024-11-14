"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { CompanyDashboard } from "@/components/CompanyDashboard";
import { ClipLoader } from "react-spinners";
import { onAuthStateChanged } from "firebase/auth";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUserRole = async (user: any) => {
      try {
        const userDoc = await getDoc(doc(db, "companies", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData?.role === "companyRepresentative") {
            setHasAccess(true);
          } else {
            router.push("/");
          }
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("ユーザーデータの取得エラー:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        checkUserRole(user);
      } else {
        router.push("/");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <ClipLoader color="#09f" loading={loading} size={50} />
      </div>
    );
  }

  return hasAccess ? (
    <div>
      <CompanyDashboard />
    </div>
  ) : null;
}
