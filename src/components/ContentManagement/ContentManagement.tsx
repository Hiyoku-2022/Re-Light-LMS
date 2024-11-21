"use client";

import { useState, useEffect } from "react";
import { db } from "@/firebase";
import {
  collection,
  query,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  doc,
  getDocs,
  where,
} from "firebase/firestore";
import ContentList from "./ContentList";
import ContentForm from "./ContentForm";
import { initializeProgress, updateProgressForReorderedContents } from "@/utils/progressService";

export interface Content {
  id: string;
  title: string;
  description: string;
  stepOrder: number;
  tags: string[];
  type: "content" | "task";
  elements?: Element[];
  task?: Task;
  estimatedTime: number; // 新たに追加
}

interface Element {
  id: string;
  elementType: "text" | "video" | "image" | "code";
  url?: string;
  content?: string;
  caption?: string;
  elementOrder: number;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

interface Task {
  taskText: string;
  sampleCode: { [filename: string]: string };
  testCases: TestCase[];
  modelAnswer: string;
  hint: string;
  previewCode?: string;
}

interface TestCase {
  input: string;
  expectedOutput: string;
}

export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  // Firestoreからデータを取得してstateを更新
  useEffect(() => {
    const q = query(collection(db, "contents"), orderBy("stepOrder"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const contentList: Content[] = [];
      snapshot.forEach((doc) => {
        contentList.push({ id: doc.id, ...doc.data() } as Content);
      });
      setContents(contentList);
    });

    return () => unsubscribe();
  }, []);

  // 全ユーザーのProgressDBを初期化
  const initializeProgressForAllUsers = async (
    contentId: string,
    type: "content" | "task",
    tag: string,
    stepOrder: number,
    estimatedTime: number // 新たに追加
  ) => {
    const userSnapshot = await getDocs(collection(db, "users"));
    const promises = userSnapshot.docs.map((userDoc) => {
      const userId = userDoc.id;
      return initializeProgress(userId, contentId, type, tag, stepOrder, estimatedTime);
    });

    await Promise.all(promises);
    console.log("Progress initialized for all users for content ID:", contentId);
  };

  // コンテンツの追加
  const addContent = async (newContent: {
    title: string;
    description: string;
    tags: string[];
    elements?: Element[];
    type: "content" | "task";
    task?: Task;
    estimatedTime: number; // 新たに追加
  }) => {
    if (!newContent.tags || newContent.tags.length === 0) {
      console.error("タグが設定されていません。");
      alert("タグは必須です。");
      return;
    }

    const newOrder = contents.length > 0 ? contents[contents.length - 1].stepOrder + 1 : 1;

    try {
      const docRef = await addDoc(collection(db, "contents"), {
        ...newContent,
        stepOrder: newOrder,
      });

      const contentId = docRef.id;
      await initializeProgressForAllUsers(
        contentId,
        newContent.type,
        newContent.tags[0],
        newOrder,
        newContent.estimatedTime // 新たに追加
      );

      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("コンテンツ追加中にエラーが発生しました:", error);
      alert("コンテンツの追加中に問題が発生しました。");
    }
  };

  // コンテンツの更新
  const updateContent = async (
    id: string,
    updatedContent: {
      title: string;
      description: string;
      tags: string[];
      elements?: Element[];
      task?: Task;
      stepOrder: number;
      estimatedTime: number; // 新たに追加
    }
  ) => {
    const contentRef = doc(db, "contents", id);
    const previousContent = contents.find((content) => content.id === id);

    try {
      await updateDoc(contentRef, updatedContent);

      if (previousContent) {
        const { tags: previousTags, stepOrder: previousStepOrder, estimatedTime: previousEstimatedTime } = previousContent;
        const [previousTag] = previousTags;

        if (
          previousTag !== updatedContent.tags[0] ||
          previousStepOrder !== updatedContent.stepOrder ||
          previousEstimatedTime !== updatedContent.estimatedTime
        ) {
          console.log("ProgressDB updated for content ID:", id);
        }
      }
    } catch (error) {
      console.error("コンテンツ更新中にエラーが発生しました:", error);
      alert("コンテンツ更新中に問題が発生しました。");
    }
  };

  // コンテンツの削除
  const deleteContent = async (id: string) => {
    const contentRef = doc(db, "contents", id);

    try {
      await deleteDoc(contentRef);

      const progressQuery = query(collection(db, "progress"), where("contentId", "==", id));
      const progressSnapshot = await getDocs(progressQuery);
      const deletePromises = progressSnapshot.docs.map((doc) => deleteDoc(doc.ref));

      await Promise.all(deletePromises);
      console.log("Deleted content and associated ProgressDB entries for content ID:", id);
    } catch (error) {
      console.error("コンテンツ削除中にエラーが発生しました:", error);
      alert("コンテンツ削除中に問題が発生しました。");
    }
  };

  // 順序変更時の処理
  const handleReorder = async (reorderedContents: Content[]) => {
    try {
      // Firestoreでコンテンツの順序を更新
      const updateContentPromises = reorderedContents.map(async (content, index) => {
        const contentRef = doc(db, "contents", content.id);
        await updateDoc(contentRef, { stepOrder: index + 1 });
      });

      await Promise.all(updateContentPromises);

      // ProgressDBでstepOrderを更新
      const userSnapshot = await getDocs(collection(db, "users"));
      const reorderedData = reorderedContents.map((content, index) => ({
        contentId: content.id,
        tag: content.tags[0] || "untagged", // タグがない場合のデフォルト値
        stepOrder: index + 1,
        estimatedTime: content.estimatedTime, // 新たに追加
      }));

      const updateProgressPromises = userSnapshot.docs.map((userDoc) => {
        const userId = userDoc.id;
        return updateProgressForReorderedContents(userId, reorderedData);
      });

      await Promise.all(updateProgressPromises);
      console.log("Reordered contents and updated ProgressDB successfully.");
    } catch (error) {
      console.error("コンテンツ並べ替え中にエラーが発生しました:", error);
      alert("並び替え中にエラーが発生しました。");
    }
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
        onEditContent={setSelectedContent}
        onReorder={handleReorder}
        onElementReorder={() => {}}
      />
    </div>
  );
}
