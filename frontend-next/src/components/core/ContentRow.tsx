"use client";

import React from "react";
import Link from "next/link";
import { Pin } from "lucide-react";
import { getTitleTilt } from "@/utils/hash";
import { PageThumb } from "./PageThumb";
import { useSound } from "@/hooks/useSound";

export interface ContentRowProps {
  title: string;
  href: string;
  date?: string;
  summary?: string;
  badge?: string;
  badgeTone?: "pink" | "gray";
  isPinned?: boolean;
  showThumb?: boolean;
  thumb?: string;
  disabled?: boolean;
}

/**
 * 统一内容行组件 (Note & Article 核心统一抽象)
 * 100% 精确对齐原网站设计：
 * 1. 默认平直 [transform:rotate(0deg)]，悬停触发确定性微倾斜 [transform:rotate(var(--tilt))_scale(1.05)]；
 * 2. -mx-4 px-4 py-2 全宽热区与 hover:bg-gray-200/60 极轻柔悬停层；
 * 3. 48x48 像素微缩文稿便签纸与封面卡片；
 * 4. 原生触感 tick 与 release 音效。
 */
export function ContentRow({
  title,
  href,
  date,
  badge,
  badgeTone = "pink",
  isPinned = false,
  showThumb = true,
  thumb,
  disabled = false,
}: ContentRowProps) {
  const { playTick, playRelease } = useSound();
  const tilt = getTitleTilt(title);

  const rowContent = (
    <div className="group -mx-4 flex w-full items-center gap-4 rounded-xl px-4 py-2 transition-colors duration-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/40">
      {/* 左侧：标题、置顶标记与标签 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isPinned && (
            <Pin className="size-3 text-pink-500 shrink-0 fill-current" />
          )}

          <span className="truncate text-base text-gray-1100 leading-relaxed transition-colors duration-200 group-hover:text-gray-1200">
            {title}
          </span>

          {badge && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-micro uppercase tracking-wider ${
                badgeTone === "pink"
                  ? "bg-[#fde3ef] text-[#9b3860] dark:bg-[#462134] dark:text-[#f2aed0]"
                  : "bg-gray-200 text-gray-1100 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* 右侧：年份/日期与 48x48 缩略图（悬停时旋转微倾角并放大 1.05） */}
      <div className="shrink-0 flex items-center gap-5">
        {date && (
          <span className="tabular-nums text-body text-gray-1100 transition-colors duration-200 group-hover:text-gray-1200">
            {date}
          </span>
        )}

        {showThumb && (
          <span
            style={{ "--tilt": tilt } as React.CSSProperties}
            className="shrink-0 transition-transform duration-300 ease-out [transform:rotate(0deg)] group-hover:[transform:rotate(var(--tilt))_scale(1.05)]"
          >
            {thumb ? (
              <span className="inline-flex shrink-0 items-center justify-center rounded-lg border border-gray-400 bg-gray-100 dark:bg-gray-800 shadow-card p-1">
                <span className="block size-12 overflow-hidden rounded-md border border-gray-500 bg-preview-bg">
                  <img
                    src={thumb}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </span>
              </span>
            ) : (
              <PageThumb seed={title} />
            )}
          </span>
        )}
      </div>
    </div>
  );

  if (disabled) {
    return (
      <div className="cursor-not-allowed opacity-50 select-none" aria-disabled="true">
        {rowContent}
      </div>
    );
  }

  return (
    <Link
      href={href}
      onMouseEnter={playTick}
      onClick={playRelease}
      className="block w-full"
    >
      {rowContent}
    </Link>
  );
}
