"use client";

import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  Timestamp,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Header } from "@/components/UI/Header";

interface TaskData {
  title: string;
  taskText: string;
  sampleCode: Record<string, string>;
  modelAnswers: Record<string, string>;
  testCases: { fileName: string; input: string; expectedOutput: string }[];
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
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"problem" | "preview">("problem");
  const [previewTab, setPreviewTab] = useState<"sample" | "user">("sample"); 

  useEffect(() => {
    // 認証状態の監視
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const fetchTaskData = async () => {
      if (!id) return;

      try {
        const taskRef = doc(db, "contents", id);
        const taskSnap = await getDoc(taskRef);

        if (taskSnap.exists()) {
          const taskData = taskSnap.data() as TaskData;
          setTask(taskData);

          // サンプルコードを初期化
          setUserCode(taskData.sampleCode);
          // 最初のファイルを選択
          const firstFile = Object.keys(taskData.sampleCode)[0];
          setCurrentFile(firstFile);
        } else {
          alert("タスクが見つかりませんでした。");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("タスクの取得中にエラーが発生しました:", error);
        alert("タスクをロードできませんでした。");
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [id, router]);

  const handleCodeChange = (value: string | undefined) => {
    if (currentFile) {
      setUserCode((prev) => ({
        ...prev,
        [currentFile]: value || "",
      }));
    }
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    monaco.editor.setTheme("vs-dark");
  };

  const handleFileTabClick = (fileName: string) => {
    setCurrentFile(fileName);
  };

  const handleSubmit = async () => {
    if (!task || !userId) {
      alert("タスクまたはユーザー情報が見つかりません。");
      return;
    }

    let allTestsPassed = true;

    try {
      for (const testCase of task.testCases) {
        const { fileName, input, expectedOutput } = testCase;

        // 指定されたファイルの内容を仮想 DOM にロード
        const fileContent = userCode[fileName] || "";
        const virtualDiv = document.createElement("div");
        virtualDiv.innerHTML = fileContent;

        // 指定されたセレクターの内容を検証
        const element = virtualDiv.querySelector(input);
        const actualOutput = element?.textContent?.trim() || "";

        if (actualOutput !== expectedOutput) {
          console.error("不一致:", { fileName, input, actualOutput, expectedOutput });
          allTestsPassed = false;
          break;
        }
      }

      if (allTestsPassed) {
        alert("正解！次のタスクに進めます！");

        // 進捗情報をFirestoreに保存
        const progressRef = doc(db, "progress", `${userId}_${id}`);
        await updateDoc(progressRef, {
          isCompleted: true,
          completedAt: Timestamp.now(),
        });

        // 次のタスクへの遷移処理
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

          router.push(`/content/${nextContentId}`);
        } else {
          alert("おめでとうございます！すべてのタスクを完了しました。");
          router.push("/dashboard");
        }
      } else {
        alert("不正解です。もう一度トライしてみてください！");
      }
    } catch (error) {
      console.error("コード検証エラー:", error);
      alert("コードの検証中にエラーが発生しました。");
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
              {previewTab === "sample" && task.previewCode ? (
                <iframe src={task.previewCode} className="w-full h-96 border rounded" title="サンプルプレビュー" />
              ) : (
                <iframe
                  srcDoc={Object.entries(userCode)
                    .map(([fileName, content]) =>
                      fileName.endsWith(".css")
                        ? `<style>${content}</style>`
                        : content
                    )
                    .join("\n")}
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
          {/* ファイルタブ */}
          <div className="tabs flex border-b bg-gray-50">
            {Object.keys(userCode).map((fileName) => (
              <button
                key={fileName}
                className={`flex-1 p-4 ${
                  currentFile === fileName ? "border-b-2 border-blue-500 text-blue-500 font-bold" : ""
                }`}
                onClick={() => handleFileTabClick(fileName)}
              >
                {fileName}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-lg font-semibold mb-4">コードエディタ: {currentFile}</h2>
            <MonacoEditor
              height="100%"
              defaultLanguage={currentFile?.endsWith(".css") ? "css" : "html"}
              value={userCode[currentFile || ""]}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-4 px-8 flex justify-between items-center">
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md shadow">レッスン一覧</button>
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
