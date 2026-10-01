"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  moreHref?: string;
  moreLabel?: string;
  className?: string;
}

export function SectionHeader({
  title,
  moreHref,
  moreLabel,
  className = "",
}: SectionHeaderProps) {
  return (
    <div className={`mb-5 flex items-baseline justify-between ${className}`}>
      <h2 className="text-base font-[550] text-gray-1200 tracking-tight">
        {title}
      </h2>

      {moreHref && (
        <Link
          href={moreHref}
          className="group inline-flex items-center gap-1 font-mono text-micro text-gray-1000 transition-colors hover:text-gray-1200"
        >
          <span>{moreLabel || "View all"}</span>
          <ArrowRight className="size-3 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
