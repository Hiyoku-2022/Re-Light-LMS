import { NextRequest, NextResponse } from "next/server";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { getUserByEmail } from "@/services/userService";

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  try {
    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json({ success: false, error: "ユーザーが見つかりません。" }, { status: 404 });
    }

    const auth = getAuth();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    const actionCodeSettings = {
      url: `${appUrl}`,
      handleCodeInApp: true,
    };

    await sendPasswordResetEmail(auth, email, actionCodeSettings);

    return NextResponse.json({ success: true, message: "パスワードリセットメールを送信しました。" });
  } catch (error) {
    console.error("パスワードリセットエラー:", error);
    return NextResponse.json({ success: false, error: "パスワードリセットに失敗しました。" }, { status: 500 });
  }
}
