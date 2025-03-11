import { NextResponse } from "next/server";
import { adminDb } from "@/utils/firebaseAdmin";
import { Firestore } from "firebase-admin/firestore";

const courses = [
  { id: "html", title: "HTML", description: "まずはウェブサイトに文字を表示する方法から学んでいきましょう。", image: "/HTML.svg" },
  { id: "css", title: "CSS", description: "コースを終了すると、Webアプリやサイトのデザインを作成するスキルが身につきます。", image: "/CSS.svg" },
  { id: "bootstrap", title: "Bootstrap", description: "開発をより高速に進めることができるようになります。", image: "/Bootstrap.svg" },
  { id: "javascript", title: "JavaScript", description: "画面に動きをつけたり、サーバーと情報を送信することができるようになります。", image: "/JavaScript.svg" },
  { id: "php", title: "PHP", description: "オンラインショップ機能を実装したWebサイトを開発できるようになります。", image: "/PHP.svg" },
  { id: "cs1", title: "CS初級", description: "データと関数について理解を深め、コンピュータを扱うためのスキルを身につけていきます。", image: "/cs1.svg" },
  { id: "cs2", title: "CS中級", description: "抽象化、再帰、スコープ、制御フロー、オブジェクト、リストについて学習します。", image: "/cs2.svg" },
  { id: "cs3", title: "CS上級", description: "連結リスト、スタック、キュー、木構造、ソフトウェアテストについて学習します。", image: "/cs3.svg" },
  { id: "database", title: "Database", description: "データベースについて理解を深め、効率的なデータ管理を行う方法を学んでいきます。", image: "/DataBase.svg" },
  { id: "git", title: "Git", description: "Gitの基本的な仕組みを学習します。コマンド、ファイルの状態、ブランチについて学習していきます。", image: "/git.svg" },
  { id: "oop", title: "オブジェクト指向", description: "カプセル化、継承、ポリモーフィズム等について詳しく学習していきます。", image: "/oop.svg" },
  { id: "blog", title: "ブログシステム", description: "このコースでは、ブログシステムを開発することで、WEBアプリケーションの基本的なCRUD操作を学びます。", image: "/blog.svg" },
  { id: "task", title: "タスク管理アプリ", description: "このコースでは、タスク管理アプリケーションを開発することで、Laravelフレームワークの基本的なMVCアーキテクチャとルーティングについて学びます。", image: "/task.svg" },
  { id: "auth", title: "認証機能付きAPI", description: "このコースでは、認証機能付きAPIを開発することで信頼性が高く、安全なAPIを開発するための基盤を築くことができます。", image: "/auth.svg" },
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
