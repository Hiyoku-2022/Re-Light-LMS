"use client";

import { useState } from "react";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/UI/Card";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface PasswordResetRequestFormProps {
  onSwitchForm: (formType: "login" | "signup" | "companyLogin") => void;
}

export function PasswordResetRequestForm({ onSwitchForm }: PasswordResetRequestFormProps): JSX.Element {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePasswordResetRequest = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success("パスワードリセットのメールを送信しました。ご確認ください。", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
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
          router.push("/");
        }, 3000);
      } else {
        toast.error("リクエストに失敗しました。もう一度お試しください。", {
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
            background: "#ffcccb",
            textAlign: "center",
            borderRadius: "8px",
          },
        });
      }
    } catch (error) {
      console.error("パスワードリセットエラー:", error);
      toast.error("エラーが発生しました。もう一度お試しください。", {
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
            disabled={loading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full h-10 text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#AEC6CF]"}`}
          onClick={handlePasswordResetRequest}
          disabled={loading}
        >
          {loading ? "送信中..." : "送信する"}
        </Button>
      </CardFooter>
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
