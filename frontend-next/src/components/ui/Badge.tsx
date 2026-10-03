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
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
    pink: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300",
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
