"use client";

import React from "react";
import GitHubCalendar from "react-github-calendar"; // インストールしたライブラリをインポート

export default function LearningProgressCalendar() {
  return (
    <div className="flex justify-center items-center p-4">
      <GitHubCalendar
        username="example-user" // GitHub のユーザー名を設定（後で学習データに変更）
        blockSize={5} // 各ブロックのサイズを調整（デフォルトは 12）
        blockMargin={2} // 各ブロックの間隔を調整
        fontSize={14} // 月名などのフォントサイズを調整
        colorScheme="light" // ライトモードを指定
      />
    </div>
  );
}
