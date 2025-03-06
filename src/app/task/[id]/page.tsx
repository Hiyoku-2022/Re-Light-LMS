"use client";

import React, { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import { executeJsCode } from "@/utils/executors/executeJs";
import { executePhpCode } from "@/utils/executors/executePhp";
import { BackToCourse } from "@/components/UI/BackToCourse";

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

interface TestCase {
  fileName: string;
  input: string;
  expectedOutput?: string;
  expectedStyle?: Record<string, string>;
  event?: string;
}

const TaskPage: React.FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCourse = searchParams.get("current-course");
  const [task, setTask] = useState<TaskData | null>(null);
  const [currentFile, setCurrentFile] = useState<string | null>(null);
  const [userCode, setUserCode] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [tab, setTab] = useState<"problem" | "preview">("problem");
  const [previewTab, setPreviewTab] = useState<"sample" | "user">("sample");
  const [editorLanguage, setEditorLanguage] = useState<string>("plaintext");

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

  useEffect(() => {
    setEditorLanguage(getLanguageFromFilename(currentFile));
  }, [currentFile]);

  const handleFileTabClick = (fileName: string) => {
    setCurrentFile(fileName);
  };

  const getLanguageFromFilename = (filename: string | null): string => {
    if (!filename) return "plaintext"; // デフォルト
    if (filename.endsWith(".js")) return "javascript";
    if (filename.endsWith(".php")) return "php";
    if (filename.endsWith(".css")) return "css";
    if (filename.endsWith(".html")) return "html";
    return "plaintext"; // その他のファイルはプレーンテキストとして扱う
  };

  const generateUserPreview = (): string => {
    const html = userCode["index.html"] || "";
    const css = userCode["style.css"] || "";
    const js = userCode["script.js"] || "";
    return `
      <!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
        </head>
        <body>
          ${html}
          <script>${js}</script>
        </body>
      </html>
    `;
  };

  const [consoleOutput, setConsoleOutput] = useState<string>("");

  const executeCode = async () => {
    if (!currentFile || !userCode[currentFile]) {
      setConsoleOutput("⚠️ 実行するコードがありません");
      return;
    }

    const code = userCode[currentFile];

    try {
      let output = "";
      if (currentFile.endsWith(".js")) {
        output = await executeJsCode(code);
      } else if (currentFile.endsWith(".php")) {
        output = await executePhpCode(code);
      } else {
        output = "⚠️ このファイルのコード実行はサポートされていません";
      }
      setConsoleOutput(output);
    } catch (error) {
      console.error("実行エラー:", error);
      setConsoleOutput("⚠️ コードの実行中にエラーが発生しました");
    }
  };

  const [modalMessage, setModalMessage] = useState<string | null>(null);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!task || !userId) {
      alert("タスクまたはユーザー情報が見つかりません。");
      return;
    }

    try {
      // 🔹 コードを実行してコンソール出力を取得
      await executeCode();
      // 🔹 実行結果を少し待つ（API呼び出しのタイミングを考慮）
      await new Promise((resolve) => setTimeout(resolve, 500));
      // 🔹 テストケースの実行（コンソールの出力を考慮）
      const allTestsPassed = await validateTask(userCode, task.testCases);

      if (allTestsPassed) {
        // 🎉 「正解！」のモーダルを表示
        setModalMessage("🎉 正解！おめでとうございます！");
        setShowNextButton(true); // 「次へ進む」ボタンを表示
      } else {
        setModalMessage(
          `❌ 不正解です。\n\nコードを確認して、もう一度トライしてみてください！`
        );
        setShowNextButton(false); // 不正解の場合は「次へ進む」ボタンを非表示
      }
    } catch (error) {
      console.error("コード検証エラー:", error);
      alert("コードの検証中にエラーが発生しました。");
    }
  };

  // 🔹 次のタスクへ遷移する関数
  const moveToNextTask = async () => {
    if (!task || !userId) return;

    try {
      const progressRef = doc(db, "progress", `${userId}_${id}`);
      await updateDoc(progressRef, {
        isCompleted: true,
        completedAt: Timestamp.now(),
      });

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
        const nextContentType = nextContent.data().type;

        if (nextContentType === "task") {
          router.push(`/task/${nextContentId}`);
        } else if (nextContentType === "content") {
          router.push(`/content/${nextContentId}`);
        } else {
          console.error("不明なコンテンツタイプです:", nextContentType);
          router.push("/dashboard");
        }
      } else {
        alert("🎉 おめでとうございます！すべてのタスクを完了しました！");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("次のタスクへの遷移エラー:", error);
    }
  };

  const applyStyleToContainer = (
    container: HTMLElement,
    styleContent: string
  ): void => {
    let style = container.querySelector("style#user-style");
    if (!style) {
      style = document.createElement("style");
      style.id = "user-style";
      container.appendChild(style);
    }
    style.textContent = styleContent;
    console.log("Applied style content:", style.textContent);
  };

  const normalizeNewlines = (str: string) =>
    str.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  const normalizeExpectedOutput = (str: string) =>
    str.replace(/\\n/g, "\n").trim();

  const validateTask = async (
    userCode: Record<string, string>,
    testCases: TestCase[]
  ): Promise<boolean> => {
    let allTestsPassed = true;

    // HTML & CSS の正誤判定（既存の判定を維持）
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.left = "-9999px"; // 見えない位置に配置
    document.body.appendChild(iframe);
    const iframeDocument =
      iframe.contentDocument || iframe.contentWindow?.document;

    if (!iframeDocument) {
      console.debug("iframe のドキュメントを取得できませんでした。");
      return false;
    }

    // HTML をパース
    const parser = new DOMParser();
    const parsedHTML = parser.parseFromString(
      userCode["index.html"] || "",
      "text/html"
    );
    const bodyContent = parsedHTML.body.innerHTML;

    // iframe に HTML & CSS を埋め込む
    iframeDocument.open();
    iframeDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>${userCode["style.css"] || ""}</style>
        </head>
        <body>
          ${bodyContent}
        </body>
      </html>
    `);
    iframeDocument.close();

    await new Promise((resolve) => setTimeout(resolve, 100));

    // HTML / CSS のテストを実行
    for (const testCase of testCases) {
      if (
        testCase.fileName === "script.js" ||
        testCase.fileName === "index.php"
      ) {
        // JavaScript & PHP の場合はスキップ（後で別処理）
        continue;
      }

      const { input, expectedStyle } = testCase;
      if (!input) continue; // 空のセレクタはスキップ

      const element = iframeDocument.querySelector(input) as HTMLElement;
      if (!element) {
        console.error(`要素が見つかりません: ${input}`);
        console.debug(
          "Available elements in iframe:",
          iframeDocument.body.innerHTML
        );
        allTestsPassed = false;
        continue;
      }

      if (expectedStyle) {
        const computedStyle =
          iframeDocument.defaultView?.getComputedStyle(element);
        const computedStyleMatches = Object.entries(expectedStyle).every(
          ([key, value]) => {
            const computedValue = computedStyle?.getPropertyValue(key);
            return key === "color" || key === "background-color"
              ? compareColors(computedValue || "", value)
              : computedValue === value;
          }
        );

        if (!computedStyleMatches) {
          console.error("スタイルが一致しません:", {
            input,
            expectedStyle,
            computedStyles: computedStyle?.cssText,
          });
          allTestsPassed = false;
        }
      }
    }

    // PHP の正誤判定
    for (const testCase of testCases) {
      if (testCase.fileName === "index.php") {
        const expectedPhpOutput = testCase.expectedOutput || "";

        // 実際の PHP の出力を取得
        const phpOutput = await executePhpCode(userCode["index.php"]);

        // デバッグ: 出力内容を JSON で表示
        console.debug("PHPの生出力:", JSON.stringify(phpOutput, null, 2));

        // 期待値と実際の出力の改行を統一
        const normalizedPhpOutput = normalizeNewlines(phpOutput);
        const normalizedExpectedOutput =
          normalizeExpectedOutput(expectedPhpOutput);

        console.debug(
          "✅ 期待される出力:",
          JSON.stringify(normalizedExpectedOutput, null, 2)
        );
        console.debug(
          "✅ 実際の出力:",
          JSON.stringify(normalizedPhpOutput, null, 2)
        );

        // 🔍 判定処理
        if (normalizedPhpOutput !== normalizedExpectedOutput) {
          console.debug(
            `❌ 期待された出力: ${normalizedExpectedOutput}, 実際の出力: ${normalizedPhpOutput}`
          );
          allTestsPassed = false;
        }
      }
    }
    // iframe を削除
    document.body.removeChild(iframe);

    return allTestsPassed;
  };

  // 色の比較用関数
  const compareColors = (
    computedValue: string,
    expectedValue: string
  ): boolean => {
    const normalizeColor = (color: string): string => {
      const div = document.createElement("div");
      div.style.color = color;
      document.body.appendChild(div);
      const rgbColor = window.getComputedStyle(div).color;
      document.body.removeChild(div);
      return rgbColor;
    };

    return normalizeColor(computedValue) === normalizeColor(expectedValue);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        タスクが見つかりません
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Header dashboardType="user" onToggleSidebar={() => {}} />
      <div className="flex flex-1 overflow-hidden pt-16 pb-16">
        {/* 左サイドバー */}
        <div className="w-1/2 bg-white border-r flex flex-col h-full overflow-hidden">
          <div className="tabs flex justify-center border-b bg-gray-50">
            <button
              className={`flex-1 p-4 ${
                tab === "problem"
                  ? "border-b-2 border-blue-500 text-blue-500 font-bold"
                  : ""
              }`}
              onClick={() => setTab("problem")}
            >
              問題
            </button>
            <button
              className={`flex-1 p-4 ${
                tab === "preview"
                  ? "border-b-2 border-blue-500 text-blue-500 font-bold"
                  : ""
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
                      previewTab === "sample"
                        ? "border-b-2 border-blue-500 text-blue-500 font-bold"
                        : ""
                    }`}
                    onClick={() => setPreviewTab("sample")}
                  >
                    サンプルプレビュー
                  </button>
                  <button
                    className={`flex-1 p-2 ${
                      previewTab === "user"
                        ? "border-b-2 border-blue-500 text-blue-500 font-bold"
                        : ""
                    }`}
                    onClick={() => setPreviewTab("user")}
                  >
                    ユーザープレビュー
                  </button>
                </div>
                {previewTab === "sample" && task.previewCode ? (
                  <iframe
                    src={task.previewCode}
                    className="w-full h-96 border rounded"
                    title="サンプルプレビュー"
                  />
                ) : (
                  <iframe
                    srcDoc={generateUserPreview()}
                    className="w-full h-96 border rounded"
                    title="ユーザープレビュー"
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右エディター */}
        <div className="w-1/2 flex flex-col bg-white h-full pb-8">
          {/* ファイルタブ */}
          <div className="tabs flex border-b bg-gray-50">
            {Object.keys(userCode).map((fileName) => (
              <button
                key={fileName}
                className={`flex-1 p-4 ${
                  currentFile === fileName
                    ? "border-b-2 border-blue-500 text-blue-500 font-bold"
                    : ""
                }`}
                onClick={() => handleFileTabClick(fileName)}
              >
                {fileName}
              </button>
            ))}
          </div>

          {/* コードエディターエリア */}
          <div className="flex-1 px-2 overflow-hidden">
            <h2 className="text-lg font-semibold mb-2">
              コードエディタ: {currentFile}
            </h2>
            <MonacoEditor
              height="calc(100% - 50px)"
              language={editorLanguage}
              value={userCode[currentFile || ""]}
              onChange={handleCodeChange}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </div>

          {/* コンソール出力エリア */}
          <div className="px-2">
            <p className="text-sm font-semibold text-gray-600">コンソール</p>
            <div className="bg-gray-900 text-white p-2 h-28 overflow-auto rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{consoleOutput}</pre>
            </div>
          </div>
        </div>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 bg-white shadow-lg py-4 px-8 flex justify-between items-center">
        <div className="flex gap-4 relative">
          <BackToCourse currentCourse={currentCourse} />
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
      {modalMessage && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setModalMessage(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setModalMessage(null)}
            >
              ✕
            </button>
            <p
              style={{
                whiteSpace: "pre-line",
                textAlign: "center",
                fontSize: "18px",
                lineHeight: "1.6",
              }}
            >
              {modalMessage}
            </p>

            {showNextButton && (
              <button
                onClick={moveToNextTask}
                className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-600 transition"
              >
                次へ進む
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;
