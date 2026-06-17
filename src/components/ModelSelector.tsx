"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { MODELS, PROVIDER_NAMES, type ModelOption } from "@/lib/models";
import { cn } from "@/lib/cn";

// Group models by provider
const GROUPED = MODELS.reduce<Record<string, ModelOption[]>>((acc, m) => {
  (acc[m.provider] ??= []).push(m);
  return acc;
}, {});

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "bg-orange-100 text-orange-700",
  openai:    "bg-emerald-100 text-emerald-700",
  deepseek:  "bg-blue-100 text-blue-700",
  google:    "bg-red-100 text-red-700",
  groq:      "bg-purple-100 text-purple-700",
  xai:       "bg-gray-100 text-gray-700",
  mistral:   "bg-yellow-100 text-yellow-700",
  zhipu:     "bg-cyan-100 text-cyan-700",
};

interface Props {
  value: string;
  onChange: (id: string) => void;
  /** IDs of providers whose API key is missing */
  missingKeys?: string[];
}

export default function ModelSelector({ value, onChange, missingKeys = [] }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = MODELS.find((m) => m.id === value) ?? MODELS[0];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors",
          "bg-white border-gray-200 hover:border-gray-300 text-gray-700",
          open && "border-blue-300 ring-2 ring-blue-100"
        )}
      >
        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold", PROVIDER_COLORS[selected.provider])}>
          {PROVIDER_NAMES[selected.provider]}
        </span>
        <span className="max-w-[110px] truncate">{selected.label}</span>
        <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(GROUPED).map(([provider, models]) => {
              const keyMissing = missingKeys.includes(provider);
              return (
                <div key={provider}>
                  <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded", PROVIDER_COLORS[provider])}>
                      {PROVIDER_NAMES[provider]}
                    </span>
                    {keyMissing && (
                      <span className="flex items-center gap-1 text-[10px] text-amber-600">
                        <AlertCircle className="w-3 h-3" />
                        No API key
                      </span>
                    )}
                  </div>
                  {models.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => { onChange(m.id); setOpen(false); }}
                      disabled={keyMissing}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors",
                        "hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed",
                        value === m.id && "bg-blue-50"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {value === m.id
                          ? <Check className="w-3 h-3 text-blue-600 shrink-0" />
                          : <span className="w-3 h-3 shrink-0" />
                        }
                        <span className={cn("font-medium", value === m.id ? "text-blue-700" : "text-gray-800")}>
                          {m.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {m.badge && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                            {m.badge}
                          </span>
                        )}
                        {!m.supportsTools && (
                          <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded">
                            no tools
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
       
        </div>
      )}
    </div>
  );
}
