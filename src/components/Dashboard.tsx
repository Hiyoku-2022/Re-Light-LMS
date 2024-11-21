"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/UI/Card";
import Image from "next/image";
import Link from "next/link";
import LearningProgressCalendar from "@/components/LearningProgressCalendar";
import { db } from "@/firebase";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Header } from "@/components/UI/Header";
import { FiLock } from "react-icons/fi";
import { query, collection, where, getDocs } from "firebase/firestore";

export function Dashboard() {
  const [tutorialsCount, setTutorialsCount] = useState(0);
  const [problemsCount, setProblemsCount] = useState(0);
  const [totalWatchTime, setTotalWatchTime] = useState("0:00");
  const [unlockedCourses, setUnlockedCourses] = useState<string[]>(["html"]);
  const [loading, setLoading] = useState(true); // 初期ローディング状態
  const [user, setUser] = useState<User | null>(null); // ログインユーザー情報
  const auth = getAuth();
  const router = useRouter();

  // ユーザー進捗データを取得
  const fetchUserProgress = async (userId: string) => {
    try {
      const progressQuery = query(
        collection(db, "progress"),
        where("userId", "==", userId)
      );
      const snapshot = await getDocs(progressQuery);

      let tutorials = 0;
      let problems = 0;
      let totalTime = 0; // 総学習時間を分単位で計算

      snapshot.forEach((doc) => {
        const progress = doc.data();
        if (progress.isCompleted) { // 完了しているもののみ加算
          if (progress.type === "content") {
            tutorials++;
          } else if (progress.type === "task") {
            problems++;
          }
          totalTime += progress.estimatedTime || 0; // `estimatedTime`を加算
        }
      });

      setTutorialsCount(tutorials);
      setProblemsCount(problems);
      setTotalWatchTime(`${Math.floor(totalTime / 60)}:${String(totalTime % 60).padStart(2, "0")}`);
    } catch (error) {
      console.error("Error fetching user progress:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // ログインしているユーザーを設定
        await fetchUserProgress(currentUser.uid); // ユーザーの進捗状況を取得
      } else {
        router.push("/"); // 未認証の場合はトップページへ
      }
      setLoading(false); // ローディング完了
    });

    return () => unsubscribe(); // クリーンアップ
  }, [auth, router]);

  const courses = [
    { id: "html", title: "HTML", description: "まずはウェブサイトに文字を表示する方法から学んでいきましょう。", image: "/HTML.svg" },
    { id: "css", title: "CSS", description: "コースを終了すると、Webアプリやサイトのデザインを作成するスキルが身につきます。", image: "/CSS.svg" },
    { id: "bootstrap", title: "Bootstrap", description: "開発をより高速に進めることができるようになります。", image: "/Bootstrap.svg" },
    { id: "javascript", title: "JavaScript", description: "画面に動きをつけたり、サーバーと情報を送信することができるようになります。", image: "/JavaScript.svg" },
    { id: "php", title: "PHP", description: "オンラインショップ機能を実装したWebサイトを開発できるようになります。", image: "/PHP.svg" },
    { id: "database", title: "DataBase", description: "データベースについて理解を深め、効率的なデータ管理を行う方法を学んでいきます。", image: "/DataBase.svg" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header dashboardType="user" onToggleSidebar={() => {}} />
      <main className="container mx-auto p-4 pt-20">
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
        <section className="mt-8">
          <h2 className="text-xl font-bold text-navy mb-4">Featured Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div key={course.id}>
                {unlockedCourses.includes(course.id) ? (
                  <Link href={`/courses/${course.id}`}>
                    <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow h-full flex flex-col justify-between">
                      <Image
                        src={course.image}
                        alt={course.title}
                        width={150}
                        height={150}
                        className="h-36 w-64 object-cover mb-4"
                      />
                      <div className="flex-grow">
                        <h3 className="text-lg text-light-blue mb-2">{course.title}</h3>
                        <p className="text-light-gray">{course.description}</p>
                      </div>
                    </Card>
                  </Link>
                ) : (
                  <Card
                    key={course.id}
                    className="p-4 h-full flex flex-col justify-between opacity-50 cursor-not-allowed relative"
                  >
                    <div className="absolute top-2 right-2">
                      <FiLock className="text-gray-600 text-2xl" />
                    </div>
                    <Image
                      src={course.image}
                      alt={course.title}
                      width={150}
                      height={150}
                      className="h-36 w-64 object-cover mb-4"
                    />
                    <div className="flex-grow">
                      <h3 className="text-lg text-light-blue mb-2">{course.title}</h3>
                      <p className="text-light-gray">{course.description}</p>
                    </div>
                  </Card>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="bg-white shadow mt-auto">
        <div className="container mx-auto p-4 flex justify-center items-center">
          <div className="flex-1"></div>
          <div className="text-gray-500 text-center">© 2024 - Re-Light. All rights reserved.</div>
          <div className="flex-1"></div>
        </div>
      </footer>
    </div>
  );
}

export default Dashboard;
