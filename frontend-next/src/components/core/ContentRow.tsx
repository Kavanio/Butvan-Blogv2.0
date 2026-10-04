"use client";

import React from "react";
import Link from "next/link";
import { Pin } from "lucide-react";
import { getTitleTilt, getNoteTilt } from "@/utils/hash";
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
  /** 是否默认稍微倾斜展示（手记封面卡片专用，悬停平滑回正） */
  tiltDefault?: boolean;
  disabled?: boolean;
}

/**
 * 统一内容行组件 (Note & Article 核心统一抽象)
 * 1. 手记封面支持默认微倾斜展示 [transform:rotate(var(--tilt))]，悬停平滑回正并放大 [transform:rotate(0deg)_scale(1.08)]；
 * 2. 文章或无封面项目完全不展示缩略图，保持纯文本与日期干净对齐；
 * 3. 58x60 像素级精致外框与 48x48 像素微缩封面卡片；
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
  tiltDefault = false,
  disabled = false,
}: ContentRowProps) {
  const { playTick, playRelease } = useSound();
  const tilt = tiltDefault ? getNoteTilt(title) : getTitleTilt(title);

  const rowContent = (
    <div className="group -mx-4 flex w-full items-center gap-4 rounded-xl px-4 py-2 transition-colors duration-200 hover:bg-gray-200/60 dark:hover:bg-gray-800/40">
      {/* 左侧：标题、置顶标记与标签 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isPinned && (
            <Pin className="size-3 text-sky-500 dark:text-[#BBDFFF] shrink-0 fill-current" />
          )}

          <span className="truncate text-base text-gray-1100 leading-relaxed transition-colors duration-200 group-hover:text-gray-1200">
            {title}
          </span>

          {badge && (
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-micro uppercase tracking-wider font-medium ${
                badgeTone === "gray"
                  ? "bg-gray-200 text-gray-1100 dark:bg-gray-800 dark:text-gray-300"
                  : "bg-[#BBDFFF]/35 text-[#1e3a8a] dark:bg-[#BBDFFF]/20 dark:text-[#BBDFFF]"
              }`}
            >
              {badge}
            </span>
          )}
        </div>
      </div>

      {/* 右侧：年份/日期与微缩封面图（无封面时不展示任何占位，保持干净） */}
      <div className="shrink-0 flex items-center gap-5">
        {date && (
          <span className="tabular-nums text-body text-gray-1100 transition-colors duration-200 group-hover:text-gray-1200">
            {date}
          </span>
        )}

        {showThumb && Boolean(thumb) && (
          <span
            style={{ "--tilt": tilt } as React.CSSProperties}
            className={`shrink-0 transition-transform duration-300 ease-out ${
              tiltDefault
                ? "[transform:rotate(var(--tilt))] group-hover:[transform:rotate(0deg)_scale(1.08)]"
                : "[transform:rotate(0deg)] group-hover:[transform:scale(1.05)]"
            }`}
          >
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
      scroll={true}
      onMouseEnter={playTick}
      onClick={playRelease}
      className="block w-full"
    >
      {rowContent}
    </Link>
  );
}
