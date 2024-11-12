"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardHeader, CardTitle, CardContent, CardFooter } from "@/components/UI/Card";
import { Label } from "@/components/UI/Label";
import { Input } from "@/components/UI/Input";
import { Button } from "@/components/UI/Button";
import { auth, db } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLoginForm(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleAdminLogin = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        const userRef = doc(db, "admins", userCredential.user.uid); 
        const userDoc = await getDoc(userRef);

        if (userDoc.exists() && userDoc.data().role === "admin") {
          router.push("/admindashboard");
        } else {
          throw new Error("管理者権限がありません。");
        }
      }
    } catch (error: any) {
      console.error("ログインエラー:", error);
      toast.error("ログインに失敗しました。もう一度お試しください。", {
        position: "top-center",
        autoClose: 3000,
        style: { backgroundColor: "#ffcccb", textAlign: "center" },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-4 space-y-3 bg-white rounded-lg shadow-lg overflow-y-auto max-h-[80vh] mx-auto">
      <ToastContainer />
      <CardHeader>
        <CardTitle className="text-center text-xl font-semibold">管理者ログイン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {errorMessage && <p className="text-red-500 text-center">{errorMessage}</p>}
        <div className="space-y-1">
          <Label htmlFor="email">メールアドレス</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレス"
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
      </CardContent>
      <CardFooter>
        <Button className="w-full bg-[#AEC6CF] text-white h-10" onClick={handleAdminLogin} disabled={loading}>
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </CardFooter>
    </div>
  );
}
