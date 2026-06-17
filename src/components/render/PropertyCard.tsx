"use client";

import { useState } from "react";
import { MapPin, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/cn";

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

const BADGE_COLORS: Record<string, string> = {
  "للبيع": "bg-green-100 text-green-700",
  "For Sale": "bg-green-100 text-green-700",
  "للإيجار": "bg-blue-100 text-blue-700",
  "For Rent": "bg-blue-100 text-blue-700",
  "جديد": "bg-orange-100 text-orange-700",
  "New": "bg-orange-100 text-orange-700",
  "مزاد": "bg-purple-100 text-purple-700",
  "Auction": "bg-purple-100 text-purple-700",
};

function badgeColor(label: string) {
  return BADGE_COLORS[label] ?? "bg-gray-100 text-gray-600";
}

export default function PropertyCard({ title, price, location, type, specs, badges, description, url }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn(
      "bg-white border border-gray-200 rounded-2xl shadow-sm my-3 overflow-hidden",
      "hover:shadow-md hover:border-blue-200 transition-all duration-200"
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-1.5">
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {type}
              </span>
              {badges?.map((b) => (
                <span key={b} className={cn("text-xs px-2 py-0.5 rounded-full font-medium", badgeColor(b))}>
                  {b}
                </span>
              ))}
            </div>
            <h3 className="text-sm font-semibold text-gray-900 leading-tight">{title}</h3>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{location}</span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-base font-bold text-blue-700">{price}</div>
          </div>
        </div>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 mt-3">
          {specs.map((s) => (
            <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-lg">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Expandable description */}
      {description && (
        <>
          <button
            onClick={() => setExpanded((e) => !e)}
            className="w-full flex items-center justify-between px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <span>{expanded ? "Hide details" : "Show details"}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {expanded && (
            <div className="px-4 py-3 text-xs text-gray-600 border-t border-gray-100 leading-relaxed">
              {description}
            </div>
          )}
        </>
      )}

      {/* CTA */}
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View Property
        </a>
      )}
    </div>
  );
}
