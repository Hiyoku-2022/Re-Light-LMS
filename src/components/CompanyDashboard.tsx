"use client";

import { useState, useEffect } from "react";
import { Card, CardTitle } from "@/components/UI/Card";
import { Progress } from "@/components/UI/Progress";
import Image from "next/image";
import { Input } from "@/components/UI/Input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/UI/Table";
import { Button } from "@/components/UI/Button";
import { SVGProps } from "react";
import { db, auth } from "lib/firebase";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Header } from "@/components/UI/Header";

export function CompanyDashboard() {
  const [users, setUsers] = useState<{ name: string; progress: string; value: number }[]>([]);
  const [companyCode, setCompanyCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyCode = async (uid: string) => {
      try {
        const companyDoc = await getDoc(doc(db, "companies", uid));
        if (companyDoc.exists()) {
          const companyData = companyDoc.data();
          setCompanyCode(companyData.companyCode);
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
    <div className="min-h-screen flex flex-col bg-white">
      <Header dashboardType="company" onToggleSidebar={() => {}} />
      <main className="container mx-auto p-4 flex-1 ">
        {/* 上位ユーザーの表示セクション */}
        <section className="p-4 bg-gray-100 rounded-xl shadow mt-6">
          <CardTitle className="text-sm font-medium">総学習時間（全体概要）</CardTitle>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
            <Card className="p-4 rounded-xl shadow">
              <p className="text-xs text-muted-foreground">平均動画視聴時間</p>
              <div className="text-2xl font-bold text-sky-blue">00:00</div>
            </Card>
            <Card className="p-4 rounded-xl shadow">
              <p className="text-xs text-muted-foreground">平均学習時間</p>
              <div className="text-2xl font-bold text-sky-blue">00:00</div>
            </Card>
            <Card className="p-4 rounded-xl shadow">
              <p className="text-xs text-muted-foreground">上位3ユーザー</p>
              <div className="mt-2 space-y-1">
                {users.slice(0, 3).map((user, index) => (
                  <UserProgress key={index} name={user.name} value={user.value} />
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* 活動概要セクション */}
        <section className="p-4 bg-gray-100 rounded-xl shadow mt-6">
          <CardTitle className="text-sm font-medium">活動概要</CardTitle>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <Card className="p-4 rounded-xl shadow">
              <p className="text-xs text-muted-foreground">最近のアクティブユーザー</p>
              <div className="text-2xl font-bold text-sky-blue">{users.length} ユーザー</div>
            </Card>
            <Card className="p-4 rounded-xl shadow">
              <p className="text-xs text-muted-foreground">非アクティブユーザー</p>
              <div className="text-2xl font-bold text-sky-blue">0%</div>
            </Card>
          </div>
        </section>

        {/* 社員ユーザーのテーブル表示 */}
        <section className="p-4 bg-gray-100 rounded-xl shadow mt-6 flex-1">
          <Input type="text" placeholder="ユーザー名で検索" className="w-full mb-4 rounded-full shadow" />
          {loading ? (
            <div>データを読み込み中...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ユーザー名</TableHead>
                  <TableHead>進捗状況</TableHead>
                  <TableHead>{""}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-muted-foreground">{user.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">{user.progress}</span>
                        <Progress value={user.value} className="w-1/2 bg-blue-300" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
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
        <div className="container mx-auto p-4 flex justify-center items-center">
          <div className="flex-1 flex justify-start">
            {/* TODO プライバシー利用規約に関しては固まり次第実装 */}
          </div>
          <div className="text-gray-500 text-center">© 2024 - Re-Light. All rights reserved.</div>
          <div className="flex-1"></div>
        </div>
      </footer>
    </div>
  );
}

// 個別ユーザーの進捗コンポーネント
function UserProgress({ name, value }: { name: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-xs space-x-2">
      <span className="text-xs text-muted-foreground ml-4">{name}</span>
      <div className="w-1/2 flex items-center space-x-2">
        <Progress value={value} className="bg-blue-300" />
        <span>{value}%</span>
      </div>
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
