"use client";

import { cn } from "@/lib/cn";

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

const BADGE_STYLES: Record<string, string> = {
  "Best Value": "bg-green-100 text-green-700 border-green-200",
  "Recommended": "bg-blue-100 text-blue-700 border-blue-200",
  "Premium": "bg-purple-100 text-purple-700 border-purple-200",
};

export default function ComparisonCard({ title, items }: Props) {
  const cols = items.length === 2 ? "grid-cols-2" :
               items.length === 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4";

  // Collect all unique spec labels for aligned rows
  const allLabels = Array.from(new Set(items.flatMap((it) => it.specs.map((s) => s.label))));

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm my-3 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
      )}

      <div className={cn("grid divide-x divide-gray-100", cols)}>
        {items.map((item, i) => (
          <div key={i} className="flex flex-col">
            {/* Card header */}
            <div className={cn(
              "px-3 py-3 border-b border-gray-100",
              i === 0 && "bg-blue-50"
            )}>
              {item.badge && (
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded-full border font-medium mb-1.5 inline-block",
                  BADGE_STYLES[item.badge] ?? "bg-gray-100 text-gray-600 border-gray-200"
                )}>
                  {item.badge}
                </span>
              )}
              <h4 className="text-xs font-semibold text-gray-900 leading-tight">{item.title}</h4>
              {item.highlight && (
                <div className="text-base font-bold text-blue-700 mt-1">{item.highlight}</div>
              )}
            </div>

            {/* Aligned spec rows */}
            <div className="flex-1 divide-y divide-gray-50">
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
          </div>
        ))}
      </div>
    </div>
  );
}
