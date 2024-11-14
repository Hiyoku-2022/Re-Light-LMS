import { useState, useEffect } from "react";
import Image from "next/image";
import { Content } from "./ContentManagement";
import { storage } from "@/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface Element {
  id: string;
  type: "text" | "video" | "image" | "code";
  url?: string;
  content?: string;
  caption?: string;
  order: number;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

interface ContentFormProps {
  onAddContent: (newContent: { title: string; description: string; tags: string[]; elements: Element[] }) => void;
  onUpdateContent: (id: string, updatedContent: { title: string; description: string; tags: string[]; elements: Element[] }) => void;
  selectedContent: Content | null;
  setSelectedContent: (content: Content | null) => void;
}

export default function ContentForm({ onAddContent, onUpdateContent, selectedContent, setSelectedContent }: ContentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [elements, setElements] = useState<Element[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (selectedContent) {
      setTitle(selectedContent.title);
      setDescription(selectedContent.description);
      setTags(selectedContent.tags || []);
      setElements(
        selectedContent.elements?.map((element) => ({
          ...element,
          type: element.type as "text" | "video" | "image" | "code",
        })) || []
      );
    } else {
      setTitle("");
      setDescription("");
      setTags([]);
      setElements([]);
    }
  }, [selectedContent]);

  const addElement = () => {
    setElements([
      ...elements,
      { id: `element_${elements.length + 1}`, type: "text", content: "", order: elements.length + 1 },
    ]);
  };

  const removeElement = (index: number) => {
    setElements((prevElements) => prevElements.filter((_, i) => i !== index));
  };

  const updateElement = (index: number, field: keyof Element, value: string | number) => {
    setElements((prevElements) => {
      const newElements = [...prevElements];
      switch (field) {
        case "content":
        case "url":
        case "caption":
          if (typeof value === "string") newElements[index][field] = value;
          break;
        case "order":
          if (typeof value === "number") newElements[index][field] = value;
          break;
        case "type":
          if (value === "text" || value === "video" || value === "image" || value === "code") {
            newElements[index].type = value;
          }
          break;
        case "width":
        case "height":
          if (typeof value === "number") newElements[index][field] = value;
          break;
        default:
          break;
      }
      return newElements;
    });
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

  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    const img = event.currentTarget;
    updateElement(index, "width", img.naturalWidth);
    updateElement(index, "height", img.naturalHeight);
  };

  const handleSubmit = () => {
    const newContent = { title, description, tags, elements };
    if (selectedContent) {
      onUpdateContent(selectedContent.id, newContent);
    } else {
      onAddContent(newContent);
    }
    setTitle("");
    setDescription("");
    setTags([]);
    setElements([]);
    setSelectedContent(null);
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-lg">
      <h2 className="text-xl mb-4">{selectedContent ? "コンテンツの編集" : "新しいコンテンツの追加"}</h2>
      <div className="space-y-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="コンテンツタイトル"
          className="w-full p-2 border rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="コンテンツの説明"
          className="w-full p-2 border rounded"
        />
        <input
          value={tags.join(", ")}
          onChange={(e) => setTags(e.target.value.split(",").map((tag) => tag.trim()))}
          placeholder="タグ (カンマ区切り)"
          className="w-full p-2 border rounded"
        />
        <h3 className="text-lg mt-4">コンテンツ内部要素</h3>
        {elements.map((element, index) => (
          <div key={element.id} className="border p-2 mb-2 rounded-lg bg-white shadow-sm">
            <select value={element.type} onChange={(e) => updateElement(index, "type", e.target.value)} className="p-2 border mb-2">
              <option value="text">テキスト</option>
              <option value="video">動画</option>
              <option value="image">画像</option>
              <option value="code">コード</option>
            </select>
            {element.type === "text" && (
              <textarea
                value={element.content || ""}
                onChange={(e) => updateElement(index, "content", e.target.value)}
                placeholder="テキスト内容"
                className="w-full p-2 border rounded"
              />
            )}
            {element.type === "video" && (
              <input
                value={element.url || ""}
                onChange={(e) => updateElement(index, "url", e.target.value)}
                placeholder="動画URL"
                className="w-full p-2 border rounded"
              />
            )}
            {element.type === "image" && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(index, e.target.files[0])}
                  className="mb-2"
                />
                {uploading && <p>アップロード中: {uploadProgress}%</p>}
                {element.url && (
                  <>
                    <Image
                      src={element.url}
                      alt="Uploaded"
                      width={500}
                      height={300}
                      onLoad={(e) => handleImageLoad(e, index)}
                      className="max-w-full h-auto mt-2"
                    />
                    <p>サイズ: {element.width} x {element.height}</p>
                  </>
                )}
                <input
                  value={element.caption || ""}
                  onChange={(e) => updateElement(index, "caption", e.target.value)}
                  placeholder="画像キャプション"
                  className="w-full p-2 border rounded"
                />
              </>
            )}
            {element.type === "code" && (
              <textarea
                value={element.content || ""}
                onChange={(e) => updateElement(index, "content", e.target.value)}
                placeholder="コード内容"
                className="w-full p-2 border rounded"
              />
            )}
            <button
              onClick={() => removeElement(index)}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
            >
              削除
            </button>
          </div>
        ))}
        <button onClick={addElement} className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
          要素の追加
        </button>
      </div>
      <button onClick={handleSubmit} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
        {selectedContent ? "更新" : "追加"}
      </button>
    </div>
  );
}
