"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth, confirmPasswordReset } from "firebase/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();

  // クエリパラメータから oobCode を取得（Firebase から提供されたリセットコード）
  const oobCode = searchParams.get("oobCode");

  const handlePasswordReset = async () => {
    if (!oobCode) {
      setMessage("無効なリセットリンクです。");
      return;
    }

    try {
      const auth = getAuth();
      await confirmPasswordReset(auth, oobCode, newPassword);
      setMessage("パスワードのリセットに成功しました。ログインページに移動します。");
      
      // 3秒後にログインページにリダイレクト
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (error) {
      console.error("パスワードリセットエラー:", error);
      setMessage("パスワードのリセットに失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10 p-4 space-y-3 bg-white rounded-lg shadow-lg">
      <h1 className="text-center text-xl font-semibold">パスワードのリセット</h1>
      {message && <p className="text-center text-red-500">{message}</p>}
      <div className="space-y-2">
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="新しいパスワード"
          className="h-10"
        />
      </div>
      <Button className="w-full bg-blue-500 text-white h-10" onClick={handlePasswordReset}>
        パスワードをリセットする
      </Button>
    </div>
  );
}
