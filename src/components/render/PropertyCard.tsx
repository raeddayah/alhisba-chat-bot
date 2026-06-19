"use client";

import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp, ExternalLink, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useChatContext } from "@/lib/ChatContext";

interface Props {
  title: string;
  price: string;
  location: string;
  type: string;
  specs: string[];
  badges?: string[];
  description?: string;
  url?: string;
}

// Badge color class — mirrors badge-* classes in globals.css
const BADGE_COLORS: Record<string, string> = {
  "للبيع":    "badge-green",
  "For Sale": "badge-green",
  "للإيجار":  "badge-blue",
  "For Rent": "badge-blue",
  "جديد":     "badge-orange",
  "New":      "badge-orange",
  "مزاد":     "badge-purple",
  "Auction":  "badge-purple",
};

function badgeColor(label: string) {
  return BADGE_COLORS[label] ?? "badge-gray";
}

export default function PropertyCard({ title, price, location, type, specs, badges, description, url }: Props) {
  const [expanded, setExpanded] = useState(false);
  const { ask } = useChatContext();

  return (
    <div className="property-card">
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1.5">
              <span className="badge badge-blue">{type}</span>
              {badges?.map((b) => (
                <span key={b} className={cn("badge", badgeColor(b))}>{b}</span>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{location}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="comparison-highlight">{price}</div>
          </div>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 mt-3">
          {specs.map((s) => (
            <span key={s} className="spec-tag">{s}</span>
          ))}
        </div>
      </div>

      {/* Expandable description */}
      {description && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="btn-ghost w-full flex items-center justify-between px-4 py-2 border-t border-gray-100 text-xs"
          >
            <span>{expanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expanded && (
            <div className="px-4 py-3 text-xs text-gray-600 border-t border-gray-100 leading-relaxed">
              {description}
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex border-t border-gray-100">
        <button
          onClick={() => ask(`أخبرني بمزيد من التفاصيل عن هذا العقار: "${title}" في ${location} بسعر ${price}. اذكر المزايا والعيوب ومدى ملاءمته للاستثمار.`)}
          className="btn-ask flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          اسأل عن هذا العقار
        </button>
        {url && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium"
          >
            <ExternalLink className="w-3 h-3" />
            عرض
          </a>
        )}
      </div>
    </div>
  );
}
