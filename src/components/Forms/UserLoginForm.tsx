"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/UI/Card";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface UserLoginFormProps {
  onSwitchForm: (formType: "signup" | "passwordReset" | "companyCodeRequest") => void;
}

export function UserLoginForm({ onSwitchForm }: UserLoginFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("ログインエラー:", error);

      let errorMessage = "ログインに失敗しました。もう一度お試しください。";
      if (error.code === "auth/user-not-found") {
        errorMessage = "ユーザーが見つかりません。アカウントをお持ちでない場合は、サインアップしてください。";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "パスワードが正しくありません。再度お試しください。";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "無効なメールアドレスです。正しい形式で入力してください。";
      }

      toast.error(
        <div>
          {errorMessage.split("。").map((msg, index) => (
            <p key={index} style={{ margin: 0 }}>
              {msg}
              {index !== errorMessage.split("。").length - 1 && "。"}
            </p>
          ))}
        </div>,
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          progress: undefined,
          style: {
            fontSize: "14px",
            maxWidth: "300px",
            padding: "10px",
            margin: "0 auto",
            background: "#ffcccb",
            textAlign: "center",
            borderRadius: "8px",
          },
        }
      );
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh] mx-auto">
      <ToastContainer />
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
