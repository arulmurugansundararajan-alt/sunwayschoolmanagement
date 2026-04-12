import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBg?: string;
  trend?: { value: number; label: string };
  gradient?: string;
  className?: string;
}

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-indigo-100",
  trend,
  gradient,
  className,
}: StatCardProps) {
  const isPositive = trend && trend.value >= 0;

  if (gradient) {
    return (
      <div
        className={cn(
          "rounded-2xl p-5 text-white relative overflow-hidden shadow-lg",
          gradient,
          className
        )}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full translate-y-6 -translate-x-4" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-white/70 text-sm font-medium">{title}</p>
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-white/60 text-xs">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-white/80" />
              ) : (
                <TrendingDown className="w-3 h-3 text-white/80" />
              )}
              <span className="text-xs text-white/80 font-medium">
                {isPositive ? "+" : ""}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold",
              isPositive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            )}
          >
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      {trend && (
        <p className="text-xs text-gray-400 mt-1">{trend.label}</p>
      )}
    </div>
  );
}
