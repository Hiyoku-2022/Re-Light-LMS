"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CompanyCodeRequestForm(): JSX.Element {
  const [email, setEmail] = useState("");

  const handleCodeRequest = () => {
    // 会社コードリクエスト処理（Firebase などの処理をここに記述）
    console.log("会社コードリクエスト中...");
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">企業コードリクエスト</CardTitle>
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
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#AEC6CF] text-white h-10" onClick={handleCodeRequest}>
          送信する
        </Button>
      </CardFooter>
    </div>
  );
}

export default CompanyCodeRequestForm;
