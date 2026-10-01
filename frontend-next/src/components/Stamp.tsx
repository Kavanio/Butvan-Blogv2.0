"use client";

import React, { useId } from "react";
import Image from "next/image";
import { generateStampPerforationPath } from "@/lib/utils";

interface StampProps {
  src: string;
  city: string;
  numeral: string;
  label: string;
  width?: number;
  height?: number;
}

export function Stamp({
  src,
  city,
  numeral,
  label,
  width = 160,
  height = 210,
}: StampProps) {
  const clipId = useId();
  const path = generateStampPerforationPath(width, height);

  return (
    <div
      className="group relative inline-block drop-shadow-md transition-transform duration-300 hover:scale-105"
      style={{ width, height }}
      title={label}
    >
      <svg width={0} height={0} className="absolute">
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
        </defs>
      </svg>

      <div
        className="relative h-full w-full bg-[#f6f2e9] p-2 dark:bg-[#1f1d19]"
        style={{ clipPath: `url(#${clipId})` }}
      >
        <div className="relative h-full w-full overflow-hidden border border-black/10 dark:border-white/10">
          <Image
            src={src}
            alt={label}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* 邮票文字排版 */}
          <div className="absolute top-1.5 left-2 z-10 flex items-center gap-1 font-serif text-[10px] tracking-widest text-white/90 drop-shadow">
            <span>{city}</span>
            <span>·</span>
            <span>{numeral}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
