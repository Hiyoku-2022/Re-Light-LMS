"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // useRouterをインポート
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { auth } from "@/firebase"; // Firebase Auth をインポート
import { signInWithEmailAndPassword } from "firebase/auth";

interface UserLoginFormProps {
  onSwitchForm: (formType: "signup" | "passwordReset" | "companyCodeRequest") => void;
}

export function UserLoginForm({ onSwitchForm }: UserLoginFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [isCompanyUser, setIsCompanyUser] = useState(false);
  const router = useRouter(); // useRouterフックを初期化

  const handleLogin = async () => {
    try {
      // Firebase Authentication を使用してユーザーのログインを試みる
      await signInWithEmailAndPassword(auth, email, password);
      alert("ログインに成功しました！");
      // ログイン成功時にダッシュボードページにリダイレクト
      router.push("/dashboard");
    } catch (error) {
      console.error("ログインエラー:", error);
      alert("ログインに失敗しました。もう一度お試しください。");
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">ユーザーログイン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
            className="h-10"
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
          />
        </div>
        <div className="flex items-center space-x-2 mt-4">
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
            <Label htmlFor="company-code">企業コード</Label>
            <Input
              id="company-code"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              placeholder="企業コード"
              className="h-10"
            />
          </div>
        )}
        {isCompanyUser && (
          <p className="text-left text-sm text-muted-foreground mt-2">
            企業コードを忘れた方は{" "}
            <span
              className="text-blue-600 cursor-pointer"
              onClick={() => onSwitchForm("companyCodeRequest")}
            >
              こちら
            </span>
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#B0E57C] text-white h-10 mt-4" onClick={handleLogin}>
          ログイン
        </Button>
      </CardFooter>
      <p className="text-center text-sm text-muted-foreground">
        新規登録は{" "}
        <span
          className="text-blue-600 cursor-pointer"
          onClick={() => onSwitchForm("signup")}
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

export default UserLoginForm;
