"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { db } from "@/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Header } from "@/components/UI/Header";
import Player from "@vimeo/player";
import { updateProgress } from "@/utils/progressService";
import type { Content } from "types";
import ContentsSidebar from "@/components/ContentsSidebar";
import ChatComponent from '@/components/AIChat';

export default function ContentPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allContents, setAllContents] = useState<Content[]>([]);

  const contentId = Array.isArray(params?.id) ? params.id[0] : params.id;

  useEffect(() => {
    const auth = getAuth();

    // ユーザー情報を取得
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        router.push("/");
      }
      setLoading(false); // ローディング終了
    });

    return () => unsubscribe(); // クリーンアップ
  }, [router]);

  useEffect(() => {
    if (!contentId || !userId) return; // ローディング中は処理をスキップ

    const fetchContents = async () => {
      try {
        // コンテンツ取得
        const contentRef = doc(db, "contents", contentId);
        const docSnap = await getDoc(contentRef);

        if (docSnap.exists()) {
          const fetchedContent = {
            id: contentId,
            ...docSnap.data(),
          } as Content;
          setContent(fetchedContent);

          // 全コンテンツ取得を追加
          const contentsQuery = query(collection(db, "contents"));
          const contentsSnap = await getDocs(contentsQuery);
          const fetchedContents = contentsSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Content[];

          setAllContents(fetchedContents);
        } else {
          console.error("指定されたコンテンツが見つかりませんでした。");
        }

        // ユーザー進捗取得
        const progressRef = doc(db, "progress", `${userId}_${contentId}`);
        const progressSnap = await getDoc(progressRef);

        if (progressSnap.exists()) {
          const progress = progressSnap.data();
          if (progress.isCompleted) {
            setHasWatched(true);
            setIsComplete(true); // 視聴済みの場合はボタンを有効に
          }
        }
      } catch (error) {
        console.error("データの取得に失敗しました", error);
      }
    };

    fetchContents();
  }, [contentId, userId]);

  const searchParams  = useSearchParams();
  const currentCourse = searchParams.get("current-course") ?? "";

  const buildNextHref = (base: string) =>
    currentCourse
      ? `${base}?current-course=${encodeURIComponent(currentCourse)}`
      : base;

  const handleComplete = async () => {
    if (!content || !userId) return;
  
    try {
      const nextOrder = content.stepOrder + 1;
      const nextContentQuery = query(
        collection(db, "contents"),
        where("stepOrder", "==", nextOrder),
        limit(1)
      );
  
      const querySnapshot = await getDocs(nextContentQuery);
      if (!querySnapshot.empty) {
        const nextContent     = querySnapshot.docs[0];
        const nextContentId   = nextContent.id;
        const nextContentType = nextContent.data().type;
  
        alert("コンテンツを完了しました！");
  
        if (nextContentType === "task") {
          router.push(buildNextHref(`/task/${nextContentId}`));
        } else if (nextContentType === "content") {
          router.push(buildNextHref(`/content/${nextContentId}`));
        } else {
          console.error("不明なコンテンツタイプです:", nextContentType);
          router.push("/dashboard");
        }
      } else {
        alert("次のコンテンツは存在しません。");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("次のコンテンツへの移動に失敗しました", error);
    }
  };

  const handleVideoReady = (elementId: string) => {
    const iframe = document.getElementById(
      `video-${elementId}`
    ) as HTMLIFrameElement;
    const player = new Player(iframe);

    player.on("ended", async () => {
      if (!userId) return;

      try {
        // 動画視聴完了時に進捗をFirestoreに登録
        await updateProgress(userId, contentId, true);
        setIsComplete(true);
        console.log("動画視聴完了。進捗をFirestoreに登録しました。");
      } catch (error) {
        console.error("Firestoreへの進捗登録に失敗しました", error);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        コンテンツが見つかりません
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header dashboardType="user" onToggleSidebar={() => {}} />
      <div className="p-6 pt-24 max-w-4xl mx-auto bg-white rounded shadow-lg mt-4">
        <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
        <div className="prose">
          {content.elements && content.elements.length > 0 ? ( // 修正: 条件付きで map を実行
            content.elements.map((element, index) => (
              <div key={element.id || index}>
                {element.elementType === "text" && (
                  <div
                    dangerouslySetInnerHTML={{ __html: element.content || "" }}
                  />
                )}
                {element.elementType === "video" && element.url && (
                  <div className="video-container mx-auto my-4">
                    <iframe
                      id={`video-${element.id}`}
                      src={element.url}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] xl:h-[700px]"
                      title={element.caption || "Video"}
                      style={{ maxHeight: "60vh" }}
                      onLoad={() => handleVideoReady(element.id)}
                    />
                  </div>
                )}
                {element.elementType === "image" && element.url && (
                  <div className="text-center my-4 flex justify-center">
                    <Image
                      src={element.url}
                      alt={element.caption || "画像"}
                      width={element.width || 800}
                      height={element.height || 600}
                      style={{ width: "80%", height: "auto", ...element.style }}
                    />
                  </div>
                )}
                {element.elementType === "code" && element.content && (
                  <div className="my-4">
                    <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
                      <code>{element.content}</code>
                    </pre>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>このコンテンツには表示可能な要素がありません。</p>
          )}
        </div>
        <div className="text-center mt-8">
          <button
            onClick={handleComplete}
            className={`px-6 py-3 rounded ${
              isComplete
                ? "bg-green-500 text-white hover:bg-green-600"
                : "bg-gray-300 text-gray-600 cursor-not-allowed"
            }`}
            disabled={!isComplete}
          >
            学習完了
          </button>
          <ContentsSidebar contents={allContents} currentId={contentId} />
        </div>
      </div>
    </div>
  );
}
