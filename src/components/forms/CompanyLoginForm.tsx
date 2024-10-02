"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CompanyLoginFormProps {
  onSwitchForm: (formType: "companyPreSignup" | "passwordReset" | "companyCodeRequest") => void; // フォーム切り替え用の関数
}

export function CompanyLoginForm({ onSwitchForm }: CompanyLoginFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
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
        <div className="space-y-1">
          <Label htmlFor="companyCode">企業コード</Label>
          <Input
            id="companyCode"
            value={companyCode}
            onChange={(e) => setCompanyCode(e.target.value)}
            placeholder="企業コード"
            className="h-10"
            required
          />
        </div>
        <p className="text-left text-sm text-muted-foreground">
          企業コードを忘れた方は{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => onSwitchForm("companyCodeRequest")}
          >
            こちら
          </span>
        </p>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#F9BFCE] text-white h-10">ログイン</Button>
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
