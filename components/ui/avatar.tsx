import * as React from "react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  colorIndex?: number;
}

const sizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-xl",
};

const colorPalette = [
  "bg-gradient-to-br from-indigo-500 to-purple-600",
  "bg-gradient-to-br from-emerald-500 to-teal-600",
  "bg-gradient-to-br from-rose-500 to-pink-600",
  "bg-gradient-to-br from-amber-500 to-orange-600",
  "bg-gradient-to-br from-blue-500 to-cyan-600",
  "bg-gradient-to-br from-violet-500 to-purple-600",
  "bg-gradient-to-br from-green-500 to-emerald-600",
  "bg-gradient-to-br from-red-500 to-rose-600",
];

export function Avatar({ name = "", src, size = "md", className, colorIndex }: AvatarProps) {
  const initials = getInitials(name);
  const colorIdx = colorIndex ?? (name.charCodeAt(0) % colorPalette.length);

  if (src) {
    return (
      <div className={cn("rounded-full overflow-hidden flex-shrink-0", sizes[size], className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0",
        sizes[size],
        colorPalette[colorIdx],
        className
      )}
    >
      {initials}
    </div>
  );
}
