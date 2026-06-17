"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

interface Stat {
  label: string;
  value: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  unit?: string;
}

interface Props {
  title?: string;
  stats: Stat[];
}

export default function StatGrid({ title, stats }: Props) {
  const cols = stats.length <= 2 ? "grid-cols-2" :
               stats.length === 3 ? "grid-cols-3" :
               "grid-cols-2 sm:grid-cols-4";

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm my-3 overflow-hidden">
      {title && (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
      )}
      <div className={cn("grid gap-px bg-gray-100", cols)}>
        {stats.map((stat, i) => (
          <div key={i} className="bg-white px-4 py-4">
            <p className="text-xs text-gray-500 mb-1 leading-tight">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-gray-900 tabular-nums">
                {stat.value}
              </span>
              {stat.unit && (
                <span className="text-xs text-gray-500">{stat.unit}</span>
              )}
            </div>
            {stat.change && (
              <div className={cn(
                "flex items-center gap-1 mt-1 text-xs font-medium",
                stat.trend === "up" && "text-green-600",
                stat.trend === "down" && "text-red-500",
                stat.trend === "neutral" && "text-gray-500",
                !stat.trend && "text-gray-500",
              )}>
                {stat.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {stat.trend === "down" && <TrendingDown className="w-3 h-3" />}
                {stat.trend === "neutral" && <Minus className="w-3 h-3" />}
                {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
