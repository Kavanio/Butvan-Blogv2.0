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
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
    pink: "bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
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
