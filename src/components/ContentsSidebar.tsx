import { JSX, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Content } from "types";

interface Props {
  contents: Content[];
  currentId?: string;
}

export default function ContentsSidebar({
  contents,
  currentId,
}: Props): JSX.Element {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentCourse = searchParams.get("current-course");

  const filteredContents = contents
    .filter((content) => content.tags.includes(currentCourse || ""))
    .sort((a, b) => a.stepOrder - b.stepOrder);

  // サイドバーを閉じる関数
  const closeSidebar = () => {
    setIsOpen(false);
  };

  // リンククリック時にサイドバーを閉じる関数
  const handleLinkClick = () => {
    closeSidebar();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-5 px-4 py-2 bg-gray-100 text-gray-800 rounded-md shadow"
      >
        レッスン一覧
      </button>

      {/* オーバーレイマスク */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        ></div>
      )}

      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-50 transition-transform duration-300 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">レッスン一覧</h3>
            <button
              onClick={closeSidebar}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-2 text-start">
            {filteredContents.length > 0 ? (
              filteredContents.map((content) => (
                <Link
                  key={content.id}
                  href={{
                    pathname: `/${
                      content.type === "content" ? "content" : "task"
                    }/${content.id}`,
                    query: { "current-course": currentCourse },
                  }}
                  className={`p-3 rounded hover:bg-gray-100 
                  ${currentId === content.id ? "bg-gray-100 font-bold" : ""}`}
                  onClick={handleLinkClick}
                >
                  {content.title}
                </Link>
              ))
            ) : (
              <p className="text-gray-500">
                コースに関連するレッスンがありません
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
