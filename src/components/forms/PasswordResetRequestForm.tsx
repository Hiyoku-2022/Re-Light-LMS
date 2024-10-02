"use client";

import { useState } from "react";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface PasswordResetRequestFormProps {
  onSwitchForm: (formType: "login" | "signup" | "companyLogin") => void;
}

export function PasswordResetRequestForm({ onSwitchForm }: PasswordResetRequestFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [isCompanyUser, setIsCompanyUser] = useState(false);

  const handlePasswordResetRequest = () => {
    console.log("パスワードリセットリクエスト中...");
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">パスワードリセット</CardTitle>
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
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="company-user"
            checked={isCompanyUser}
            onCheckedChange={(checked) => setIsCompanyUser(!!checked)}
            style={{ backgroundColor: "#AEC6CF" }}
          />
          <Label htmlFor="company-user">企業ユーザー</Label>
        </div>
        {isCompanyUser && (
          <div className="space-y-1 mt-4">
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
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#AEC6CF] text-white h-10" onClick={handlePasswordResetRequest}>
          送信する
        </Button>
      </CardFooter>
      <p className="text-left text-sm text-muted-foreground">
        メールアドレスを入力してください。
        <br />
        企業ユーザーのかたはチェックボックスのチェックを入れ、企業コードを入力し送信してください。
      </p>
      <div className="text-right text-sm space-y-2 mt-4">
        <span className="text-blue-600 cursor-pointer" onClick={() => onSwitchForm("login")}>
          ログインに戻る
        </span>
        <br />
        <span className="text-blue-600 cursor-pointer" onClick={() => onSwitchForm("companyLogin")}>
          企業ログインはこちら
        </span>
      </div>
    </div>
  );
}

export default PasswordResetRequestForm;
