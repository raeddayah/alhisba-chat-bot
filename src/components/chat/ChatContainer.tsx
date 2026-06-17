"use client";

import { useChat } from "@ai-sdk/react";
import { useRef, useEffect, useState } from "react";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import TypingShimmer from "./TypingShimmer";
import ModelSelector from "@/components/ModelSelector";
import { DEFAULT_MODEL_ID, MODELS } from "@/lib/models";
import { cn } from "@/lib/cn";

const SUGGESTIONS = [
  "ما هي العقارات المتاحة للبيع؟",
  "أرني المزادات القادمة",
  "ما أحدث صفقات العقارات؟",
  "أعطني نظرة عامة على إحصائيات السوق",
  "قارن بين الفلل والشقق",
];

interface Props {
  token: string;
  onLogout: () => void;
}

export default function ChatContainer({ token, onLogout }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [missingKeys, setMissingKeys] = useState<string[]>([]);

  // Fetch which providers have API keys configured
  useEffect(() => {
    fetch("/api/models")
      .then((r) => r.json())
      .then(({ available }: { available: Record<string, boolean> }) => {
        const missing = Object.entries(available)
          .filter(([, ok]) => !ok)
          .map(([provider]) => provider);
        setMissingKeys(missing);
      })
      .catch(() => {});
  }, []);

  const { messages, input, setInput, handleSubmit, isLoading, error, append } = useChat({
    api: "/api/chat",
    headers: { "x-session-token": token },
    body: { modelId },
    onError: (err) => {
      console.error("Chat error:", err);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  function send(text?: string) {
    if (text) {
      append({ role: "user", content: text });
    } else {
      handleSubmit();
    }
  }

  const selectedMeta = MODELS.find((m) => m.id === modelId);
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shrink-0 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">Alhisba Assistant</div>
            <div className="flex items-center gap-1 text-xs text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Online · MCP connected
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ModelSelector
            value={modelId}
            onChange={setModelId}
            missingKeys={missingKeys}
          />
          <button
            onClick={onLogout}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors px-2 py-1 rounded hover:bg-gray-100"
          >
            تسجيل الخروج
          </button>
        </div>
      </header>

      {/* Model warning (no tool support) */}
      {selectedMeta && !selectedMeta.supportsTools && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-700 flex items-center gap-2">
          <span>⚠️</span>
          <span>
            <strong>{selectedMeta.label}</strong> لا يدعم استخدام الأدوات — سيتم تعطيل جلب البيانات عبر MCP لهذا النموذج.
          </span>
        </div>
      )}

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-4">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">كيف يمكنني مساعدتك اليوم؟</h2>
              <p className="text-gray-500 text-sm mt-1 max-w-sm">
                اسألني عن عقارات الحسبة، المزادات، الصفقات وبيانات السوق — سأعرضها لك بشكل مرئي.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className={cn(
                    "text-left text-xs bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-gray-700",
                    "hover:border-blue-300 hover:bg-blue-50 transition-all"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((m) => (
              <ChatMessage key={m.id} message={m} />
            ))}
            {isLoading && <TypingShimmer />}
          </>
        )}

        {error && (
          <div className="mx-auto max-w-sm bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-xs text-red-600 text-center mt-2">
            {error.message || "Something went wrong. Please try again."}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 shrink-0 bg-gray-50 border-t border-gray-100">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={() => send()}
          disabled={isLoading}
        />
        <p className="text-center text-xs text-gray-400 mt-2">
          Enter للإرسال · Shift+Enter لسطر جديد
        </p>
      </div>
    </div>
  );
}
