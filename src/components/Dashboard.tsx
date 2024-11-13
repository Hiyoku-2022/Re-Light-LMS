"use client"; 

import { useEffect, useState } from "react";
import { Card } from "@/components/UI/Card";
import Image from "next/image";
import LearningProgressCalendar from "@/components/LearningProgressCalendar";
import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Header } from "@/components/UI/Header";
import { FiLock } from "react-icons/fi"; // 鍵アイコン用

export function Dashboard() {
  const [tutorialsCount, setTutorialsCount] = useState(0);
  const [problemsCount, setProblemsCount] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState("0:00");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", "USER_ID");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setTutorialsCount(userData.tutorialsCount || 0);
          setProblemsCount(userData.problemsCount || 0);
          setTotalWatchTime(userData.totalWatchTime || "0:00");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    fetchData();
  }, []);

  const courses = [
    { id: "html", title: "HTML", description: "まずはウェブサイトに文字を表示する方法から学んでいきましょう。", image: "/HTML.svg" },
    { id: "css", title: "CSS", description: "Webアプリやサイトのデザインを作成するスキルが身につきます。", image: "/CSS.svg" },
    { id: "bootstrap", title: "Bootstrap", description: "開発をより高速に進めることができるようになります。", image: "/Bootstrap.svg" },
    { id: "javascript", title: "JavaScript", description: "画面に動きをつけたり、サーバーと情報を送信することができます。", image: "/JavaScript.svg" },
    { id: "php", title: "PHP", description: "オンラインショップ機能を実装したWebサイトを開発できるようになります。", image: "/PHP.svg" },
    { id: "database", title: "DataBase", description: "データベースについて理解を深め、効率的なデータ管理を学びます。", image: "/DataBase.svg" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 relative">
      {/* Sidebar が前面に来るように z-50 を指定 */}
      <Header dashboardType="user" onToggleSidebar={() => {}} className="z-50" />
      <main className="container mx-auto p-4 z-10 relative">
        <section className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="md:flex-1 bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-bold mb-2">学習進捗カレンダー</h2>
            <div className="w-full h-40">
              <LearningProgressCalendar />
            </div>
          </div>
          <div className="lg:w-1/3 bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-bold mb-2">進捗状況</h2>
            <div className="flex justify-around items-center space-x-2">
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full flex items-center justify-center w-28 h-28">
                  <span className="text-3xl font-bold">{tutorialsCount}</span>
                </div>
                <div className="text-sm mt-2">チュートリアル</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full flex items-center justify-center w-16 h-16">
                  <span className="text-xl font-bold">{problemsCount}</span>
                </div>
                <div className="text-sm mt-2">問題</div>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full flex items-center justify-center w-24 h-24">
                  <span className="text-3xl font-bold">{totalWatchTime}</span>
                </div>
                <div className="text-sm mt-2">総学習時間</div>
              </div>
            </div>
          </div>
        </section>

        {/* コースリストの表示 */}
        <section className="mt-8">
          <h2 className="text-xl font-bold text-navy mb-4">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="p-4 h-full flex flex-col justify-between opacity-50 cursor-not-allowed relative">
                <div className="absolute top-2 right-2">
                  <FiLock className="text-gray-600 text-2xl" />
                </div>
                <Image src={course.image} alt={course.title} width={150} height={150} className="h-36 w-64 object-cover mb-4" />
                <div className="flex-grow">
                  <h3 className="text-lg text-light-blue mb-2">{course.title}</h3>
                  <p className="text-light-gray">{course.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-white shadow mt-auto">
        <div className="container mx-auto p-4 flex justify-center items-center">
          <div className="text-gray-500 text-center">© 2024 - Re-Light. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
