"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/UI/Card";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export function AdminSignUpForm(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toast.error("パスワードが一致しません。", { position: "top-center", autoClose: 2000 });
      return;
    }

    if (adminCode !== process.env.NEXT_PUBLIC_ADMIN_CODE) {
      toast.error("管理者用コードが無効です。", { position: "top-center", autoClose: 2000 });
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await setDoc(doc(db, "admins", userCredential.user.uid), {
          email: email,
          role: "admin",
          createdAt: new Date().toISOString(),
        });

        toast.success("管理者ユーザーが作成されました！", { position: "top-center", autoClose: 2000 });

        setTimeout(() => router.push("/admin"), 2000);
      }
    } catch (error) {
      console.error("管理者作成エラー:", error);
      toast.error("管理者ユーザーの作成に失敗しました。", { position: "top-center", autoClose: 2000 });
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh] mx-auto">
      <ToastContainer />
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">管理者アカウント作成</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="admin-code">管理者用コード</Label>
          <Input
            id="admin-code"
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            placeholder="管理者用コードを入力"
            className="h-10"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="管理者メールアドレス"
            className="h-10"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">パスワード</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            className="h-10"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-password">パスワード確認</Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="パスワード確認"
            className="h-10"
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#F9BFCE] text-white h-10 mt-4" onClick={handleSignUp}>
          管理者登録
        </Button>
      </CardFooter>
    </div>
  );
}

export default AdminSignUpForm;
