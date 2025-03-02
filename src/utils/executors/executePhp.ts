export const executePhpCode = async (phpCode: string): Promise<string> => {
    const API_URL = process.env.NEXT_PUBLIC_PHP_EXECUTOR_API;
    if (!API_URL) {
      return "⚠️ 環境変数が設定されていません";
    }

    // `<?php` の重複を防ぐ
    phpCode = phpCode.trim();
    if (phpCode.startsWith("<?php")) {
        phpCode = phpCode.slice(5).trim();
    }

    try {
      console.debug("🚀 PHP Sandbox にリクエスト送信:", phpCode);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(`${API_URL}/server.php`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: phpCode }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        console.debug("❌ PHP Sandbox からのレスポンス:", response);
        return `⚠️ 実行エラー: ${response.statusText}`;
      }

      const data = await response.json();
      console.debug("🌍 PHP Sandbox からのレスポンス:", data);

      return data.output || "✅ コードが実行されましたが、出力がありません。";
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return "⚠️ 実行がタイムアウトしました";
        }
        console.debug("❌ リクエストエラー:", error);
        return "⚠️ サーバーに接続できませんでした";
      }

      console.debug("❌ 未知のエラー:", error);
      return "⚠️ 予期しないエラーが発生しました";
    }
};
