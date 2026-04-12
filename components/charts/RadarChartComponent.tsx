"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface RadarChartComponentProps {
  data: { subject: string; score: number; fullMark: number }[];
  color?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3">
        <p className="text-xs font-semibold text-gray-700">{payload[0].name}</p>
        <p className="text-xs text-indigo-600 font-bold">{payload[0].value}%</p>
      </div>
    );
  }
  return null;
};

export default function RadarChartComponent({
  data,
  color = "#4F46E5",
  height = 280,
}: RadarChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid stroke="#E5E7EB" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fontSize: 12, fill: "#6B7280", fontWeight: 500 }}
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 100]}
          tick={{ fontSize: 10, fill: "#9CA3AF" }}
          axisLine={false}
        />
        <Radar
          name="Score"
          dataKey="score"
          stroke={color}
          fill={color}
          fillOpacity={0.2}
          strokeWidth={2}
          dot={{ r: 4, fill: color, strokeWidth: 2, stroke: "white" }}
        />
        <Tooltip content={<CustomTooltip />} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
