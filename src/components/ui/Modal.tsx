import React, { ReactNode } from "react";

interface ModalProps {
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ onClose, children }: ModalProps) {
  // 背景クリック時にモーダルを閉じるためのイベントハンドラー
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // e.target と e.currentTarget が一致している場合、オーバーレイがクリックされたとみなす
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={handleOverlayClick} // 背景クリック時に handleOverlayClick を実行
    >
      {/* モーダル本体 */}
      <div
        className="bg-white w-11/12 md:max-w-3xl mx-auto rounded shadow-lg z-50 relative"
        style={{ width: "70%", height: "80%", overflowY: "auto" }}
      >
        {/* モーダルのヘッダー */}
        <div className="flex justify-end p-2">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {/* モーダルのコンテンツ */}
        <div className="p-4 h-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
