"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/UI/Card";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { setPersistence, browserLocalPersistence, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CompanyLoginFormProps {
  onSwitchForm: (formType: "companyPreSignup" | "passwordReset" | "companyCodeRequest") => void;
}

export function CompanyLoginForm({ onSwitchForm }: CompanyLoginFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/companydashboard");
    } catch (error: any) {
      console.error("ログインエラー:", error);

      let errorMessage = (
        <div>
          ログインに失敗しました。
          <br />
          メールアドレスまたはパスワードをご確認ください。
        </div>
      );

      if (error.code === "auth/user-not-found") {
        errorMessage = (
          <div>
            ユーザーが見つかりません。
            <br />
            メールアドレスをご確認ください。
          </div>
        );
      } else if (error.code === "auth/wrong-password") {
        errorMessage = (
          <div>
            パスワードが間違っています。
            <br />
            もう一度お試しください。
          </div>
        );
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = (
          <div>
            ログイン試行が多すぎます。
            <br />
            しばらくしてから再試行してください。
          </div>
        );
      }

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        style: {
          fontSize: "14px",
          maxWidth: "300px",
          padding: "10px",
          margin: "0 auto",
          background: "#ffcccb",
          textAlign: "center",
          borderRadius: "8px",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <ToastContainer />
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full text-white h-10 ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#F9BFCE]"}`}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
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
