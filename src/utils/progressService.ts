import { db } from "@/firebase";
import { collection, doc, setDoc, updateDoc, getDocs, query, where } from "firebase/firestore";

// 進捗を初期化する関数（個別）
export const initializeProgress = async (
  userId: string,
  contentId: string,
  type: "content" | "task",
  tag: string,
  stepOrder: number
) => {
  const progressRef = doc(db, "progress", `${userId}_${contentId}`);
  const initialData = {
    userId,
    contentId,
    type,
    tag,
    isCompleted: false,
    completedAt: null,
    stepOrder,
  };
  await setDoc(progressRef, initialData);
};

// 全ユーザーの進捗を初期化する関数（新規ユーザー用）
export const initializeUserProgress = async (userId: string) => {
  const contentCollection = collection(db, "contents");
  const snapshot = await getDocs(contentCollection);

  const progressPromises = snapshot.docs.map(async (doc) => {
    const data = doc.data();
    return initializeProgress(
      userId,
      doc.id,
      data.type,
      data.tags[0],
      data.stepOrder
    );
  });

  await Promise.all(progressPromises);
};

// ProgressDB のタグとステップ順序を更新する関数（複数更新対応）
export const updateProgressForReorderedContents = async (
  userId: string,
  reorderedContents: { contentId: string; tag: string; stepOrder: number }[]
) => {
  const updatePromises = reorderedContents.map(({ contentId, tag, stepOrder }) => {
    const progressRef = doc(db, "progress", `${userId}_${contentId}`);
    return updateDoc(progressRef, { tag, stepOrder });
  });

  await Promise.all(updatePromises);
};

// 進捗を更新する関数
export const updateProgress = async (
  userId: string,
  contentId: string,
  isCompleted: boolean
) => {
  const progressRef = doc(db, "progress", `${userId}_${contentId}`);
  const updatedData = {
    isCompleted,
    completedAt: isCompleted ? new Date() : null,
  };
  await updateDoc(progressRef, updatedData);
};

// 特定タグの進捗を取得する関数
export const getProgressByTag = async (userId: string, tag: string) => {
  const q = query(
    collection(db, "progress"),
    where("userId", "==", userId),
    where("tag", "==", tag)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => doc.data());
};

// 次のステップを解放可能か確認
export const canUnlockNextSection = async (userId: string, tag: string) => {
  const progressList = await getProgressByTag(userId, tag);
  return progressList.every((progress) => progress.isCompleted);
};
