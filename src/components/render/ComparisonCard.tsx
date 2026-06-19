"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useChatContext } from "@/lib/ChatContext";

interface Item {
  title: string;
  highlight?: string;
  specs: { label: string; value: string }[];
  badge?: string;
}

interface Props {
  title?: string;
  items: Item[];
}

// Badge color class — mirrors badge-* classes in globals.css
const BADGE_STYLES: Record<string, string> = {
  "Best Value":  "badge-green",
  "Recommended": "badge-blue",
  "Premium":     "badge-purple",
};

export default function ComparisonCard({ title, items }: Props) {
  const { ask } = useChatContext();
  const cols = items.length === 2 ? "grid-cols-2" :
               items.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4";

  const allLabels = Array.from(new Set(items.flatMap((it) => it.specs.map((s) => s.label))));

  function itemSummary(item: Item) {
    return item.specs.map((s) => `${s.label}: ${s.value}`).join("، ");
  }

  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}

      <div className={cn("grid divide-x divide-gray-100", cols)}>
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => ask(`أخبرني بمزيد من التفاصيل والتحليل عن: "${item.title}"${item.highlight ? ` (${item.highlight})` : ""}. البيانات المتاحة: ${itemSummary(item)}. ما مزايا وعيوب هذا الخيار؟`)}
            className="comparison-item flex flex-col text-right group"
          >
            {/* Card header */}
            <div className={cn("comparison-item-header px-3 py-3 w-full", i === 0 && "featured")}>
              {item.badge && (
                <span className={cn("badge mb-1.5", BADGE_STYLES[item.badge] ?? "badge-gray")}>
                  {item.badge}
                </span>
              )}
              <h4 className="text-xs font-semibold text-gray-900 leading-tight">{item.title}</h4>
              {item.highlight && (
                <div className="comparison-highlight mt-1">{item.highlight}</div>
              )}
              <div className="ask-hint flex items-center gap-1 mt-1.5 text-xs">
                <MessageCircle className="w-3 h-3" />
                <span>اسأل للمزيد</span>
              </div>
            </div>

            {/* Aligned spec rows */}
            <div className="flex-1 divide-y divide-gray-50 w-full">
              {allLabels.map((label) => {
                const spec = item.specs.find((s) => s.label === label);
                return (
                  <div key={label} className="px-3 py-2">
                    <div className="text-xs text-gray-400">{label}</div>
                    <div className="text-xs font-medium text-gray-800 mt-0.5">
                      {spec?.value ?? "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
