"use client";

import React from "react";
import Link from "next/link";
import { Pin } from "lucide-react";
import { getTitleTilt } from "@/utils/hash";
import { PageThumb } from "./PageThumb";
import { Badge, BadgeTone } from "@/components/ui/Badge";
import { useSound } from "@/hooks/useSound";

export interface ContentRowProps {
  title: string;
  href: string;
  date?: string;
  summary?: string;
  badge?: string;
  badgeTone?: BadgeTone;
  isPinned?: boolean;
  showThumb?: boolean;
  thumb?: string;
  disabled?: boolean;
}

/**
 * 统一内容行组件 (Note & Article 核心统一抽象)
 * 具备原版高质感设计：
 * 1. 标题字符哈希驱动确定性微倾斜角（-3deg ~ 3deg），悬浮平滑回正微放大；
 * 2. 纯 CSS/HTML 微缩文档骨架图标 (PageThumb)；
 * 3. 悬浮触发轻量 tick 音效，点击触发 release 触感音效；
 * 4. 完美响应 12 阶灰度主题系统。
 */
export function ContentRow({
  title,
  href,
  date,
  badge,
  badgeTone = "gray",
  isPinned = false,
  showThumb = true,
  thumb,
  disabled = false,
}: ContentRowProps) {
  const { playTick, playRelease } = useSound();
  const tilt = getTitleTilt(title);

  const rowContent = (
    <div className="group relative -mx-3 flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-gray-200">
      {/* 左侧：标题、置顶标记与分类/心情徽章 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {isPinned && (
            <Pin className="size-3.5 text-gray-900 shrink-0 fill-current" />
          )}

          <span className="truncate text-base text-gray-1100 leading-relaxed transition-colors duration-200 group-hover:text-gray-1200">
            {title}
          </span>

          {badge && (
            <Badge tone={badgeTone}>
              {badge}
            </Badge>
          )}
        </div>
      </div>

      {/* 右侧：年份/日期与哈希微倾斜缩略图 */}
      <div className="shrink-0 flex items-center gap-4">
        {date && (
          <span className="tabular-nums font-mono text-body text-gray-1000 transition-colors duration-200 group-hover:text-gray-1200">
            {date}
          </span>
        )}

        {showThumb && (
          <span
            style={{ transform: `rotate(${tilt})` }}
            className="shrink-0 transition-transform duration-300 ease-out group-hover:rotate-0 group-hover:scale-105"
          >
            {thumb ? (
              <img
                src={thumb}
                alt=""
                className="w-9 h-11 object-cover rounded-md border border-gray-400 shadow-card"
              />
            ) : (
              <PageThumb seed={title} size={36} />
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
      className="block"
    >
      {rowContent}
    </Link>
  );
}
