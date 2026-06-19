"use client";

import { useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";

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
    <div className="input-box flex items-end gap-2 px-4 py-3">
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
        className="btn-send shrink-0 w-8 h-8 flex items-center justify-center"
        aria-label="Send"
      >
        <ArrowUp className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
