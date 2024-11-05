"use client";

import { useEffect, useState } from "react";
import { db } from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import React from "react";

// ページ用の型を定義
interface Content {
  id: string;
  title: string;
  description: string;
  tags: string[];
  order: number;
  elements: { id: string; type: string; content?: string; url?: string }[];
}

interface CoursePageProps {
  params: { course: string };
}

// コースページコンポーネント
const CoursePage: React.FC<CoursePageProps> = ({ params }) => {
  const [contents, setContents] = useState<Content[]>([]);
  const courseName = params.course;

  // Firestoreから該当するタグを持つコンテンツを取得
  useEffect(() => {
    const getContentsByTag = async (tag: string) => {
      try {
        const contentRef = collection(db, "contents");
        const q = query(contentRef, where("tags", "array-contains", tag));
        const querySnapshot = await getDocs(q);
  
        const fetchedContents: Content[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Content[];
  
        // orderフィールドに基づいてソート
        const sortedContents = fetchedContents.sort((a, b) => a.order - b.order);
  
        setContents(sortedContents);
      } catch (error) {
        console.error("Error fetching content data: ", error);
      }
    };
  
    getContentsByTag(courseName);
  }, [courseName]);
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto bg-white p-6 shadow rounded">
        <h1 className="text-2xl font-bold mb-4">
          {courseName.toUpperCase()} コース
        </h1>
        <p className="mb-6 text-gray-600">
          {courseName.toUpperCase()} の学習に役立つコンテンツ一覧を表示しています。
        </p>

        {/* コンテンツリストを表示 */}
        <div className="space-y-4">
          {contents.length > 0 ? (
            contents.map((content) => (
              <div key={content.id} className="p-4 border rounded-lg bg-gray-50 shadow-md">
                <h2 className="text-lg font-semibold mb-2">{content.title}</h2>
                <p className="text-gray-600">{content.description}</p>
                <Link href={`/content/${content.id}`}>
                  <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                    詳細を表示
                  </button>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500">現在、{courseName} に関連するコンテンツはありません。</p>
          )}
        </div>

        {/* 戻るボタン */}
        <div className="mt-6">
          <Link href="/dashboard">
            <button className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition">
              ダッシュボードに戻る
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoursePage;
