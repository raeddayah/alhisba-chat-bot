"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown, MessageCircle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useChatContext } from "@/lib/ChatContext";

interface Column {
  key: string;
  label: string;
  numeric?: boolean;
}

interface Props {
  title: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  description?: string;
}

type Direction = "asc" | "desc";

export default function TableCard({ title, columns, rows, description }: Props) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [direction, setDirection] = useState<Direction>("asc");
  const { ask } = useChatContext();

  function toggleSort(key: string) {
    if (sortKey === key) {
      setDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("asc");
    }
  }

  const sorted = sortKey
    ? [...rows].sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const n = (v: unknown) => (typeof v === "number" ? v : parseFloat(String(v)) || 0);
        const cmp = typeof av === "number" || typeof bv === "number"
          ? n(av) - n(bv)
          : String(av ?? "").localeCompare(String(bv ?? ""), undefined, { numeric: true });
        return direction === "asc" ? cmp : -cmp;
      })
    : rows;

  function SortIcon({ col }: { col: string }) {
    if (sortKey !== col) return <ChevronsUpDown className={cn("w-3 h-3", "sort-icon")} />;
    return direction === "asc"
      ? <ChevronUp className={cn("w-3 h-3", "sort-icon-active")} />
      : <ChevronDown className={cn("w-3 h-3", "sort-icon-active")} />;
  }

  function rowSummary(row: Record<string, unknown>) {
    return columns.map((c) => `${c.label}: ${row[c.key] ?? "—"}`).join(" | ");
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        {description && <p className="card-subtitle mt-0.5">{description}</p>}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={cn(
                    "table-th px-3 py-2 text-left",
                    col.numeric && "text-right"
                  )}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    <SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th className="table-th px-3 py-2 w-8" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((row, i) => (
              <tr
                key={i}
                onClick={() => ask(`أخبرني بمزيد من التفاصيل والتحليل عن هذا الصف من جدول "${title}": ${rowSummary(row)}`)}
                className="table-row group"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn(
                      "table-cell px-3 py-2",
                      col.numeric && "text-right tabular-nums"
                    )}
                  >
                    {String(row[col.key] ?? "—")}
                  </td>
                ))}
                <td className="ask-hint px-3 py-2">
                  <MessageCircle className="w-3.5 h-3.5" />
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-gray-400">
                  لا توجد بيانات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card-footer">
        {sorted.length} سجل · انقر على صف للاستفسار عنه
      </div>
    </div>
  );
}
