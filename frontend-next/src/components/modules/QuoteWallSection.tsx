"use client";

import React, { useState, useEffect, useCallback } from "react";
import { QuoteItemVO } from "@/types/quote";
import { quoteService } from "@/services";
import { useSound } from "@/hooks/useSound";

interface QuoteWallSectionProps {
  /** 服务端全量预取的真实金句列表 */
  quotes?: QuoteItemVO[];
}

/**
 * 格式化金句创建日期为极简年月（例如 2026.09）
 *
 * @param isoDateString 后端返回的 ISO 格式时间字符串
 * @returns 格式化后的极简年月字符串
 */
function formatQuoteDate(isoDateString?: string): string {
  if (!isoDateString) return "";
  try {
    const d = new Date(isoDateString);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${year}.${month}`;
  } catch {
    return "";
  }
}

/**
 * 首页最底部极简全宽金句墙页脚（Quote Wall Footer）
 *
 * 核心规范：
 * 1. 默认破宽撑满 1040px 黄金阅读视口，与上方画板对齐；
 * 2. 纯真实数据流驱动，严禁任何假数据兜底；
 * 3. 默认一次性全量加载全部金句，杜绝分页与“加载更多”多余按钮；
 * 4. 默认只展示“句子内容”与“日期”，绝不展示作者、出处与破折号；
 * 5. 零线条、零边框、零卡片阴影，纯粹文字流融入页面底色；
 * 6. 随着金句变多，高度自然向下生长；
 * 7. 支持双列错落流式排版、沉浸阅读聚焦视效与轻触快速复制。
 */
export function QuoteWallSection({ quotes: initialQuotes = [] }: QuoteWallSectionProps) {
  const [quotes, setQuotes] = useState<QuoteItemVO[]>(initialQuotes);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { playDroplet } = useSound();

  // 客户端挂载后动态同步最新真实金句（100% 真实数据流，零假数据）
  useEffect(() => {
    quoteService
      .getAllPublicQuotes()
      .then((data) => {
        if (data && Array.isArray(data) && data.length > 0) {
          setQuotes(data);
        }
      })
      .catch((err) => {
        console.warn("客户端同步金句失败:", err);
      });
  }, []);

  /**
   * 点击单条金句复制内容至剪贴板，伴随微触感水滴音效
   *
   * @param quote 被点击的目标金句
   */
  const handleCopyQuote = useCallback(
    async (quote: QuoteItemVO) => {
      try {
        await navigator.clipboard.writeText(quote.content);
        playDroplet();
        setCopiedId(quote.id);
        setTimeout(() => {
          setCopiedId((current) => (current === quote.id ? null : current));
        }, 1600);
      } catch {
        // 剪贴板异常降级
      }
    },
    [playDroplet]
  );

  // 纯真实数据驱动：无真实数据时保持安静，绝不塞假数据
  if (!quotes || quotes.length === 0) {
    return null;
  }

  return (
    <footer
      id="quote-wall"
      aria-label="金句语录墙"
      className="relative left-1/2 right-1/2 mt-20 sm:mt-28 mb-16 sm:mb-24 -mx-[50vw] w-screen px-4 sm:px-6 md:px-8 select-none"
    >
      {/* 撑满全宽容器（最大宽 1040px，与上方相册画板宽度对齐） */}
      <div className="mx-auto max-w-[1040px] w-full">
        {/* 双列极简文字瀑布流：无边框、无线条、高度随内容自适应延展 */}
        <div className="columns-1 md:columns-2 gap-x-16 lg:gap-x-20 [column-fill:_balance]">
          {quotes.map((quote) => {
            const isHovered = hoveredId === quote.id;
            const isCopied = copiedId === quote.id;
            const isDimmed = hoveredId !== null && !isHovered;
            const dateStr = formatQuoteDate(quote.createdAt);

            return (
              <article
                key={quote.id}
                onMouseEnter={() => setHoveredId(quote.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => handleCopyQuote(quote)}
                className={`group relative break-inside-avoid mb-10 sm:mb-12 cursor-pointer transition-opacity duration-300 ${
                  isDimmed ? "opacity-35" : "opacity-100"
                }`}
              >
                {/* 1. 金句正文（仅展示句子本身，保留换行） */}
                <p className="m-0 font-serif text-[1.05rem] sm:text-[1.125rem] leading-[1.8] text-gray-1200 dark:text-gray-1200 whitespace-pre-line transition-colors duration-200">
                  {quote.content}
                </p>

                {/* 2. 极简日期展示（仅展示日期，点击复制时显示微提示） */}
                <div className="mt-2.5 flex items-center justify-end font-mono text-[11px] text-gray-800 dark:text-gray-900 transition-colors duration-200">
                  {isCopied ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-sans tracking-tight animate-in">
                      已复制
                    </span>
                  ) : (
                    dateStr && <span>{dateStr}</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
