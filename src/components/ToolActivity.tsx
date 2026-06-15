"use client";

import { useState } from "react";

interface Tool {
  tool: string;
  input: unknown;
  output?: string;
}

export default function ToolActivity({ tools }: { tools: Tool[] }) {
  const [open, setOpen] = useState(false);

  if (!tools.length) return null;

  return (
    <div className="mt-2 border border-blue-100 rounded-lg overflow-hidden text-xs">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span className="font-medium">{tools.length} tool{tools.length > 1 ? "s" : ""} called</span>
        <svg
          className={`w-3 h-3 ml-auto transition-transform ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="divide-y divide-blue-50 bg-white">
          {tools.map((t, i) => (
            <div key={i} className="px-3 py-2">
              <div className="font-mono font-semibold text-blue-800">{t.tool}</div>
              <div className="mt-1 text-gray-500">
                <span className="font-medium text-gray-700">Input: </span>
                <span className="font-mono">{JSON.stringify(t.input)}</span>
              </div>
              {t.output && (
                <div className="mt-0.5 text-gray-500">
                  <span className="font-medium text-gray-700">Result: </span>
                  <span className="truncate block max-h-16 overflow-y-auto">{t.output}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
