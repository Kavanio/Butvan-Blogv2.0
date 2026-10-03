"use client";

import React from "react";

export type BadgeTone = "pink" | "blue" | "gray" | "emerald";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = "gray", className = "" }: BadgeProps) {
  const toneStyles: Record<BadgeTone, string> = {
    blue: "bg-[#BBDFFF]/30 text-[#1e3a8a] dark:bg-[#BBDFFF]/20 dark:text-[#BBDFFF]",
    pink: "bg-[#BBDFFF]/30 text-[#1e3a8a] dark:bg-[#BBDFFF]/20 dark:text-[#BBDFFF]",
    gray: "bg-gray-300 text-gray-1000",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  };

  return (
    <span
      className={`inline-flex items-center shrink-0 rounded-full px-2 py-0.5 text-micro uppercase tracking-wider font-medium ${toneStyles[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
