"use client";

import type { Message } from "ai";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import ToolActivity from "./ToolActivity";
import ChartCard from "@/components/render/ChartCard";
import TableCard from "@/components/render/TableCard";
import PropertyCard from "@/components/render/PropertyCard";
import StatGrid from "@/components/render/StatGrid";
import ComparisonCard from "@/components/render/ComparisonCard";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="absolute top-2 right-2 p-1 rounded bg-gray-700/80 hover:bg-gray-600 text-gray-300 transition-colors"
      aria-label="Copy code"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ToolResult({ toolName, args }: { toolName: string; args: any }) {
  switch (toolName) {
    case "renderChart":
      return <ChartCard {...args} />;
    case "renderTable":
      return <TableCard {...args} />;
    case "renderPropertyCard":
      return <PropertyCard {...args} />;
    case "renderStatGrid":
      return <StatGrid {...args} />;
    case "renderComparison":
      return <ComparisonCard {...args} />;
    default:
      return null;
  }
}

export default function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  const renderTools = message.toolInvocations?.filter((t) =>
    ["renderChart", "renderTable", "renderPropertyCard", "renderStatGrid", "renderComparison"].includes(t.toolName)
  ) ?? [];

  const hasText = typeof message.content === "string" && message.content.trim().length > 0;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4 items-start`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5 mr-2">
          A
        </div>
      )}

      <div className={`max-w-[85%] ${isUser ? "order-1" : ""}`}>
        {/* Text bubble */}
        {isUser && hasText && (
          <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-3">
            <p className="text-sm whitespace-pre-wrap">{message.content as string}</p>
          </div>
        )}

        {!isUser && hasText && (
          <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
            <div className="prose-chat text-sm">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isBlock = match || String(children).includes("\n");
                    if (isBlock) {
                      return (
                        <div className="relative mt-2 mb-2 rounded-lg overflow-hidden border border-gray-200">
                          <CopyButton text={String(children)} />
                          <SyntaxHighlighter
                            style={oneLight}
                            language={match?.[1] || "text"}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: 0, fontSize: "0.75rem" }}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }
                    return (
                      <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                        {children}
                      </code>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto my-2">
                        <table className="min-w-full">{children}</table>
                      </div>
                    );
                  },
                }}
              >
                {message.content as string}
              </ReactMarkdown>
            </div>
          </div>
        )}

        {/* Render tool results (generative UI) */}
        {!isUser && renderTools.map((t) => (
          <ToolResult key={t.toolCallId} toolName={t.toolName} args={t.args as Record<string, unknown>} />
        ))}

        {/* MCP tool activity (collapsible) */}
        {!isUser && message.toolInvocations && message.toolInvocations.length > 0 && (
          <ToolActivity toolInvocations={message.toolInvocations} />
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold shrink-0 mt-0.5 ml-2">
          U
        </div>
      )}
    </div>
  );
}
