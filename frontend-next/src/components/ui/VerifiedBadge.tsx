"use client";

import React, { useState } from "react";

interface VerifiedBadgeProps {
  type?: "admin" | "author";
  className?: string;
}

/**
 * 站长大V认证天蓝徽章组件
 * - 位于昵称右上角（上标微偏移）
 * - 仅当鼠标真正移入徽标本身时才触发气泡提示（避免评论卡片外部 group-hover 误触）
 * - 采用简约清爽的天蓝色调（Sky Blue）
 */
export function VerifiedBadge({ type = "admin", className = "" }: VerifiedBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 纯净简约的天蓝主题色 (#BBDFFF)
  const color = type === "admin" ? "#BBDFFF" : "#34d399";
  const text = type === "admin" ? "这位是本站的主人呀" : "这位是本文的作者呀";

  return (
    <span
      className={`relative inline-flex items-center justify-center select-none -translate-y-1.5 ml-0.5 cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 仅在鼠标移入徽标本身时展示 Tooltip 浮层 */}
      <span
        className={`absolute bottom-[calc(100%+6px)] left-1/2 -translate-x-1/2 z-50 w-max px-2.5 py-1 rounded-lg text-[10px] font-sans font-medium tracking-wide text-center pointer-events-none transition-all duration-200 ${
          isHovered
            ? "opacity-100 scale-100 visible"
            : "opacity-0 scale-95 invisible"
        } bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-lg`}
      >
        <span>{text}</span>
        {/* 气泡指向小尖角 */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-[4px] border-transparent border-t-white dark:border-t-zinc-900 filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.06)]" />
      </span>

      {/* 简约天蓝色认证徽标 SVG (#BBDFFF) */}
      <svg
        viewBox="0 0 24 24"
        className="w-3 h-3 shrink-0 inline-block drop-shadow-[0_1px_2px_rgba(187,223,255,0.4)]"
        aria-hidden="true"
        style={{ fill: color }}
      >
        <g>
          <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.407-.17-.867-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.27 3.422 2.27s2.825-1.015 3.422-2.27c.407.17.867.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.03l-3.85-3.85 1.43-1.4 2.42 2.42 6.25-6.25 1.43 1.42-7.68 7.66z" />
        </g>
      </svg>
    </span>
  );
}
