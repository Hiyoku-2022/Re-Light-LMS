"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CompanyFinalSignUpFormProps {
  companyName: string; // 仮登録された企業名
  contactName: string; // 仮登録された担当者名
  email: string; // 仮登録されたメールアドレス
  onSignUpComplete: () => void; // サインアップ完了時の処理を追加（遷移用など）
}

export function CompanyFinalSignUpForm({
  companyName,
  contactName,
  email,
  onSignUpComplete,
}: CompanyFinalSignUpFormProps): JSX.Element {
  const [password, setPassword] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  const handleFinalSignUp = () => {
    // 最終サインアップ処理（Firebase などの処理をここに記述）
    console.log("最終サインアップ中...");
    console.log(`企業名: ${companyName}, 担当者名: ${contactName}, メールアドレス: ${email}, パスワード: ${password}, 企業コード: ${companyCode}`);

    // サインアップが成功した場合の処理（例：画面遷移など）
    onSignUpComplete();
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">企業最終登録</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="companyName">企業名</Label>
          <Input
            id="companyName"
            value={companyName}
            placeholder="企業名"
            className="h-10"
            disabled // 仮登録された企業名を表示（編集不可）
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactName">担当者名</Label>
          <Input
            id="contactName"
            value={contactName}
            placeholder="担当者名"
            className="h-10"
            disabled // 仮登録された担当者名を表示（編集不可）
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            value={email}
            placeholder="メールアドレス"
            type="email"
            className="h-10"
            disabled // 仮登録されたメールアドレスを表示（編集不可）
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
      </CardContent>
      <CardFooter>
        <Button
          className="w-full bg-[#F9BFCE] text-white h-10"
          onClick={handleFinalSignUp}
        >
          サインアップ
        </Button>
      </CardFooter>
    </div>
  );
}

export default CompanyFinalSignUpForm;
