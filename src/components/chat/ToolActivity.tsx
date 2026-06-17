"use client";

import { useState } from "react";
import { ChevronDown, Wrench, Database, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/cn";
import type { ToolInvocation } from "ai";

const RENDER_TOOLS = new Set([
  "renderChart", "renderTable", "renderPropertyCard", "renderStatGrid", "renderComparison",
]);

function ToolBadge({ name }: { name: string }) {
  const isRender = RENDER_TOOLS.has(name);
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded",
      isRender
        ? "bg-purple-100 text-purple-700"
        : "bg-blue-100 text-blue-700"
    )}>
      {isRender ? <LayoutGrid className="w-2.5 h-2.5" /> : <Database className="w-2.5 h-2.5" />}
      {name}
    </span>
  );
}

function StatusDot({ invocation }: { invocation: ToolInvocation }) {
  const hasResult = "result" in invocation;
  return (
    <span className={cn(
      "w-1.5 h-1.5 rounded-full shrink-0 mt-1",
      hasResult ? "bg-green-500" : "bg-yellow-400 animate-pulse"
    )} />
  );
}

interface Props {
  toolInvocations: ToolInvocation[];
}

export default function ToolActivity({ toolInvocations }: Props) {
  // Open by default so user can see what's happening
  const [open, setOpen] = useState(false);

  if (!toolInvocations.length) return null;

  const mcpCalls = toolInvocations.filter((t) => !RENDER_TOOLS.has(t.toolName));
  const renderCalls = toolInvocations.filter((t) => RENDER_TOOLS.has(t.toolName));

  return (
    <div className="mt-2 rounded-xl border border-gray-200 overflow-hidden text-xs bg-white">
      {/* Tab header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors border-b border-gray-200"
      >
        <Wrench className="w-3 h-3 text-gray-400" />
        <span className="font-medium text-gray-700">Tool Activity</span>
        <div className="flex gap-1 ml-1">
          {mcpCalls.length > 0 && (
            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {mcpCalls.length} MCP
            </span>
          )}
          {renderCalls.length > 0 && (
            <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {renderCalls.length} render
            </span>
          )}
        </div>
        <ChevronDown className={cn("w-3 h-3 ml-auto transition-transform text-gray-400", open && "rotate-180")} />
      </button>

      {open && (
        <div className="divide-y divide-gray-100">
          {toolInvocations.map((t, i) => {
            const hasResult = "result" in t;
            const isRender = RENDER_TOOLS.has(t.toolName);

            return (
              <div key={i} className="px-3 py-2.5 flex gap-2">
                <StatusDot invocation={t} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <ToolBadge name={t.toolName} />
                    <span className={cn(
                      "text-[10px]",
                      hasResult ? "text-green-600" : "text-yellow-600"
                    )}>
                      {hasResult ? "✓ completed" : "⏳ pending"}
                    </span>
                  </div>

                  {/* Input args */}
                  {t.args && Object.keys(t.args as object).length > 0 && (
                    <div className="mb-1">
                      <span className="text-gray-400 font-medium">Input: </span>
                      <span className="font-mono text-gray-600 break-all">
                        {JSON.stringify(t.args).slice(0, 200)}
                        {JSON.stringify(t.args).length > 200 ? "…" : ""}
                      </span>
                    </div>
                  )}

                  {/* Result — only for MCP tools (render tools have no result) */}
                  {hasResult && !isRender && (
                    <div>
                      <span className="text-gray-400 font-medium">Result: </span>
                      <span className="font-mono text-gray-600 break-all">
                        {typeof t.result === "string"
                          ? t.result.slice(0, 300) + (t.result.length > 300 ? "…" : "")
                          : JSON.stringify(t.result).slice(0, 300)}
                      </span>
                    </div>
                  )}

                  {isRender && (
                    <span className="text-gray-400 italic">→ rendered as component above</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
