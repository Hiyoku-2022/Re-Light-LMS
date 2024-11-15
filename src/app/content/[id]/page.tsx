"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc, arrayUnion, collection, query, where, getDocs, limit } from "firebase/firestore";
import { Header } from "@/components/UI/Header";

interface Content {
  title: string;
  order: number;
  elements: Array<{
    id: string;
    type: "text" | "video" | "image" | "code";
    content?: string;
    url?: string;
    caption?: string;
    style?: React.CSSProperties;
    width?: number;
    height?: number;  
  }>;
}

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [userId, setUserId] = useState("exampleUserId");

  const contentId = Array.isArray(params?.id) ? params.id[0] : params.id;

  useEffect(() => {
    if (!contentId) return;

    const fetchContent = async () => {
      try {
        const contentRef = doc(db, "contents", contentId);
        const docSnap = await getDoc(contentRef);

        if (docSnap.exists()) {
          setContent(docSnap.data() as Content);
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

      const nextOrder = content.order + 1;
      const nextContentQuery = query(
        collection(db, "contents"),
        where("order", "==", nextOrder),
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
      <div className="p-6 max-w-4xl mx-auto bg-white rounded shadow-lg mt-4">
        <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
        <div className="prose">
          {content.elements.map((element, index) => (
            <div key={index}>
              {element.type === "text" && <div dangerouslySetInnerHTML={{ __html: element.content || "" }} />}
              {element.type === "video" && element.url && (
                <div className="video-container mx-auto my-4">
                  <iframe
                    src={element.url}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]"
                    title={element.caption || "Vimeo Video"}
                    style={{ maxHeight: "80vh" }}
                  />
                </div>
              )}
              {element.type === "image" && (
                <div className="text-center">
                  <Image
                    src={element.url || ""} 
                    alt={element.caption || "画像"} 
                    width={element.width || 800}
                    height={element.height || 600}
                    className="mx-auto max-w-full h-auto" 
                    style={element.style || {}}
                  />
                </div>
              )}
              {element.type === "code" && (
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
