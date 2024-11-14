import { NextRequest, NextResponse } from "next/server";
import { 
  sendSignupConfirmationEmail, 
  sendPasswordResetEmail, 
  sendCompanySignupConfirmationEmail 
} from "@/services/emailService";

export async function POST(request: NextRequest) {
  const { type, to, userName, resetLink, companyCode } = await request.json();

  console.log("リクエストデータ:", { type, to, userName, resetLink, companyCode });

  try {
    switch (type) {
      case "signup":
        console.log("サインアップ確認メールを送信中...");
        await sendSignupConfirmationEmail(to, userName);
        break;
      case "passwordReset":
        console.log("パスワードリセットメールを送信中...");
        await sendPasswordResetEmail(to, resetLink);
        break;
      case "companySignup":
        console.log("企業サインアップ確認メールを送信中...");
        await sendCompanySignupConfirmationEmail(to, userName, companyCode);
        break;
      default:
        console.log("無効なリクエストタイプ:", type);
        return NextResponse.json({ error: "無効なリクエストタイプです。" }, { status: 400 });
    }

    console.log("メール送信成功");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`メール送信エラー: ${(error as Error).message}`);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
