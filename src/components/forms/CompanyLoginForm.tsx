"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // useRouter をインポート
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signInWithEmailAndPassword } from "firebase/auth"; // Firebase のログイン関数をインポート
import { auth } from "@/firebase"; // Firebase の設定ファイルをインポート
import { toast, ToastContainer } from "react-toastify"; // toast 関数と ToastContainer をインポート
import "react-toastify/dist/ReactToastify.css"; // toastify のスタイルシートをインポート

interface CompanyLoginFormProps {
  onSwitchForm: (formType: "companyPreSignup" | "passwordReset" | "companyCodeRequest") => void; // フォーム切り替え用の関数
}

export function CompanyLoginForm({ onSwitchForm }: CompanyLoginFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // ログイン処理
  const handleLogin = async () => {
    setLoading(true); // ローディング状態を設定
    try {
      // Firebase Authentication を使用してログイン
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // ログイン成功した場合、トースト通知を表示し、3秒後に`/companydashboard` へリダイレクト
      toast.success("ログインに成功しました！企業ダッシュボードに移動します。", {
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

      setTimeout(() => {
        router.push("/companydashboard");
      }, 3000); // 3秒後にダッシュボードにリダイレクト
    } catch (error: any) {
      // ログインエラー時の処理
      console.error("ログインエラー:", error);

      // エラーに応じたトースト通知を表示
      let errorMessage = (
        <div>
          ログインに失敗しました。
          <br />
          メールアドレスまたはパスワードをご確認ください。
        </div>
      );

      if (error.code === "auth/user-not-found") {
        errorMessage = (
          <div>
            ユーザーが見つかりません。
            <br />
            メールアドレスをご確認ください。
          </div>
        );
      } else if (error.code === "auth/wrong-password") {
        errorMessage = (
          <div>
            パスワードが間違っています。
            <br />
            もう一度お試しください。
          </div>
        );
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = (
          <div>
            ログイン試行が多すぎます。
            <br />
            しばらくしてから再試行してください。
          </div>
        );
      }

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
      setLoading(false); // ローディング状態を解除
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <ToastContainer /> {/* トースト表示用のコンテナ */}
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">企業ログイン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
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
            disabled={loading} // ローディング中は入力を無効化
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
            disabled={loading} // ローディング中は入力を無効化
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full text-white h-10 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#F9BFCE]"}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </CardFooter>
      <p className="text-center text-sm text-muted-foreground">
        新規登録は{" "}
        <span
          className="text-blue-600 cursor-pointer"
          onClick={() => onSwitchForm("companyPreSignup")}
        >
          こちら
        </span>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        パスワードを忘れた方は{" "}
        <span
          className="text-blue-600 cursor-pointer"
          onClick={() => onSwitchForm("passwordReset")}
        >
          こちら
        </span>
      </p>
    </div>
  );
}

export default CompanyLoginForm;
