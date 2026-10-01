"use client";

import React, { useId } from "react";
import Image from "next/image";
import { generateStampPerforationPath } from "@/utils/math";

interface StampProps {
  src: string;
  city?: string;
  numeral?: string;
  label: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

export function Stamp({
  src,
  city = "PARIS",
  numeral = "II",
  label,
  width = 150,
  height = 195,
  onClick,
}: StampProps) {
  const clipId = useId();
  const path = generateStampPerforationPath(width, height);

  return (
    <div
      onClick={onClick}
      className="group relative inline-block drop-shadow-md transition-transform duration-300 hover:scale-105 cursor-pointer"
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
