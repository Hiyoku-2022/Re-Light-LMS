import { NextResponse } from "next/server";
import { verifyIdToken } from "@/utils/firebaseAdmin"; // 管理者 SDK 設定を含む
import { getFirestore } from "firebase-admin/firestore"; // Firestore へのアクセス

export async function GET(req: Request) {
  try {
    // クエリパラメータからトークンを取得
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Firebase Admin SDK を使ってトークンを検証
    const decodedToken = await verifyIdToken(token);
    const userId = decodedToken.uid;

    // Firestore から進捗データを取得
    const db = getFirestore();
    const progressSnapshot = await db
      .collection("progress")
      .where("userId", "==", userId)
      .get();

    // ドキュメントデータを配列に変換して返却
    const progressData = progressSnapshot.docs.map((doc) => doc.data());
    return NextResponse.json(progressData);
  } catch (error) {
    console.error("Error in /api/progress:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
