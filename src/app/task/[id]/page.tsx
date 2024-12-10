"use client";

import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc, collection, query, where, getDocs, limit } from "firebase/firestore";
import { Header } from "@/components/UI/Header";

interface TaskData {
  title: string;
  taskText: string;
  sampleCode: Record<string, string>;
  modelAnswers: Record<string, string>;
  testCases: { input: string; expectedOutput: string }[];
  hint: string;
  previewCode: string;
  taskType: string;
  estimatedTime: number;
  stepOrder: number;
}

const TaskPage: React.FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [task, setTask] = useState<TaskData | null>(null);
  const [userCode, setUserCode] = useState<string>(""); // ユーザーのコード
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"problem" | "preview">("problem");
  const [previewTab, setPreviewTab] = useState<"sample" | "user">("sample"); // プレビューのサブタブ

  useEffect(() => {
    const fetchTaskData = async () => {
      try {
        const taskRef = doc(db, "contents", id);
        const taskSnap = await getDoc(taskRef);

        if (taskSnap.exists()) {
          const taskData = taskSnap.data() as TaskData;
          setTask(taskData);

          const initialCode = Object.values(taskData.sampleCode)[0] || "";
          setUserCode(initialCode);
        } else {
          console.error("タスクが見つかりませんでした。");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("タスクの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [id, router]);

  const handleCodeChange = (value: string | undefined) => {
    setUserCode(value || "");
  };

  const handleSubmit = async () => {
    if (!task) {
      alert("タスクが見つかりません。");
      return;
    }
  
    let allTestsPassed = true;
  
    // テストケースの評価
    for (const testCase of task.testCases) {
      const { input, expectedOutput } = testCase;
      try {
        const func = new Function("input", userCode); // ユーザーのコードを評価する関数を作成
        const result = func(input).toString(); // 実行結果
        if (result !== expectedOutput) {
          allTestsPassed = false;
          break;
        }
      } catch (error) {
        console.error("コード実行エラー:", error);
        allTestsPassed = false;
        break;
      }
    }
  
    if (allTestsPassed) {
      // 正解の場合は次のコンテンツに進む
      try {
        const nextOrder = task.stepOrder + 1;
        const nextContentQuery = query(
          collection(db, "contents"),
          where("stepOrder", "==", nextOrder),
          limit(1)
        );
  
        const querySnapshot = await getDocs(nextContentQuery);
        if (!querySnapshot.empty) {
          const nextContent = querySnapshot.docs[0];
          const nextContentId = nextContent.id;
  
          alert("正解！次のタスクに進めます！");
          router.push(`/content/${nextContentId}`);
        } else {
          alert("おめでとうございます！すべてのタスクを完了しました。");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("次のコンテンツへの移動に失敗しました", error);
        alert("次のコンテンツに進む際にエラーが発生しました。");
      }
    } else {
      alert("不正解です。もう一度トライしてみよう！");
    }
  };
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!task) {
    return <div className="flex items-center justify-center min-h-screen">タスクが見つかりません</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Header dashboardType="user" onToggleSidebar={() => {}} />
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* 左サイドバー */}
        <div className="w-1/2 bg-white border-r flex flex-col h-full overflow-hidden">
          <div className="tabs flex justify-center border-b bg-gray-50">
            <button
              className={`flex-1 p-4 ${
                tab === "problem" ? "border-b-2 border-blue-500 text-blue-500 font-bold" : ""
              }`}
              onClick={() => setTab("problem")}
            >
              問題
            </button>
            <button
              className={`flex-1 p-4 ${
                tab === "preview" ? "border-b-2 border-blue-500 text-blue-500 font-bold" : ""
              }`}
              onClick={() => setTab("preview")}
            >
              プレビュー
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {tab === "problem" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">問題に挑戦！</h2>
                <pre className="bg-gray-100 p-4 rounded-md whitespace-pre-wrap">
                  {task.taskText}
                </pre>
              </div>
            )}
            {tab === "preview" && (
              <div>
                <h2 className="text-lg font-semibold mb-2">プレビュー</h2>
                {/* サブタブ */}
                <div className="tabs flex justify-center border-b bg-gray-50 mb-4">
                  <button
                    className={`flex-1 p-2 ${
                      previewTab === "sample" ? "border-b-2 border-blue-500 text-blue-500 font-bold" : ""
                    }`}
                    onClick={() => setPreviewTab("sample")}
                  >
                    サンプルプレビュー
                  </button>
                  <button
                    className={`flex-1 p-2 ${
                      previewTab === "user" ? "border-b-2 border-blue-500 text-blue-500 font-bold" : ""
                    }`}
                    onClick={() => setPreviewTab("user")}
                  >
                    ユーザープレビュー
                  </button>
                </div>
                {/* プレビュー表示 */}
                {previewTab === "sample" && (
                  task.previewCode ? (
                    <iframe
                      src={task.previewCode}
                      className="w-full h-96 border rounded"
                      title="サンプルプレビュー"
                    />
                  ) : (
                    <p>サンプルプレビューがありません。</p>
                  )
                )}
                {previewTab === "user" && (
                  <iframe
                    srcDoc={userCode} // ユーザーのコードを動的に表示
                    className="w-full h-96 border rounded"
                    title="ユーザープレビュー"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右エディター */}
        <div className="w-1/2 flex flex-col bg-white h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold mb-4">コードエディタ</h2>
            <MonacoEditor
              height="100%"
              defaultLanguage="html"
              value={userCode}
              onChange={handleCodeChange}
              options={{
                theme: "vs-dark",
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
        </div>
      </div>

      {/* フッター */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-4 px-8 flex justify-between items-center">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md shadow">
            レッスン一覧
          </button>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
          >
            これで提出する！
          </button>
        </div>
      </footer>
    </div>
  );
};

export default TaskPage;
