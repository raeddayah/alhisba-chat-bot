"use client";

import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { useChatContext } from "@/lib/ChatContext";

// Chart palette — mirrors --chart-1 … --chart-6 in globals.css
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

interface Props {
  title: string;
  type: "bar" | "line" | "pie" | "area";
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  description?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartPayload = { activePayload?: { payload: Record<string, unknown> }[]; activeLabel?: any };

export default function ChartCard({ title, type, data, xKey, yKey, description }: Props) {
  const { ask } = useChatContext();
  const commonProps = { data, margin: { top: 4, right: 16, left: 0, bottom: 4 } };
  const axisProps = { style: { fontSize: 11 } };

  function handleChartClick(payload: ChartPayload) {
    if (!payload?.activePayload?.length) return;
    const point = payload.activePayload[0].payload;
    const label = point[xKey];
    const value = point[yKey];
    ask(`أخبرني بمزيد من التفاصيل والتحليل عن نقطة البيانات هذه من الرسم البياني "${title}": ${xKey}=${label}، ${yKey}=${value}. ما الأسباب والسياق والتوقعات؟`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function handlePieClick(entry: any) {
    const label = entry[xKey] ?? entry.name;
    const value = entry[yKey] ?? entry.value;
    ask(`أخبرني بمزيد من التفاصيل والتحليل عن هذا القطاع من الرسم البياني "${title}": ${label} = ${value}. ما الأسباب والسياق؟`);
  }

  return (
    <div className="card p-4 w-full">
      <h3 className="card-title mb-1">{title}</h3>
      <p className="card-subtitle mb-3">انقر على أي نقطة للاستفسار عنها</p>

      <ResponsiveContainer width="100%" height={220}>
        {type === "bar" ? (
          <BarChart {...commonProps} onClick={handleChartClick} style={{ cursor: "pointer" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tick={axisProps} />
            <YAxis tick={axisProps} />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey} fill={COLORS[0]} radius={[4, 4, 0, 0]} isAnimationActive />
          </BarChart>
        ) : type === "line" ? (
          <LineChart {...commonProps} onClick={handleChartClick} style={{ cursor: "pointer" }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tick={axisProps} />
            <YAxis tick={axisProps} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey={yKey} stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6, style: { cursor: "pointer" } }} isAnimationActive />
          </LineChart>
        ) : type === "area" ? (
          <AreaChart {...commonProps} onClick={handleChartClick} style={{ cursor: "pointer" }}>
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.15} />
                <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey={xKey} tick={axisProps} />
            <YAxis tick={axisProps} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey={yKey} stroke={COLORS[0]} fill="url(#grad)" strokeWidth={2} isAnimationActive />
          </AreaChart>
        ) : (
          <PieChart>
            <Pie
              data={data}
              dataKey={yKey}
              nameKey={xKey}
              cx="50%"
              cy="50%"
              outerRadius={90}
              isAnimationActive
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
              onClick={handlePieClick}
              style={{ cursor: "pointer" }}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        )}
      </ResponsiveContainer>

      {description && (
        <p className="card-subtitle mt-2 text-center">{description}</p>
      )}
    </div>
  );
}
