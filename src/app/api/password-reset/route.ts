import { NextRequest, NextResponse } from "next/server";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getUserByEmail } from "@/services/userService";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  try {
    // メールアドレスでユーザーを検索
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, error: "ユーザーが見つかりません。" }, { status: 404 });
    }

    // Firebase Auth インスタンスを取得
    const auth = getAuth();

    // 環境変数からアプリケーション URL を取得
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // `actionCodeSettings` を指定してリセットリンクのリダイレクト先を設定
    const actionCodeSettings = {
      url: `${appUrl}`, // カスタムパスワードリセットページの URL を設定
      handleCodeInApp: true, // このオプションを true に設定すると、リンクをクリックしたときにアプリ内で処理されます
    };

    // `sendPasswordResetEmail` 関数を使用してリセットメールを送信
    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    return NextResponse.json({ success: true, message: "パスワードリセットメールを送信しました。" });
  } catch (error) {
    console.error("パスワードリセットエラー:", error);
    return NextResponse.json({ success: false, error: "パスワードリセットに失敗しました。" }, { status: 500 });
  }
}
