"use client";

import { useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export default function ChatInput({ value, onChange, onSend, disabled }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSend();
    }
  }

  return (
    <div className={cn(
      "flex items-end gap-2 bg-white border border-gray-300 rounded-2xl px-4 py-3 shadow-sm transition-all",
      "focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100"
    )}>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="اسأل عن العقارات، المزادات، الصفقات، اتجاهات السوق..."
        disabled={disabled}
        rows={1}
        dir="auto"
        className="flex-1 resize-none outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent max-h-40 leading-relaxed"
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all",
          "bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
        )}
        aria-label="Send"
      >
        <ArrowUp className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
