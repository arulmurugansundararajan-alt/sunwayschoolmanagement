import * as React from "react";
import { cn } from "@/lib/utils";

const badgeVariants = {
  default: "bg-indigo-100 text-indigo-700 border-indigo-200",
  secondary: "bg-gray-100 text-gray-700 border-gray-200",
  destructive: "bg-red-100 text-red-700 border-red-200",
  success: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  info: "bg-blue-100 text-blue-700 border-blue-200",
  purple: "bg-purple-100 text-purple-700 border-purple-200",
  outline: "bg-white text-gray-700 border-gray-300",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof badgeVariants;
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
