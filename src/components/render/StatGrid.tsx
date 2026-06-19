"use client";

import { TrendingUp, TrendingDown, Minus, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useChatContext } from "@/lib/ChatContext";

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
  const { ask } = useChatContext();
  const cols = stats.length <= 2 ? "grid-cols-2" :
               stats.length === 3 ? "grid-cols-3" :
               "grid-cols-2 sm:grid-cols-4";

  return (
    <div className="card">
      {title && (
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
        </div>
      )}
      <div className={cn("grid gap-px bg-gray-100", cols)}>
        {stats.map((stat, i) => (
          <button
            key={i}
            onClick={() => ask(`أخبرني بمزيد من التفاصيل والتحليل عن: "${stat.label}" (القيمة الحالية: ${stat.value}${stat.unit ? " " + stat.unit : ""}${stat.change ? "، التغيير: " + stat.change : ""}). ما السياق والأسباب والتوقعات المستقبلية؟`)}
            className="stat-cell px-4 py-4 text-right group"
          >
            <p className="stat-label mb-1 leading-tight">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <span className="stat-value tabular-nums">{stat.value}</span>
              {stat.unit && (
                <span className="text-xs text-gray-500">{stat.unit}</span>
              )}
            </div>
            {stat.change && (
              <div className={cn(
                "flex items-center gap-1 mt-1 text-xs font-medium",
                stat.trend === "up" && "trend-up",
                stat.trend === "down" && "trend-down",
                (stat.trend === "neutral" || !stat.trend) && "trend-neutral",
              )}>
                {stat.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {stat.trend === "down" && <TrendingDown className="w-3 h-3" />}
                {stat.trend === "neutral" && <Minus className="w-3 h-3" />}
                {stat.change}
              </div>
            )}
            <div className="ask-hint flex items-center gap-1 mt-2 text-xs">
              <MessageCircle className="w-3 h-3" />
              <span>اسأل للمزيد</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
