"use client";

import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useRouter, useParams } from "next/navigation";

const TaskPage: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [tab, setTab] = useState<"problem" | "preview">("problem");
  const [code, setCode] = useState<string>(""); // ユーザーが書くコード
  const [sampleCode, setSampleCode] = useState<string>(""); // サンプルコード
  const [problemDescription, setProblemDescription] = useState<string>("");

  useEffect(() => {
    // 仮想データ取得処理。FirestoreやAPI経由で取得する部分に置き換えられます。
    const fetchTaskData = async () => {
      const taskData = {
        problemDescription: `
        # 問題文
        - ここに問題文を記載します。
        - Reactを使ってカウントボタンを実装してください。
        `,
        sampleCode: `export default function App() {
  return <h1>Hello, World!</h1>;
}`,
      };
      setProblemDescription(taskData.problemDescription);
      setSampleCode(taskData.sampleCode);
    };
    fetchTaskData();
  }, [id]);

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleSubmit = () => {
    // 提出時の処理
    if (code.includes("function App")) {
      alert("正解！次のタスクに進めます！");
      router.push(`/task/${parseInt(id as string) + 1}`);
    } else {
      alert("不正解です。もう一度試してください。");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 flex justify-between">
        <h1 className="text-lg font-bold">Task #{id}</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm text-blue-500 hover:underline"
        >
          ダッシュボードに戻る
        </button>
      </header>
      <main className="flex flex-col lg:flex-row">
        {/* 左サイドバー */}
        <div className="w-full lg:w-1/2 bg-white border-r">
          <div className="tabs flex justify-center border-b">
            <button
              className={`flex-1 p-4 ${
                tab === "problem" ? "border-b-2 border-blue-500 text-blue-500" : ""
              }`}
              onClick={() => setTab("problem")}
            >
              問題文
            </button>
            <button
              className={`flex-1 p-4 ${
                tab === "preview" ? "border-b-2 border-blue-500 text-blue-500" : ""
              }`}
              onClick={() => setTab("preview")}
            >
              サンプルプレビュー
            </button>
          </div>
          <div className="p-4">
            {tab === "problem" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">問題文</h2>
                <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
                  {problemDescription}
                </pre>
              </div>
            )}
            {tab === "preview" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">サンプルコード</h2>
                <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
                  {sampleCode}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 右エディター */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <MonacoEditor
            height="400px"
            defaultLanguage="javascript"
            defaultValue={sampleCode}
            value={code}
            onChange={handleCodeChange}
          />
          <button
            onClick={handleSubmit}
            className="mt-4 mx-auto px-6 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600"
          >
            提出する
          </button>
        </div>
      </main>
    </div>
  );
};

export default TaskPage;
