"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, AlertCircle } from "lucide-react";
import { MODELS, PROVIDER_NAMES, type ModelOption } from "@/lib/models";
import { cn } from "@/lib/cn";

const GROUPED = MODELS.reduce<Record<string, ModelOption[]>>((acc, m) => {
  (acc[m.provider] ??= []).push(m);
  return acc;
}, {});

interface Props {
  value: string;
  onChange: (id: string) => void;
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
        className={cn("model-btn flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium", open && "is-open")}
      >
        {/* Provider pill — class is e.g. "provider-anthropic" defined in globals.css */}
        <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-semibold", `provider-${selected.provider}`)}>
          {PROVIDER_NAMES[selected.provider]}
        </span>
        <span className="max-w-[110px] truncate">{selected.label}</span>
        <ChevronDown className={cn("w-3 h-3 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="model-dropdown absolute right-0 top-full mt-1 w-72 z-50 overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            {Object.entries(GROUPED).map(([provider, models]) => {
              const keyMissing = missingKeys.includes(provider);
              return (
                <div key={provider}>
                  <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-100">
                    <span className={cn("text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded", `provider-${provider}`)}>
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
                        "model-option w-full flex items-center justify-between px-3 py-2 text-xs text-left",
                        value === m.id && "is-selected"
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
