"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/firebase"; // Firebase Auth と Firestore をインポート
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLoginForm(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージ用の状態変数
  const router = useRouter();

  // 管理者ログイン処理
  const handleAdminLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      // Firebase Authentication でログインを試行
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        // Firestore からユーザーロールを確認
        const userRef = doc(db, "admins", userCredential.user.uid); // `admins` コレクションを参照
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().role === "admin") {
          // 管理者ユーザーであれば、ダッシュボードにリダイレクト
          toast.success("ログインに成功しました！", {
            position: "top-center",
            autoClose: 2000,
            hideProgressBar: false,
            style: { backgroundColor: "#B0E57C", textAlign: "center" },
          });
          setTimeout(() => {
            router.push("/admindashboard"); // 管理者専用のダッシュボードへリダイレクト
          }, 2000);
        } else {
          // ロールが `admin` でない場合はエラー
          throw new Error("管理者権限がありません。");
        }
      }
    } catch (error: any) {
      console.error("ログインエラー:", error);
      toast.error("ログインに失敗しました。もう一度お試しください。", {
        position: "top-center",
        autoClose: 3000,
        style: { backgroundColor: "#ffcccb", textAlign: "center" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh] mx-auto">
      <ToastContainer />
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">管理者ログイン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        <div className="space-y-1">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="h-10"
            required
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
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#AEC6CF] text-white h-10" onClick={handleAdminLogin} disabled={loading}>
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </CardFooter>
    </div>
  );
}
