import { useState, useEffect } from "react";
import Image from "next/image";
import { storage } from "@/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface Element {
  id: string;
  elementType: "text" | "video" | "image" | "code";
  url?: string;
  content?: string;
  elementOrder: number;
}

interface TestCase {
  fileName: string;
  input: string;
  expectedOutput?: string;
  expectedStyle?: Record<string, string>;
  event?: { type: string; expectedOutput: string } | null;
}

interface Task {
  taskText: string;
  sampleCode: { [filename: string]: string };
  testCases: TestCase[];
  modelAnswers: { [filename: string]: string };
  hint: string;
  constraints?: { maxExecutionTime: number };
  previewCode?: string;
}

interface ContentFormProps {
  onAddContent: (newContent: any) => void;
  onUpdateContent: (id: string, updatedContent: any) => void;
  selectedContent: any | null;
  setSelectedContent: (content: any | null) => void;
}

export default function ContentForm({ onAddContent, onUpdateContent, selectedContent, setSelectedContent }: ContentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState(""); // タグを単一入力から管理
  const [tags, setTags] = useState<string[]>([]); // タグの配列
  const [type, setType] = useState<"content" | "task">("content");
  const [taskType, setTaskType] = useState<"ui" | "algorithm">("ui");
  const [elements, setElements] = useState<Element[]>([]);
  const [task, setTask] = useState<Task>({
    taskText: "",
    sampleCode: {},
    testCases: [],
    modelAnswers: {},
    hint: "",
    previewCode: "",
  });
  
  const [editingFilenames, setEditingFilenames] = useState<{ [key: string]: string }>({});
  const [editingModelFilenames, setEditingModelFilenames] = useState<{ [key: string]: string }>({});

  const [stepOrder, setStepOrder] = useState(1);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");

  useEffect(() => {
    if (selectedContent) {
      setTitle(selectedContent.title);
      setDescription(selectedContent.description);
      setTags(selectedContent.tags || []);
      setType(selectedContent.type);
      setStepOrder(selectedContent.stepOrder);
      setEstimatedTime(selectedContent.estimatedTime);
      if (selectedContent.type === "content") {
        setElements(selectedContent.elements || []);
      } else if (selectedContent.type === "task") {
        setTask({
          taskText: selectedContent.taskText || "",
          sampleCode: selectedContent.sampleCode || {},
          testCases: selectedContent.testCases || [],
          modelAnswers: selectedContent.modelAnswer || {},
          hint: selectedContent.hint || "",
          previewCode: selectedContent.previewCode || "",
        });
      }
    } else {
      resetForm();
    }
  }, [selectedContent]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTags([]);
    setType("content");
    setTaskType("ui");
    setStepOrder(1);
    setEstimatedTime(0);
    setElements([]);
    setTask({
      taskText: "",
      sampleCode: {},
      testCases: [],
      modelAnswers: {},
      hint: "",
      previewCode: "",
    });
    setPreviewContent("");
    setIsEditingPreview(false);
  };

  const addTag = () => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
      setTag("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const addElement = () => {
    setElements((prev) => [
      ...prev,
      { id: `element_${prev.length + 1}`, elementType: "text", content: "", elementOrder: prev.length + 1 },
    ]);
  };

  const updateElement = (index: number, field: keyof Element, value: string | number) => {
    setElements((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeElement = (index: number) => {
    setElements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, file: File) => {
    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploading(true);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error("アップロードエラー:", error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        updateElement(index, "url", downloadURL);
        setUploading(false);
        setUploadProgress(0);
      }
    );
  };

  const addSampleFile = () => {
    const newFilename = `newFile${Object.keys(task.sampleCode).length + 1}.html`;
    setTask({
      ...task,
      sampleCode: { ...task.sampleCode, [newFilename]: "" },
    });
  };

  const updateSampleFile = (filename: string, content: string) => {
    setTask({
      ...task,
      sampleCode: { ...task.sampleCode, [filename]: content },
    });
  };

  const removeSampleFile = (filename: string) => {
    const updatedSampleCode = { ...task.sampleCode };
    delete updatedSampleCode[filename];
    setTask({ ...task, sampleCode: updatedSampleCode });
  };
  
  const addTestCase = () => {
    setTask((prev) => ({
      ...prev,
      testCases: [
        ...prev.testCases,
        { fileName: "", input: "", expectedOutput: "", expectedStyle: {}, event: null },
      ],
    }));
  };

  const updateTestCase = (index: number, field: keyof TestCase, value: any) => {
    setTask((prev) => {
      const updatedTestCases = [...prev.testCases];
      updatedTestCases[index][field] = value;
      return { ...prev, testCases: updatedTestCases };
    });
  };

  const removeTestCase = (index: number) => {
    setTask((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== index),
    }));
  };

  const handlePreviewEdit = async () => {
    if (task.previewCode) {
      try {
        const response = await fetch(task.previewCode);
        if (!response.ok) throw new Error("プレビューコードの取得に失敗しました");
        const code = await response.text();
        setPreviewContent(code);
        setIsEditingPreview(true);
      } catch (error) {
        console.error("プレビューコード取得エラー:", error);
      }
    } else {
      setIsEditingPreview(true);
    }
  };

  const handlePreviewUpload = async () => {
    if (!previewContent) {
      alert("プレビュー用のコードを入力してください。");
      return;
    }

    try {
      const blob = new Blob([previewContent], { type: "text/html" });
      const storageRef = ref(storage, `previews/${Date.now()}_preview.html`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        () => {},
        (error) => {
          console.error("プレビューコードアップロードエラー:", error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setTask((prev) => ({ ...prev, previewCode: downloadURL }));
          setIsEditingPreview(false);
        }
      );
    } catch (error) {
      console.error("プレビューコードアップロードエラー:", error);
    }
  };

  const addModelAnswerFile = () => {
    const newFilename = `modelAnswer${Object.keys(task.modelAnswers).length + 1}.txt`;
    setTask((prev) => ({
      ...prev,
      modelAnswers: { ...prev.modelAnswers, [newFilename]: "" },
    }));
  };

  const updateModelAnswerFile = (filename: string, content: string) => {
    setTask((prev) => ({
      ...prev,
      modelAnswers: { ...prev.modelAnswers, [filename]: content },
    }));
  };

  const removeModelAnswerFile = (filename: string) => {
    const updatedModelAnswers = { ...task.modelAnswers };
    delete updatedModelAnswers[filename];
    setTask((prev) => ({
      ...prev,
      modelAnswers: updatedModelAnswers,
    }));
  };

  const editModelFilename = (filename: string, newFilename: string) => {
    const updatedModelAnswers = { ...task.modelAnswers };
    updatedModelAnswers[newFilename] = updatedModelAnswers[filename];
    delete updatedModelAnswers[filename];
    setTask((prev) => ({
      ...prev,
      modelAnswers: updatedModelAnswers,
    }));
  };

  const saveModelAnswerFilename = (filename: string) => {
    const newFilename = editingModelFilenames[filename]?.trim();
    if (!newFilename) {
      alert("ファイル名を入力してください。");
      return;
    }
    if (newFilename in task.modelAnswers) {
      alert("同じ名前のファイルがすでに存在します。");
      return;
    }
  
    editModelFilename(filename, newFilename);
    setEditingModelFilenames((prev) => {
      const { [filename]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("タイトルを入力してください。");
      return;
    }
    if (!description.trim()) {
      alert("説明を入力してください。");
      return;
    }
    if (tags.length === 0) {
      alert("少なくとも1つのタグを追加してください。");
      return;
    }

    const newData =
      type === "content"
        ? { title, description, tags, type, stepOrder, estimatedTime, elements }
        : { title, description, tags, type, stepOrder, estimatedTime, taskType, ...task };

    if (selectedContent) {
      onUpdateContent(selectedContent.id, newData);
    } else {
      onAddContent(newData);
    }
    resetForm();
    setSelectedContent(null);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl mb-4">{selectedContent ? "コンテンツの編集" : "新しいコンテンツの追加"}</h2>
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="タイトル (例: HTML基礎)"
          className="w-full p-2 border rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="説明 (例: HTMLの基本構造を学ぶコンテンツです)"
          className="w-full p-2 border rounded"
        />
        <div className="mt-2">
          <input
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            placeholder="タグを入力"
            className="p-2 border rounded"
          />
          <button onClick={addTag} className="ml-2 p-2 bg-blue-500 text-white rounded">
            追加
          </button>
          <div className="flex mt-2">
            {tags.map((t, i) => (
              <span key={i} className="bg-gray-200 p-1 rounded m-1">
                {t}
                <button onClick={() => removeTag(i)} className="ml-1 text-red-500">
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <select value={type} onChange={(e) => setType(e.target.value as "content" | "task")} className="w-full p-2 border rounded">
          <option value="content">コンテンツ</option>
          <option value="task">課題</option>
        </select>
        <input
          value={stepOrder}
          type="number"
          onChange={(e) => setStepOrder(parseInt(e.target.value, 10))}
          placeholder="順序 (例: 1)"
          className="w-full p-2 border rounded"
        />
        <input
          value={estimatedTime}
          type="number"
          onChange={(e) => setEstimatedTime(parseInt(e.target.value, 10))}
          placeholder="目安時間 (分単位で入力)"
          className="w-full p-2 border rounded"
        />

        {type === "content" && (
          <div>
            <h3 className="text-lg mt-4">コンテンツ要素</h3>
            {elements.map((element, index) => (
              <div key={element.id} className="p-2 border rounded mb-2 bg-white">
                <select
                  value={element.elementType}
                  onChange={(e) => updateElement(index, "elementType", e.target.value)}
                  className="w-full p-2 border rounded mb-2"
                >
                  <option value="text">テキスト</option>
                  <option value="video">動画</option>
                  <option value="image">画像</option>
                  <option value="code">コード</option>
                </select>
                {element.elementType === "text" && (
                  <textarea
                    value={element.content || ""}
                    onChange={(e) => updateElement(index, "content", e.target.value)}
                    placeholder="テキスト内容"
                    className="w-full p-2 border rounded"
                  />
                )}
                {element.elementType === "video" && (
                  <input
                    value={element.url || ""}
                    onChange={(e) => updateElement(index, "url", e.target.value)}
                    placeholder="動画URL"
                    className="w-full p-2 border rounded"
                  />
                )}
                {element.elementType === "image" && (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(index, e.target.files[0])}
                      className="mb-2"
                    />
                    {uploading && <p>アップロード中: {uploadProgress}%</p>}
                    {element.url && (
                    <Image 
                      src={element.url} 
                      alt="Uploaded" 
                      className="w-full h-auto rounded" 
                      width={800}
                      height={600}
                      layout="responsive"
                      objectFit="cover"
                    />
                  )}
                  </>
                )}
                {element.elementType === "code" && (
                  <textarea
                    value={element.content || ""}
                    onChange={(e) => updateElement(index, "content", e.target.value)}
                    placeholder="コード内容"
                    className="w-full p-2 border rounded"
                  />
                )}
                <button onClick={() => removeElement(index)} className="bg-red-500 text-white px-4 py-2 rounded mt-2">
                  削除
                </button>
              </div>
            ))}
            <button onClick={addElement} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
              要素追加
            </button>
          </div>
        )}

        {type === "task" && (
          <div>
            {/* タスク問題文 */}
            <textarea
              value={task.taskText}
              onChange={(e) => setTask({ ...task, taskText: e.target.value })}
              placeholder="問題"
              className="w-full p-2 border rounded"
            />

            {/* 課題タイプの選択 */}
            <h3 className="text-lg mt-4">課題タイプ</h3>
            <select
              value={taskType}
              onChange={(e) => setTaskType(e.target.value as "ui" | "algorithm")}
              className="w-full p-2 border rounded"
            >
              <option value="ui">見た目に関する課題</option>
              <option value="algorithm">アルゴリズム課題</option>
            </select>

            {/* UI課題用のサンプルコードとテストケース */}
            {taskType === "ui" && (
              <div>
                {/* サンプルコード */}
                <h3 className="text-lg mt-4">サンプルコード</h3>
                {Object.entries(task.sampleCode).map(([filename, content]) => (
                  <div key={filename} className="p-2 border rounded mb-2 bg-white">
                    {editingFilenames[filename] !== undefined ? (
                      <>
                        <input
                          value={editingFilenames[filename]}
                          onChange={(e) =>
                            setEditingFilenames((prev) => ({
                              ...prev,
                              [filename]: e.target.value,
                            }))
                          }
                          placeholder="新しいファイル名"
                          className="w-full p-2 border rounded mb-2"
                        />
                        <button
                          onClick={() => {
                            const newFilename = editingFilenames[filename].trim();
                            if (!newFilename) return alert("ファイル名を入力してください");
                            if (newFilename in task.sampleCode) {
                              return alert("同じ名前のファイルがすでに存在します");
                            }
                            const updatedSampleCode = { ...task.sampleCode };
                            updatedSampleCode[newFilename] = updatedSampleCode[filename];
                            delete updatedSampleCode[filename];
                            setTask({ ...task, sampleCode: updatedSampleCode });
                            setEditingFilenames((prev) => {
                              const { [filename]: _, ...rest } = prev;
                              return rest;
                            });
                          }}
                          className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                          保存
                        </button>
                        <button
                          onClick={() =>
                            setEditingFilenames((prev) => {
                              const { [filename]: _, ...rest } = prev;
                              return rest;
                            })
                          }
                          className="bg-gray-500 text-white px-4 py-2 rounded"
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <>
                        <input
                          value={filename}
                          readOnly
                          className="w-full p-2 border rounded mb-2 bg-gray-100"
                        />
                        <button
                          onClick={() =>
                            setEditingFilenames((prev) => ({
                              ...prev,
                              [filename]: filename,
                            }))
                          }
                          className="bg-blue-500 text-white px-4 py-2 rounded"
                        >
                          編集
                        </button>
                      </>
                    )}
                    <textarea
                      value={content}
                      onChange={(e) => updateSampleFile(filename, e.target.value)}
                      placeholder="コードを記述してください"
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={() => removeSampleFile(filename)}
                      className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSampleFile}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                >
                  ファイル追加
                </button>

                {/* テストケース */}
                <h3 className="text-lg mt-4">テストケース</h3>
                {task.testCases.map((testCase, index) => (
                  <div key={index} className="p-2 border rounded mb-2">
                    <input
                      value={testCase.fileName}
                      onChange={(e) => updateTestCase(index, "fileName", e.target.value)}
                      placeholder="ファイル名 (例: index.html)"
                      className="w-full p-2 border rounded mb-2"
                    />
                    <textarea
                      value={testCase.input}
                      onChange={(e) => updateTestCase(index, "input", e.target.value)}
                      placeholder="検証対象 (例: h1)"
                      className="w-full p-2 border rounded mb-2"
                    />
                    <textarea
                      value={testCase.expectedOutput || ""}
                      onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                      placeholder="期待される出力"
                      className="w-full p-2 border rounded mb-2"
                    />
                    {/* CSSスタイル管理 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">期待されるCSSスタイル</label>
                      <div className="space-y-2">
                        {Object.entries(testCase.expectedStyle || {}).map(([property, value]) => (
                          <div key={property} className="flex items-center space-x-2">
                            <input
                              type="text"
                              defaultValue={property}
                              onBlur={(e) => {
                                const newProperty = e.target.value.trim();
                                if (!newProperty) return;
                                const updatedStyle = { ...testCase.expectedStyle };
                                updatedStyle[newProperty] = updatedStyle[property];
                                delete updatedStyle[property];
                                updateTestCase(index, "expectedStyle", updatedStyle);
                              }}
                              placeholder="CSSプロパティ (例: color)"
                              className="flex-1 p-2 border rounded"
                            />
                            <input
                              type="text"
                              defaultValue={value}
                              onBlur={(e) => {
                                const updatedStyle = { ...testCase.expectedStyle };
                                updatedStyle[property] = e.target.value.trim();
                                updateTestCase(index, "expectedStyle", updatedStyle);
                              }}
                              placeholder="期待される値 (例: blue)"
                              className="flex-1 p-2 border rounded"
                            />
                            <button
                              onClick={() => {
                                const updatedStyle = { ...testCase.expectedStyle };
                                delete updatedStyle[property];
                                updateTestCase(index, "expectedStyle", updatedStyle);
                              }}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                              削除
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() =>
                            updateTestCase(index, "expectedStyle", {
                              ...testCase.expectedStyle,
                              "": "",
                            })
                          }
                          className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                        >
                          CSSスタイル追加
                        </button>
                      </div>
                    </div>

                    {/* イベント検証 */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">イベント検証</label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            defaultValue={testCase.event?.type || ""}
                            onBlur={(e) => {
                              updateTestCase(index, "event", {
                                ...testCase.event,
                                type: e.target.value.trim(),
                              });
                            }}
                            placeholder="イベントタイプ (例: click)"
                            className="flex-1 p-2 border rounded"
                          />
                        </div>
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="text"
                            defaultValue={testCase.event?.expectedOutput || ""}
                            onBlur={(e) => {
                              updateTestCase(index, "event", {
                                ...testCase.event,
                                expectedOutput: e.target.value.trim(),
                              });
                            }}
                            placeholder="期待される結果 (例: Hello)"
                            className="flex-1 p-2 border rounded"
                          />
                        </div>
                        <button
                          onClick={() =>
                            updateTestCase(index, "event", { type: "", expectedOutput: "" })
                          }
                          className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                        >
                          イベントをリセット
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => removeTestCase(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTestCase}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  テストケース追加
                </button>

                {/* プレビュー編集 */}
                <div>
                  <h3 className="text-lg mt-4">プレビュー編集</h3>
                  {isEditingPreview ? (
                    <div>
                      <textarea
                        value={previewContent}
                        onChange={(e) => setPreviewContent(e.target.value)}
                        placeholder="プレビュー用コード"
                        className="w-full p-2 border rounded"
                      />
                      <button
                        onClick={handlePreviewUpload}
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        アップロード
                      </button>
                    </div>
                  ) : (
                    <div>
                      {task.previewCode && (
                        <iframe
                          src={task.previewCode}
                          className="w-full h-64 border rounded"
                        ></iframe>
                      )}
                      <button
                        onClick={handlePreviewEdit}
                        className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        編集
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* アルゴリズム課題用のサンプルコードとテストケース */}
            {taskType === "algorithm" && (
              <div>
                {/* サンプルコード */}
                <h3 className="text-lg mt-4">サンプルコード</h3>
                {Object.entries(task.sampleCode).map(([filename, content]) => (
                  <div key={filename} className="p-2 border rounded mb-2 bg-white">
                    <input
                      value={filename}
                      readOnly
                      className="w-full p-2 border rounded mb-2 bg-gray-100"
                    />
                    <textarea
                      value={content}
                      onChange={(e) => updateSampleFile(filename, e.target.value)}
                      placeholder="アルゴリズムの雛形を記述してください"
                      className="w-full p-2 border rounded"
                    />
                    <button
                      onClick={() => removeSampleFile(filename)}
                      className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                    >
                      ファイル削除
                    </button>
                  </div>
                ))}
                <button
                  onClick={addSampleFile}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                >
                  ファイル追加
                </button>

                {/* テストケース */}
                <h3 className="text-lg mt-4">テストケース</h3>
                {task.testCases.map((testCase, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      value={testCase.input}
                      onChange={(e) => updateTestCase(index, "input", e.target.value)}
                      placeholder="入力値 (例: [1, 2, 3])"
                      className="flex-1 p-2 border rounded"
                    />
                    <input
                      value={testCase.expectedOutput}
                      onChange={(e) => updateTestCase(index, "expectedOutput", e.target.value)}
                      placeholder="期待される出力 (例: 6)"
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      onClick={() => removeTestCase(index)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      削除
                    </button>
                  </div>
                ))}
                <button
                  onClick={addTestCase}
                  className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
                >
                  テストケースの追加
                </button>
              </div>
            )}

            {/* 模範解答とヒント */}
            <div>
              <h3 className="text-lg mt-4">模範解答</h3>
              {Object.entries(task.modelAnswers).map(([filename, content]) => (
                <div key={filename} className="p-2 border rounded mb-2 bg-white">
                  {editingModelFilenames[filename] !== undefined ? (
                    <>
                      <input
                        value={editingModelFilenames[filename]}
                        onChange={(e) =>
                          setEditingModelFilenames((prev) => ({
                            ...prev,
                            [filename]: e.target.value,
                          }))
                        }
                        placeholder="新しいファイル名"
                        className="w-full p-2 border rounded mb-2"
                      />
                      <button
                        onClick={() => saveModelAnswerFilename(filename)}
                        className="bg-green-500 text-white px-4 py-2 rounded"
                      >
                        保存
                      </button>
                      <button
                        onClick={() =>
                          setEditingModelFilenames((prev) => {
                            const { [filename]: _, ...rest } = prev;
                            return rest;
                          })
                        }
                        className="bg-gray-500 text-white px-4 py-2 rounded"
                      >
                        キャンセル
                      </button>
                    </>
                  ) : (
                    <>
                      <input
                        value={filename}
                        readOnly
                        className="w-full p-2 border rounded mb-2 bg-gray-100"
                      />
                      <button
                        onClick={() =>
                          setEditingModelFilenames((prev) => ({
                            ...prev,
                            [filename]: filename,
                          }))
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        編集
                      </button>
                    </>
                  )}
                  <textarea
                    value={content}
                    onChange={(e) => updateModelAnswerFile(filename, e.target.value)}
                    placeholder="模範解答を記述してください"
                    className="w-full p-2 border rounded"
                  />
                  <button
                    onClick={() => removeModelAnswerFile(filename)}
                    className="bg-red-500 text-white px-4 py-2 rounded mt-2"
                  >
                    削除
                  </button>
                </div>
              ))}
              <button
                onClick={addModelAnswerFile}
                className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
              >
                模範解答ファイル追加
              </button>
            </div>
            <textarea
              value={task.hint}
              onChange={(e) => setTask({ ...task, hint: e.target.value })}
              placeholder="ヒント"
              className="w-full p-2 border rounded"
            />
          </div>
        )}
      </div>
      <button onClick={handleSubmit} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        {selectedContent ? "更新" : "追加"}
      </button>
    </div>
  );
}
