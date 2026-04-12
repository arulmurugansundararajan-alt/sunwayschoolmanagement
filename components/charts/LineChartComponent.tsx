"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ChartData } from "@/types";

interface LineChartComponentProps {
  data: ChartData[];
  lines: { key: string; color: string; name?: string }[];
  xKey?: string;
  height?: number;
  showLegend?: boolean;
  showDots?: boolean;
  curved?: boolean;
  referenceValue?: number;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-xs font-semibold text-gray-700 mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold text-gray-900">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function LineChartComponent({
  data,
  lines,
  xKey = "name",
  height = 300,
  showLegend = true,
  showDots = true,
  curved = true,
  referenceValue,
}: LineChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
          />
        )}
        {referenceValue && (
          <ReferenceLine
            y={referenceValue}
            stroke="#E5E7EB"
            strokeDasharray="4 4"
            label={{ value: `Avg: ${referenceValue}`, position: "right", fontSize: 11, fill: "#9CA3AF" }}
          />
        )}
        {lines.map((line) => (
          <Line
            key={line.key}
            type={curved ? "monotone" : "linear"}
            dataKey={line.key}
            name={line.name || line.key}
            stroke={line.color}
            strokeWidth={2.5}
            dot={showDots ? { r: 4, fill: line.color, strokeWidth: 2, stroke: "white" } : false}
            activeDot={{ r: 6, fill: line.color, strokeWidth: 2, stroke: "white" }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
