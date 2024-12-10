import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebaseAdmin";
import { Firestore } from "firebase-admin/firestore";

const courses = [
  { id: "html", title: "HTML", description: "まずはウェブサイトに文字を表示する方法から学んでいきましょう。", image: "/HTML.svg" },
  { id: "css", title: "CSS", description: "コースを終了すると、Webアプリやサイトのデザインを作成するスキルが身につきます。", image: "/CSS.svg" },
  { id: "bootstrap", title: "Bootstrap", description: "開発をより高速に進めることができるようになります。", image: "/Bootstrap.svg" },
  { id: "javascript", title: "JavaScript", description: "画面に動きをつけたり、サーバーと情報を送信することができるようになります。", image: "/JavaScript.svg" },
  { id: "php", title: "PHP", description: "オンラインショップ機能を実装したWebサイトを開発できるようになります。", image: "/PHP.svg" },
  { id: "database", title: "Database", description: "データベースについて理解を深め、効率的なデータ管理を行う方法を学んでいきます。", image: "/DataBase.svg" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
  }

  try {
    // Firestore コレクションへのクエリ実行
    const snapshot = await adminDb
      .collection("progress")
      .where("userId", "==", userId)
      .get();

    // 進捗データの初期化
    let tutorials = 0;
    let problems = 0;
    let totalTime = 0;
    const progressByTag: Record<string, boolean[]> = {};

    // データ処理
    snapshot.forEach((doc) => {
      const progress = doc.data() as {
        tag?: string;
        type: "content" | "task";
        isCompleted: boolean;
        estimatedTime?: number;
      };
      const tag = progress.tag || "";

      if (!progressByTag[tag]) {
        progressByTag[tag] = [];
      }
      progressByTag[tag].push(progress.isCompleted);

      if (progress.isCompleted) {
        if (progress.type === "content") {
          tutorials++;
        } else if (progress.type === "task") {
          problems++;
        }
        totalTime += progress.estimatedTime || 0;
      }
    });

    // コース解放ロジック
    const courseOrder = courses.map((course) => course.id);
    const unlockedCourses = ["html"];

    for (let i = 0; i < courseOrder.length; i++) {
      const currentTag = courseOrder[i];
      const nextTag = courseOrder[i + 1];

      if (progressByTag[currentTag]?.every((status) => status)) {
        if (nextTag) {
          unlockedCourses.push(nextTag);
        }
      } else {
        break;
      }
    }

    // JSON レスポンス
    return NextResponse.json({
      tutorialsCount: tutorials,
      problemsCount: problems,
      totalWatchTime: `${Math.floor(totalTime / 60)}:${String(totalTime % 60).padStart(2, "0")}`,
      unlockedCourses,
      courses,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
