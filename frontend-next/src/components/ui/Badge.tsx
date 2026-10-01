"use client";

import React from "react";

export type BadgeTone = "pink" | "gray" | "emerald";

interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}

export function Badge({ children, tone = "gray", className = "" }: BadgeProps) {
  const toneStyles: Record<BadgeTone, string> = {
    pink: "bg-[#fde3ef] text-[#9b3860] dark:bg-[#462134] dark:text-[#f2aed0]",
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
