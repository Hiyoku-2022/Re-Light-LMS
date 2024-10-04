"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // useRouter フックを使用
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/firebase"; // Firebaseの設定をインポート
import { createUserWithEmailAndPassword } from "firebase/auth"; // Firebase Authentication
import { doc, setDoc } from "firebase/firestore"; // Firestore へのデータ保存
import { toast, ToastContainer } from "react-toastify"; // toast と ToastContainer をインポート
import "react-toastify/dist/ReactToastify.css"; // toastify のスタイルシートをインポート

interface CompanySignUpFormProps {
  onSwitchForm: (formType: "signup" | "login" | "passwordReset" | "companyLogin") => void;
}

export function CompanySignUpForm({ onSwitchForm }: CompanySignUpFormProps): JSX.Element {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ランダムな企業コードを生成する関数
  const generateCompanyCode = () => {
    return `COMP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  };

  // サインアップ処理
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      // パスワード不一致のトーストを表示
      toast.error("パスワードが一致しません。", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        style: { fontSize: "14px", maxWidth: "250px", padding: "10px", textAlign: "center" },
      });
      return;
    }

    setLoading(true);

    try {
      // Firebase Authentication でユーザーを作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        // 企業コードを生成
        const companyCode = generateCompanyCode();

        // Firestore に企業情報を保存
        await setDoc(doc(db, "companies", userCredential.user.uid), {
          companyName: companyName,
          contactName: contactName,
          email: email,
          companyCode: companyCode,
          role: "companyRepresentative", // ロールを追加
          createdAt: new Date().toISOString(),
        });

        // 企業登録完了メールを送信
        await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "companySignup", // メールテンプレートタイプ
            to: email, // 受信者のメールアドレス
            userName: contactName, // 担当者名を送信
            companyCode: companyCode, // 自動生成された企業コード
          }),
        });

        // 成功時のトーストを表示
        toast.success("サインアップが完了しました！企業コードがメールで送信されました。", {
          position: "top-center", // トーストを画面上部中央に配置
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          style: {
            fontSize: "14px",
            maxWidth: "300px", // トーストの最大幅を設定
            padding: "10px", // パディングを調整
            margin: "0 auto", // 自動マージンで中央に配置
            background: "#B0E57C",
            textAlign: "center",
            borderRadius: "8px",
          },
        });

        // 3秒後にダッシュボードにリダイレクト
        setTimeout(() => {
          router.push("/companydashboard");
        }, 3000);
      }
    } catch (error: any) {
      console.error("サインアップエラー:", error);

      // Firebase エラーコードに応じてエラートーストを表示
      let errorMessage = (
        <div>
          サインアップに失敗しました。
          <br />
          もう一度お試しください。
        </div>
      );
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = (
          <div>
            このメールアドレスは既に使用されています。
          </div>
        );
      } else if (error.code === "auth/invalid-email") {
        errorMessage = (
          <div>
            無効なメールアドレスです。
            <br />
            正しい形式で入力してください。
          </div>
        );
      } else if (error.code === "auth/weak-password") {
        errorMessage = (
          <div>
            パスワードが短すぎます。
            <br />
            6文字以上のパスワードを設定してください。
          </div>
        );
      }
      
      // エラートーストを表示
      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
        style: {
          fontSize: "14px",
          maxWidth: "300px",
          padding: "10px",
          margin: "0 auto",
          background: "#ffcccb",
          textAlign: "center",
          borderRadius: "8px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <ToastContainer /> {/* ToastContainer を追加 */}
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">企業アカウント作成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="companyName">企業名</Label>
          <Input
            id="companyName"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="企業名"
            className="h-10"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactName">担当者名</Label>
          <Input
            id="contactName"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="担当者名"
            className="h-10"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            type="email"
            className="h-10"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            type="password"
            className="h-10"
            required
            disabled={loading}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirmPassword">パスワード確認</Label>
          <Input
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="パスワード確認"
            type="password"
            className="h-10"
            required
            disabled={loading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#F9BFCE] text-white h-10" onClick={handleSignUp} disabled={loading}>
          {loading ? "登録中..." : "サインアップ"}
        </Button>
      </CardFooter>
      <p className="text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちですか?{" "}
        <span className="text-blue-600 cursor-pointer" onClick={() => onSwitchForm("companyLogin")}>
          ログイン
        </span>
      </p>
    </div>
  );
}

export default CompanySignUpForm;
