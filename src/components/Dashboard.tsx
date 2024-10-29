"use client"; 

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import LearningProgressCalendar from "@/components/LearningProgressCalendar";
import { db } from "@/firebase"; // Firebase インスタンスのインポート
import { doc, getDoc } from "firebase/firestore"; // Firestore からのデータ取得用

export function Dashboard() {
  const [tutorialsCount, setTutorialsCount] = useState(0);
  const [problemsCount, setProblemsCount] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState("0:00");

  // Firestore からデータを取得して状態に保存
  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", "USER_ID"); // ここでユーザーIDを指定
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

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Image src="/Logo.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
            <span className="text-xl text-soft-blue font-semibold">Re-Light LMS</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4">
        {/* 学習進捗と進捗状況を横並びにする */}
        <section className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          {/* 学習進捗カレンダー */}
          <div className="md:flex-1 bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-bold mb-2">学習進捗カレンダー</h2>
            <div className="w-full h-40">
              <LearningProgressCalendar />
            </div>
          </div>
          {/* 進捗状況 */}
          <div className="lg:w-1/3 bg-white rounded-lg p-4 shadow-md">
            <h2 className="text-lg font-bold mb-2">進捗状況</h2>
            <div className="flex justify-around items-center space-x-2">
              {/* チュートリアル円 */}
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full flex items-center justify-center w-28 h-28">
                  <span className="text-3xl font-bold">{tutorialsCount}</span>
                </div>
                <div className="text-sm mt-2">チュートリアル</div>
              </div>
              {/* 問題円 */}
              <div className="flex flex-col items-center">
                <div className="bg-blue-100 text-blue-600 rounded-full flex items-center justify-center w-16 h-16">
                  <span className="text-xl font-bold">{problemsCount}</span>
                </div>
                <div className="text-sm mt-2">問題</div>
              </div>
              {/* 総動画閲覧時間円 */}
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
            {/* 各コンテンツをリンクでラップ */}
            <Link href="/courses/html">
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                <Image src="/HTML.svg" alt="HTML" width={150} height={150} className="h-36 w-64 object-cover mb-4" />
                <div className="flex-grow">
                  <h3 className="text-lg text-light-blue mb-2">HTML</h3>
                  <p className="text-light-gray">まずはウェブサイトに文字を表示する方法から学んでいきましょう。</p>
                </div>
              </Card>
            </Link>
            <Link href="/courses/css">
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                <Image src="/CSS.svg" alt="CSS" width={150} height={150} className="h-36 w-64 object-cover mb-4" />
                <div className="flex-grow">
                  <h3 className="text-lg text-light-blue mb-2">CSS</h3>
                  <p className="text-light-gray">コースを終了すると、Webアプリやサイトのデザインを作成するスキルが身につきます。</p>
                </div>
              </Card>
            </Link>
            <Link href="/courses/bootstrap">
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                <Image src="/Bootstrap.svg" alt="Bootstrap" width={150} height={150} className="h-36 w-64 object-cover mb-4" />
                <div className="flex-grow">
                  <h3 className="text-lg text-light-blue mb-2">Bootstrap</h3>
                  <p className="text-light-gray">開発をより高速に進めることができるようになります。</p>
                </div>
              </Card>
            </Link>
            <Link href="/courses/javascript">
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                <Image src="/JavaScript.svg" alt="JavaScript" width={150} height={150} className="h-36 w-64 object-cover mb-4" />
                <div className="flex-grow">
                  <h3 className="text-lg text-light-blue mb-2">JavaScript</h3>
                  <p className="text-light-gray">画面に動きをつけたり、サーバーと情報を送信することができるようになります。</p>
                </div>
              </Card>
            </Link>
            <Link href="/courses/php">
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                <Image src="/PHP.svg" alt="HTML" width={150} height={150} className="h-36 w-64 object-cover mb-4" />
                <div className="flex-grow">
                  <h3 className="text-lg text-light-blue mb-2">PHP</h3>
                  <p className="text-light-gray">オンラインショップ機能を実装したWebサイトを開発できるようになります。</p>
                </div>
              </Card>
            </Link>
            <Link href="/courses/database">
              <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                <Image src="/DataBase.svg" alt="HTML" width={150} height={150} className="h-36 w-64 object-cover mb-4" />
                <div className="flex-grow">
                  <h3 className="text-lg text-light-blue mb-2">DataBase</h3>
                  <p className="text-light-gray">データベースについて理解を深め、効率的なデータ管理を行う方法を学んでいきます。</p>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      </main>
      <footer className="bg-white shadow mt-8">
        <div className="container mx-auto p-4 flex justify-between">
          <div className="text-gray-500">© 2024 - Re-Light. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
