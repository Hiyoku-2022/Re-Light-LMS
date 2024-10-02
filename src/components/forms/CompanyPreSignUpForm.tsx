"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CompanyPreSignUpFormProps {
  onSwitchForm: (formType: "signup" | "login" | "passwordReset" | "companyLogin") => void;
}

export function CompanyPreSignUpForm({ onSwitchForm }: CompanyPreSignUpFormProps): JSX.Element {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = () => {
    // 仮登録処理（Firebase などの処理をここに記述）
    console.log("仮登録中...");
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">企業仮登録</CardTitle>
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
          <Label htmlFor="confirmPassword">パスワード確認</Label>
          <Input
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="パスワード確認"
            type="password"
            className="h-10"
            required
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#F9BFCE] text-white h-10" onClick={handleSignUp}>
          サインアップ
        </Button>
      </CardFooter>
      {/* ログインフォームに切り替え用のリンク */}
      <p className="text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちですか?{" "}
        <span className="text-blue-600 cursor-pointer" onClick={() => onSwitchForm("companyLogin")}>
          ログイン
        </span>
      </p>
    </div>
  );
}

export default CompanyPreSignUpForm;
