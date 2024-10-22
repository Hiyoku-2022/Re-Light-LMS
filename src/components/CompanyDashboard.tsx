"use client";

import { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { SVGProps } from "react";
import { db, auth } from "lib/firebase"; // Firebase設定のインポート
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export function CompanyDashboard() {
  const [users, setUsers] = useState<{ name: string; progress: string; value: number }[]>([]);
  const [companyCode, setCompanyCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ログイン中の担当者の companyCode を取得
  useEffect(() => {
    const fetchCompanyCode = async (uid: string) => {
      try {
        const companyDoc = await getDoc(doc(db, "companies", uid));
        if (companyDoc.exists()) {
          const companyData = companyDoc.data();
          setCompanyCode(companyData.companyCode); // companyCode を設定
        }
      } catch (error) {
        console.error("Company Code の取得中にエラーが発生しました:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchCompanyCode(user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  // 会社コードを使って社員ユーザーのデータを取得
  useEffect(() => {
    if (!companyCode) return;

    const fetchUserData = async () => {
      try {
        const q = query(collection(db, "users"), where("companyCode", "==", companyCode));
        const usersSnapshot = await getDocs(q);
        const usersData = usersSnapshot.docs.map((doc) => {
          const data = doc.data();
          const completedContents = data.completedContents || 0;
          const totalContents = data.totalContents || 0;
          const progressValue = totalContents > 0 ? Math.round((completedContents / totalContents) * 100) : 0;
          return {
            name: data.name || "不明なユーザー",
            progress: `${completedContents}/${totalContents}`,
            value: progressValue,
          };
        });
        setUsers(usersData);
      } catch (error) {
        console.error("社員データの取得中にエラーが発生しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [companyCode]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <Image src="/Logo.svg" alt="Logo" width={40} height={40} className="h-10 w-10" />
            <span className="text-xl text-soft-blue font-semibold">Re-Light LMS</span>
          </div>
        </div>
      </header>
      <main className="container mx-auto p-4 flex-1">
        {/* 上位ユーザーの表示セクション */}
        <section className="grid grid-cols-3 gap-4 mt-4">
          <Card className="p-4">
            <CardTitle className="text-sm font-medium">総学習時間（全体概要）</CardTitle>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">平均動画視聴時間</p>
              <div className="text-2xl font-bold">00:00</div>
            </div>
          </Card>
          <Card className="p-4">
            <CardTitle className="text-sm font-medium">平均学習時間</CardTitle>
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">平均学習時間</p>
              <div className="text-2xl font-bold">00:00</div>
            </div>
          </Card>
          <Card className="p-4">
            <CardTitle className="text-sm font-medium">上位ユーザー</CardTitle>
            <div className="mt-2 space-y-1">
              {users.slice(0, 3).map((user, index) => (
                <UserProgress key={index} name={user.name} value={user.value} />
              ))}
            </div>
          </Card>
        </section>

        {/* 活動概要セクション */}
        <section className="p-4 bg-white rounded shadow mt-6">
          <CardTitle className="text-sm font-medium">活動概要</CardTitle>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">最近のアクティブユーザー</p>
              <div className="text-2xl font-bold text-blue-600">{users.length} ユーザー</div>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground">非アクティブユーザー</p>
              <div className="text-2xl font-bold text-blue-600">0%</div>
            </Card>
          </div>
        </section>

        {/* 社員ユーザーのテーブル表示 */}
        <section className="p-4 bg-white rounded shadow mt-6 flex-1">
          <Input type="text" placeholder="ユーザー名で検索" className="w-full mb-4" />
          {loading ? (
            <div>データを読み込み中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー名</TableHead>
                  <TableHead>進捗状況</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{user.progress}</span>
                        <Progress value={user.value} className="w-1/2 bg-blue-300" /> {/* 幅を調整 */}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        詳細を開く
                        <ChevronDownIcon className="ml-1 w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>
      </main>
      <footer className="bg-white shadow mt-auto">
        <div className="container mx-auto p-4 flex justify-between">
          <div className="space-x-4"></div>
          <div className="text-gray-500">© 2024 - Re-Light. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

// 個別ユーザーの進捗コンポーネント
function UserProgress({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex justify-between text-xs">
      <span>{name}</span>
      <span>{value}%</span>
      <Progress value={value} className="w-1/2 bg-blue-300" /> {/* ステータスバーの長さを変更 */}
    </div>
  );
}

// `ChevronDownIcon` の定義
function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export default CompanyDashboard;
