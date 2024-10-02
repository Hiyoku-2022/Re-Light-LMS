"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // useRouterをインポート
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface SignupFormProps {
  onSwitchForm: (formType: "login" | "passwordReset") => void;
}

export function SignupForm({ onSwitchForm }: SignupFormProps): JSX.Element {
  const [isCompanyUser, setIsCompanyUser] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const router = useRouter(); // useRouterフックを初期化

  const handleSignUp = async () => {
    try {
      if (password !== confirmPassword) {
        alert("パスワードが一致しません。");
        return;
      }

      // Firebase Authentication でユーザーを作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Firestore にユーザー情報を保存
      if (userCredential.user) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: email,
          isCompanyUser: isCompanyUser,
          companyCode: isCompanyUser ? companyCode : null,
        });
      }

      alert("サインアップが完了しました！");
      
      // サインアップ成功後、ダッシュボードにリダイレクト
      router.push("/dashboard"); // dashboard ページにリダイレクト
    } catch (error) {
      console.error("サインアップエラー:", error);
      alert("サインアップに失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">ユーザーサインアップ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name">名前</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="名前"
            className="h-10"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">メール</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メール"
            type="email"
            className="h-10"
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
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-password">パスワード確認</Label>
          <Input
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="パスワード確認"
            type="password"
            className="h-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="company-user"
            checked={isCompanyUser}
            onCheckedChange={(checked) => setIsCompanyUser(!!checked)}
            style={{ backgroundColor: "#B0E57C" }}
          />
          <Label htmlFor="company-user">企業ユーザー</Label>
        </div>
        {isCompanyUser && (
          <div className="space-y-1">
            <Label htmlFor="company-code">会社コード</Label>
            <Input
              id="company-code"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              placeholder="会社コード"
              className="h-10"
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#B0E57C] text-white h-10" onClick={handleSignUp}>
          サインアップ
        </Button>
      </CardFooter>
      <p className="text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちですか?{" "}
        <span className="text-blue-600 cursor-pointer" onClick={() => onSwitchForm("login")}>
          ログイン
        </span>
      </p>
      <p className="text-center text-sm text-muted-foreground">
        パスワードを忘れた方は{" "}
        <span className="text-blue-600 cursor-pointer" onClick={() => onSwitchForm("passwordReset")}>
          こちら
        </span>
      </p>
    </div>
  );
}

export default SignupForm;
