"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase"; // Firebase 設定をインポート
import { collection, query, orderBy, addDoc, updateDoc, deleteDoc, onSnapshot, doc } from "firebase/firestore"; // Firestore 関連インポート
import ContentList from "./ContentList";
import ContentForm from "./ContentForm";

export interface Content {
  id: string;
  title: string;
  description: string;
  order: number;
  tags: string[];
  elements: Element[];
}

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

export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // Firestore からデータを取得して state を更新
  useEffect(() => {
    const q = query(collection(db, "contents"), orderBy("order"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contentList: Content[] = [];
      snapshot.forEach((doc) => {
        contentList.push({ id: doc.id, ...doc.data() } as Content);
      });
      setContents(contentList);
    });

    return () => unsubscribe();
  }, []);

  // コンテンツの追加
  const addContent = async (newContent: { title: string; description: string; tags: string[]; elements: Element[] }) => {
    const newOrder = contents.length > 0 ? contents[contents.length - 1].order + 1 : 1;
    const docRef = await addDoc(collection(db, "contents"), { ...newContent, order: newOrder });
    console.log("Document written with ID: ", docRef.id);
  };

  // コンテンツの更新
  const updateContent = async (id: string, updatedContent: { title: string; description: string; tags: string[]; elements: Element[] }) => {
    const contentRef = doc(db, "contents", id);
    await updateDoc(contentRef, updatedContent);
  };

  // コンテンツの削除
  const deleteContent = async (id: string) => {
    const contentRef = doc(db, "contents", id);
    await deleteDoc(contentRef);
  };

  // コンテンツを選択して編集フォームを表示
  const selectContentForEdit = (content: Content) => {
    setSelectedContent(content);
  };

  // コンテンツの並び替え処理（order を更新）
  const handleReorder = async (reorderedContents: Content[]) => {
    reorderedContents.forEach(async (content, index) => {
      const contentRef = doc(db, "contents", content.id);
      await updateDoc(contentRef, { order: index + 1 });
    });
  };

  // 各コンテンツ内の要素を並び替える関数
  const handleElementReorder = async (contentId: string, reorderedElements: Element[]) => {
    const contentIndex = contents.findIndex((content) => content.id === contentId);
    if (contentIndex === -1) return;

    // 並び替えた要素の order を更新
    reorderedElements.forEach((element, index) => {
      element.order = index + 1;
    });

    // Firestore の該当コンテンツの `elements` を更新
    const contentRef = doc(db, "contents", contentId);
    await updateDoc(contentRef, { elements: reorderedElements });

    // ローカル state も更新
    const updatedContents = [...contents];
    updatedContents[contentIndex].elements = reorderedElements;
    setContents(updatedContents);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <ContentForm
        onAddContent={addContent}
        onUpdateContent={updateContent}
        selectedContent={selectedContent}
        setSelectedContent={setSelectedContent}
      />
      <ContentList
        contents={contents}
        onDeleteContent={deleteContent}
        onEditContent={selectContentForEdit}
        onReorder={handleReorder}
        onElementReorder={handleElementReorder} // 内部要素の並び替え関数を渡す
      />
    </div>
  );
}
