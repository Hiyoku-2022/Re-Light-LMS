"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/UI/Card";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface CompanySignUpFormProps {
  onSwitchForm: (formType: "signup" | "login" | "passwordReset" | "companyLogin") => void;
}

export function CompanySignUpForm({ onSwitchForm }: CompanySignUpFormProps): JSX.Element {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const generateCompanyCode = () => {
    return `COMP-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      toast.error("パスワードが一致しません。", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: true,
        style: { fontSize: "14px", maxWidth: "250px", padding: "10px", textAlign: "center" },
      });
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        const companyCode = generateCompanyCode();

        await setDoc(doc(db, "companies", userCredential.user.uid), {
          companyName: companyName,
          contactName: contactName,
          email: email,
          companyCode: companyCode,
          role: "companyRepresentative",
          createdAt: new Date().toISOString(),
        });

        await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "companySignup",
            to: email,
            userName: contactName,
            companyCode: companyCode,
          }),
        });

        // 成功時のトーストを表示
        toast.success("サインアップが完了しました！企業コードがメールで送信されました。", {
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
            background: "#B0E57C",
            textAlign: "center",
            borderRadius: "8px",
          },
        });

        setTimeout(() => {
          router.push("/companydashboard");
        }, 3000);
      }
    } catch (error: any) {
      console.error("サインアップエラー:", error);

      let errorMessage = (
        <div>
          サインアップに失敗しました。
          <br />
          もう一度お試しください。
        </div>
      );
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = (
          <div>
            このメールアドレスは既に使用されています。
          </div>
        );
      } else if (error.code === "auth/invalid-email") {
        errorMessage = (
          <div>
            無効なメールアドレスです。
            <br />
            正しい形式で入力してください。
          </div>
        );
      } else if (error.code === "auth/weak-password") {
        errorMessage = (
          <div>
            パスワードが短すぎます。
            <br />
            6文字以上のパスワードを設定してください。
          </div>
        );
      }
      
      toast.error(errorMessage, {
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh]">
      <ToastContainer />
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">企業アカウント作成</CardTitle>
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
            disabled={loading}
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
            disabled={loading}
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
            disabled={loading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#F9BFCE] text-white h-10" onClick={handleSignUp} disabled={loading}>
          {loading ? "登録中..." : "サインアップ"}
        </Button>
      </CardFooter>
      <p className="text-center text-sm text-muted-foreground">
        すでにアカウントをお持ちですか?{" "}
        <span className="text-blue-600 cursor-pointer" onClick={() => onSwitchForm("companyLogin")}>
          ログイン
        </span>
      </p>
    </div>
  );
}

export default CompanySignUpForm;
