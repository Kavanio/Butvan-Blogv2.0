"use client";

import React, { useState, useCallback } from "react";
import { QuoteItemVO } from "@/types/quote";
import { quoteService } from "@/services";
import { useSound } from "@/hooks/useSound";

interface QuoteWallSectionProps {
  /** 服务端预取的初始金句列表 */
  quotes?: QuoteItemVO[];
}

/**
 * 将后台视觉字号映射为极简前台流式排版字号
 *
 * @param displaySize 后台配置的字号枚举（SMALL | MEDIUM | LARGE）
 * @returns 对应的字号与行距 Tailwind 类名
 */
function getQuoteTextClass(displaySize?: string): string {
  switch (displaySize) {
    case "LARGE":
      return "text-[1.125rem] sm:text-[1.25rem] leading-[1.75] font-serif font-normal";
    case "SMALL":
      return "text-[0.875rem] sm:text-[0.9375rem] leading-[1.65] font-sans font-normal";
    case "MEDIUM":
    default:
      return "text-[0.975rem] sm:text-[1.0625rem] leading-[1.7] font-serif font-normal";
  }
}

/**
 * 格式化金句创建年份/日期（可选极简展示）
 *
 * @param isoDateString ISO 格式时间字符串
 * @returns 极简格式日期（如 2026.09）
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
 * 首页最底部极简金句墙组件（Quote Wall Footer）
 *
 * 设计哲学：
 * 1. 语义化作为首页 footer，收尾全站精神内核；
 * 2. 纯粹只展示金句与署名出处，剔除一切传统页脚杂芜；
 * 3. 彻底杜绝任何线条、边框、卡片包裹与分割阴影，字与底色完全相融；
 * 4. 采用非对称双列文字流瀑布排布，紧凑自然、富有文人呼吸感；
 * 5. 交互集成阅读聚焦视效（Focus Lens）、点击无感复制与微声学触感。
 */
export function QuoteWallSection({ quotes: initialQuotes = [] }: QuoteWallSectionProps) {
  const [quotes, setQuotes] = useState<QuoteItemVO[]>(initialQuotes);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);

  const { playDroplet, playTick } = useSound();

  /**
   * 点击单条金句触发轻量复制到剪贴板，并伴随微触感反馈
   *
   * @param quote 被点击的目标金句
   */
  const handleCopyQuote = useCallback(
    async (quote: QuoteItemVO) => {
      try {
        const textToCopy = `${quote.content}${
          quote.authorName ? ` —— ${quote.authorName}` : ""
        }${quote.source ? `《${quote.source}》` : ""}`;
        await navigator.clipboard.writeText(textToCopy);
        playDroplet();
        setCopiedId(quote.id);
        setTimeout(() => {
          setCopiedId((current) => (current === quote.id ? null : current));
        }, 1800);
      } catch {
        // 剪贴板权限或异常降级
      }
    },
    [playDroplet]
  );

  /**
   * 拾取加载更多金句（无痕平滑追加到文字流中）
   */
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    playTick();

    try {
      const nextPage = page + 1;
      const moreQuotes = await quoteService.getPublicQuotes({
        page: nextPage,
        size: 6,
      });

      if (moreQuotes && moreQuotes.length > 0) {
        // 过滤重复数据
        setQuotes((prev) => {
          const existingIds = new Set(prev.map((q) => q.id));
          const filtered = moreQuotes.filter((q) => !existingIds.has(q.id));
          if (filtered.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...filtered];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, playTick]);

  if (!quotes || quotes.length === 0) {
    return null;
  }

  return (
    <footer
      id="quote-wall"
      className="mt-20 sm:mt-28 mb-12 sm:mb-20 w-full select-none"
      aria-label="金句语录墙"
    >
      {/* 极简非对称多列文字瀑布流：无任何卡片外框、无任何线条 */}
      <div className="columns-1 sm:columns-2 gap-x-10 [column-fill:_balance]">
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
              className={`group relative break-inside-avoid mb-9 cursor-pointer transition-opacity duration-300 ${
                isDimmed ? "opacity-35" : "opacity-100"
              }`}
            >
              {/* 金句主体文字排版 */}
              <p
                className={`m-0 text-gray-1200 dark:text-gray-1200 transition-colors duration-200 ${getQuoteTextClass(
                  quote.displaySize
                )}`}
              >
                {quote.content}
              </p>

              {/* 金句署名、出处与微型复制提示（零线条、纯文字流） */}
              <div className="mt-2.5 flex items-center justify-between text-caption font-mono text-gray-800 dark:text-gray-900 transition-colors duration-200">
                <div className="flex items-center gap-1.5 truncate">
                  {quote.authorName && (
                    <span className="truncate">
                      — {quote.authorName}
                    </span>
                  )}
                  {quote.source && (
                    <span className="truncate opacity-80">
                      · {quote.source}
                    </span>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2 text-micro">
                  {/* 点击后的极简微气泡状态 */}
                  {isCopied ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-sans tracking-tight animate-in">
                      已复制
                    </span>
                  ) : (
                    dateStr && (
                      <span className="opacity-60">{dateStr}</span>
                    )
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* 底部极简纯文本操作器：零边框、零阴影、纯净呼吸 */}
      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="group inline-flex items-center gap-2 bg-transparent p-0 text-caption font-mono text-gray-800 dark:text-gray-900 hover:text-gray-1200 dark:hover:text-gray-1200 transition-colors duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="inline-block transition-transform duration-300 group-hover:rotate-180">
              ✦
            </span>
            <span>
              {isLoadingMore ? "正在拾取更多句子..." : "拾取更多句子"}
            </span>
          </button>
        </div>
      )}
    </footer>
  );
}
