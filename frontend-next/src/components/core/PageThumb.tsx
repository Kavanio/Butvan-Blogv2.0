"use client";

import React from "react";
import { stringHash } from "@/utils/hash";

interface PageThumbProps {
  seed: string;
  className?: string;
}

const LINE_RATIOS = [0.3, 0.42, 0.52, 0.6, 0.68, 0.78];

/**
 * 纯 CSS/HTML 微缩文档骨架图标生成器 (100% 对齐原站细节)
 * 48x48 正方形卡片、首行深灰标题线、5行浅灰正文线、内层 preview-bg 细边框
 */
export function PageThumb({ seed, className = "" }: PageThumbProps) {
  const hash = stringHash(seed);

  // 标题线固定较短 (约 44%)
  const titleWidth = Math.round(34 * 0.44);

  // 确定性伪随机正文 5 条线宽度
  const bodyWidths = Array.from({ length: 5 }, (_, n) => {
    const idx = Math.abs((hash >> (3 * n)) % LINE_RATIOS.length);
    return Math.round(34 * LINE_RATIOS[idx]);
  });

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-400 bg-gray-100 dark:bg-gray-800 shadow-card p-1 ${className}`}
      aria-hidden="true"
    >
      <span
        className="flex flex-col justify-center overflow-hidden rounded-md border border-gray-500 bg-preview-bg"
        style={{ width: "48px", height: "48px", padding: "7px", gap: "3px" }}
      >
        {/* 顶部标题条 (较深色) */}
        <span
          className="rounded-full bg-gray-800"
          style={{ height: "3px", width: `${titleWidth}px` }}
        />
        {/* 下方正文条 (浅色) */}
        {bodyWidths.map((w, i) => (
          <span
            key={i}
            className="rounded-full bg-gray-400"
            style={{ height: "3px", width: `${w}px` }}
          />
        ))}
      </span>
    </span>
  );
}
