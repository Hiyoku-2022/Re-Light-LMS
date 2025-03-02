export const executeJsCode = async (jsCode: string): Promise<string> => {
    const API_URL = process.env.NEXT_PUBLIC_JS_EXECUTOR_API;
    if (!API_URL) {
      return "⚠️ 環境変数が設定されていません";
    }
  
    try {
      console.debug("🚀 Cloud Run にリクエスト送信:", jsCode);
  
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
  
      const response = await fetch(`${API_URL}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: jsCode }),
        signal: controller.signal,
      });
  
      clearTimeout(timeoutId);
  
      if (!response.ok) {
        const errorData = await response.json();
        console.debug("❌ Cloud Run からのエラーレスポンス:", errorData);
        return `⚠️ 実行エラー: ${errorData.error || "不明なエラー"}`;
      }
  
      const data = await response.json();
      console.debug("🌍 Cloud Run からのレスポンス:", data);
  
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
  