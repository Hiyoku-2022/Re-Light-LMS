"use client";

import React, { useRef, useState, useEffect } from "react";
import ReactDOM from "react-dom";
import * as marked from "marked";
import hljs from "highlight.js";
import "highlight.js/styles/github-dark.css";
import "@/styles/typing-indicator.css";

type ChatHistoryItem = {
  question: string;
  answer: string;
};

interface ChatComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

(marked as any).setOptions({
  highlight: (code: string, lang: string) => {
    const validLang = hljs.getLanguage(lang) ? lang : "plaintext";
    return hljs.highlight(code, { language: validLang }).value;
  },
});

const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || "";
const DAILY_LIMIT = 20;
const STORAGE_KEY = "dailyQuestionLimit";

const getTodayString = () => {
  return new Date().toISOString().split("T")[0];
};

const canSendToday = (): boolean => {
  const record = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  const today = getTodayString();
  if (!record || record.date !== today) return true;
  return record.count < DAILY_LIMIT;
};

const incrementDailyCount = () => {
  const today = getTodayString();
  const record = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  if (!record || record.date !== today) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 1 }));
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: record.count + 1 }));
  }
};

const ChatComponent: React.FC<ChatComponentProps> = ({ isOpen, onClose }) => {
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const questionInputRef = useRef<HTMLTextAreaElement>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (isOpen) loadChatHistory();
  }, [isOpen]);

  if (!isOpen) return null;

  const sendQuestion = async () => {
    const question = questionInputRef.current?.value.trim();
    if (!question) return;

    if (!canSendToday()) {
      addMessage("ai", "<p>今日は質問の上限（20回）に達しました。明日またご利用ください。</p>");
      return;
    }

    addMessage("user", question);
    if (questionInputRef.current) questionInputRef.current.value = "";

    if (chatBoxRef.current) {
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "typing-indicator flex items-center gap-1 mt-2.5";
      loadingDiv.innerHTML = "<span></span><span></span><span></span>";
      chatBoxRef.current.appendChild(loadingDiv);
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;

      try {
        setLoadingAI(true);
        const aiResponseText = await fetchAIResponse(question);
        loadingDiv.remove();
        setLoadingAI(false);

        const formattedResponse = (marked as any).parse(aiResponseText.trim());
        addMessage("ai", formattedResponse);
        saveToLocalStorage(question, formattedResponse);
        incrementDailyCount();
      } catch (error) {
        console.error("OpenAI API error:", error);
        loadingDiv.remove();
        setLoadingAI(false);
        addMessage("ai", "<p>エラーが発生しました。しばらくしてから再度お試しください。</p>");
      }
    }
  };

  const fetchAIResponse = async (question: string): Promise<string> => {
    const requestBody = {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            `あなたは受講者の学習をサポートするAIです。絶対に課題の答えやコード全体を直接教えてはいけません。ヒントや考え方の整理、似た例の提示などを通して学習者が自力で考えることを支援してください。「答えを教えて」と要求された場合は、やんわりと断ってください。`,
        },
        { role: "user", content: question },
      ],
      max_tokens: 512,
      temperature: 0.7,
    };

    const res = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API Error: ${res.status} ${res.statusText} - ${errText}`);
    }

    const data = await res.json();
    return data?.choices?.[0]?.message?.content ?? "No response";
  };

  const addMessage = (role: "user" | "ai", content: string) => {
    if (!chatBoxRef.current) return;
    const messageDiv = document.createElement("div");

    if (role === "ai") {
      messageDiv.className = "w-full p-3 bg-gray-50 text-black text-left relative break-words mb-2.5 border border-gray-200 rounded";
      messageDiv.innerHTML = content;
      setTimeout(() => {
        messageDiv.querySelectorAll("pre code").forEach((block) => {
          hljs.highlightElement(block as HTMLElement);
        });
      }, 0);
    } else {
      messageDiv.className = "bg-blue-500 text-white self-end text-left max-w-[75%] p-2.5 rounded-tl-xl rounded-tr-xl rounded-bl-xl rounded-br-none relative break-words mb-2.5";
      messageDiv.textContent = content;
    }

    chatBoxRef.current.appendChild(messageDiv);
    chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
  };

  const saveToLocalStorage = (question: string, answer: string) => {
    const history: ChatHistoryItem[] = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    history.push({ question, answer });
    const newHistory = history.slice(-10);
    localStorage.setItem("chatHistory", JSON.stringify(newHistory));
  };

  const loadChatHistory = () => {
    if (!chatBoxRef.current) return;
    chatBoxRef.current.innerHTML = "";
    const history: ChatHistoryItem[] = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    history.forEach((item) => {
      addMessage("user", item.question);
      addMessage("ai", item.answer);
    });
  };

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white p-6 w-[90%] max-w-2xl rounded-xl shadow-2xl text-left flex flex-col items-center relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 bg-transparent border-0 cursor-pointer"
        >
          ×
        </button>
        <h2 className="w-full text-2xl font-bold text-center text-gray-700 pb-3 bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
          Ask AI
        </h2>
        <div
          ref={chatBoxRef}
          className="w-full h-72 overflow-y-auto border border-gray-300 p-2.5 bg-white mb-2.5 flex flex-col"
        ></div>
        <div className="flex items-center w-full bg-gray-100 p-1.5 rounded-lg border border-gray-300">
          <textarea
            ref={questionInputRef}
            placeholder="質問を入力..."
            className="flex-1 h-12 p-2.5 border-0 rounded resize-none max-h-[7.5rem] overflow-y-auto outline-none bg-transparent placeholder:text-sm"
          ></textarea>
          <button
            onClick={sendQuestion}
            disabled={loadingAI}
            className="bg-blue-500 rounded-full w-10 h-10 text-lg flex items-center justify-center text-white ml-2 disabled:bg-gray-400"
          >
            ➤
          </button>
        </div>
        <p className="text-xs text-red-500 mt-3 p-1.5 border-t border-gray-300">
          ⚠ AIの回答は必ずしも正確ではありません。重要な情報は他のソースでも確認してください。
        </p>
      </div>
    </div>,
    document.body
  );
};

export default ChatComponent;
