"use client";

import React from "react";

interface PageThumbProps {
  seed: string;
  size?: number;
}

const LINE_RATIOS = [0.3, 0.42, 0.52, 0.6, 0.68, 0.78];

/**
 * 根据标题哈希种子生成 5 条不同宽度的骨架线条，在纯 CSS/HTML 中呈现微缩文档预览
 */
export function PageThumb({ seed, size = 48 }: PageThumbProps) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const widths = Array.from({ length: 5 }, (_, n) => {
    const idx = Math.abs((hash >> (3 * n)) % LINE_RATIOS.length);
    return LINE_RATIOS[idx];
  });

  const padding = Math.round(0.08 * size);

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-400 bg-gray-100 shadow-card"
      style={{
        width: size,
        height: Math.round(size * 1.25),
        padding,
      }}
      aria-hidden="true"
    >
      <span className="flex h-full w-full flex-col justify-between py-1">
        {widths.map((ratio, i) => (
          <span
            key={i}
            className="block h-[3px] rounded-full bg-gray-400"
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        ))}
      </span>
    </span>
  );
}
