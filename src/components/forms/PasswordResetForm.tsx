"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/UI/Card";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";

export function PasswordResetForm(): JSX.Element {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handlePasswordReset = () => {
    if (password !== confirmPassword) {
      console.error("パスワードが一致しません。");
      return;
    }
    console.log("パスワードリセット中...");
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <Card className="w-full max-w-md p-6 space-y-4 bg-white rounded-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">パスワードリセット</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">新しいパスワード</Label>
            <Input
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="新しいパスワード"
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
          <Button
            className="w-full bg-[#AEC6CF] text-white h-10"
            onClick={handlePasswordReset}
          >
            登録する
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default PasswordResetForm;
