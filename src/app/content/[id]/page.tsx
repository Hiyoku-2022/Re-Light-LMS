"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs, limit } from "firebase/firestore";
import { Header } from "@/components/UI/Header";

interface ContentElement {
  id: string;
  elementType: "text" | "video" | "image" | "code"; // 修正: type → elementType
  content?: string;
  url?: string;
  caption?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
}

interface Content {
  id: string;
  title: string;
  stepOrder: number; // 修正: order → stepOrder
  elements: ContentElement[];
}

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [userId] = useState("exampleUserId"); // ユーザーIDを適切に設定してください

  const contentId = Array.isArray(params?.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!contentId) return;

    const fetchContent = async () => {
      try {
        const contentRef = doc(db, "contents", contentId);
        const docSnap = await getDoc(contentRef);

        if (docSnap.exists()) {
          const fetchedContent = { id: contentId, ...docSnap.data() } as Content;
          setContent(fetchedContent);
        } else {
          console.error("指定されたコンテンツが見つかりませんでした。");
        }
      } catch (error) {
        console.error("コンテンツの取得に失敗しました", error);
      }
    };

    fetchContent();
  }, [contentId]);

  const handleComplete = async () => {
    if (!content) return;

    try {
      const userProgressRef = doc(db, "users", userId);
      await updateDoc(userProgressRef, {
        completedContents: arrayUnion(contentId),
      });

      const nextOrder = content.stepOrder + 1; // 修正: order → stepOrder
      const nextContentQuery = query(
        collection(db, "contents"),
        where("stepOrder", "==", nextOrder), // 修正: order → stepOrder
        limit(1)
      );

      const querySnapshot = await getDocs(nextContentQuery);
      if (!querySnapshot.empty) {
        const nextContent = querySnapshot.docs[0];
        const nextContentId = nextContent.id;

        alert("コンテンツを完了しました！");
        router.push(`/content/${nextContentId}`);
      } else {
        alert("次のコンテンツは存在しません。");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("進捗の更新に失敗しました", error);
    }
  };

  if (!content) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header dashboardType="user" onToggleSidebar={() => {}} />
      <div className="p-6 pt-24 max-w-4xl mx-auto bg-white rounded shadow-lg mt-4">
        <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
        <div className="prose">
          {content.elements.map((element, index) => (
            <div key={element.id || index}>
              {element.elementType === "text" && (
                <div dangerouslySetInnerHTML={{ __html: element.content || "" }} />
              )}
              {element.elementType === "video" && element.url && (
                <div className="video-container mx-auto my-4">
                  <iframe
                    src={element.url}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]"
                    title={element.caption || "Video"}
                    style={{ maxHeight: "60vh" }}
                  />
                </div>
              )}
              {element.elementType === "image" && element.url && (
                <div className="text-center my-4">
                  <Image
                    src={element.url}
                    alt={element.caption || "画像"}
                    width={element.width || 800}
                    height={element.height || 600}
                    className="mx-auto max-w-full h-auto"
                    style={element.style || {}}
                  />
                </div>
              )}
              {element.elementType === "code" && (
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                  <code>{element.content || ""}</code>
                </pre>
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button onClick={handleComplete} className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600">
            学習完了
          </button>
        </div>
      </div>
    </div>
  );
}
