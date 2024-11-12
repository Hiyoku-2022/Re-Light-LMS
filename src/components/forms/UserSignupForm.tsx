"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/UI/Card";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Checkbox } from "@/components/UI/Checkbox";
import { Button } from "@/components/UI/Button";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      if (password !== confirmPassword) {
        toast.error("パスワードが一致しません。", {
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
        });
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        await setDoc(doc(db, "users", userCredential.user.uid), {
          name: name,
          email: email,
          isCompanyUser: isCompanyUser,
          companyCode: isCompanyUser ? companyCode : null,
        });

        toast.success("サインアップが完了しました！", {
          position: "top-center",
          autoClose: 2000,
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
            background: "#B0E57C",
            textAlign: "center",
            borderRadius: "8px",
          },
        });

        setTimeout(() => {
          router.push("/dashboard");
        }, 3000);
      }
    } catch (error: any) {
      console.error("サインアップエラー:", error);

      let errorMessage = "サインアップに失敗しました。もう一度お試しください。";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "このメールアドレスは既に使用されています。";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "無効なメールアドレスです。";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "パスワードが短すぎます。6文字以上のパスワードを設定してください。";
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
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <ToastContainer />
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">ユーザーサインアップ</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="name">名前</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="名前" className="h-10" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">メール</Label>
          <Input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="メール" type="email" className="h-10" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">パスワード</Label>
          <Input id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="パスワード" type="password" className="h-10" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="confirm-password">パスワード確認</Label>
          <Input id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="パスワード確認" type="password" className="h-10" />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="company-user" checked={isCompanyUser} onCheckedChange={(checked) => setIsCompanyUser(!!checked)} style={{ backgroundColor: "#B0E57C" }} />
          <Label htmlFor="company-user">企業ユーザー</Label>
        </div>
        {isCompanyUser && (
          <div className="space-y-1">
            <Label htmlFor="company-code">会社コード</Label>
            <Input id="company-code" value={companyCode} onChange={(e) => setCompanyCode(e.target.value)} placeholder="会社コード" className="h-10" />
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
    </div>
  );
}

export default SignupForm;
