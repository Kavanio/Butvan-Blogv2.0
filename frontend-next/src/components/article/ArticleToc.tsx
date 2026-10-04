"use client";

import React, { useState, useEffect } from "react";
import { ListFilter, ChevronRight } from "lucide-react";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleTocProps {
  headings: TocItem[];
}

/**
 * 文章大纲与快速跳转目录
 * 支持滚动自动追踪活跃章节与平滑定位
 */
export function ArticleToc({ headings }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string>("");
  const [isOpenMobile, setIsOpenMobile] = useState<boolean>(false);

  useEffect(() => {
    if (!headings.length) return;

    // 使用 IntersectionObserver 监控所有正文标题
    const headingElements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-80px 0px -70% 0px",
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    // 默认高亮首个
    if (!activeId && headings[0]) {
      setActiveId(headings[0].id);
    }

    return () => observer.disconnect();
  }, [headings, activeId]);

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
      setIsOpenMobile(false);
    }
  };

  if (!headings || headings.length === 0) return null;

  return (
    <>
      {/* 移动端紧凑折叠目录面板 */}
      <div className="xl:hidden my-6 p-3 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-800/70">
        <button
          onClick={() => setIsOpenMobile((prev) => !prev)}
          className="flex items-center justify-between w-full text-xs font-mono text-gray-700 dark:text-gray-300 font-medium cursor-pointer"
        >
          <span className="flex items-center gap-1.5">
            <ListFilter className="w-3.5 h-3.5 text-sky-500 dark:text-[#BBDFFF]" />
            <span>本文目录 ({headings.length})</span>
          </span>
          <ChevronRight
            className={`w-3.5 h-3.5 text-gray-400 transition-transform ${
              isOpenMobile ? "rotate-90" : ""
            }`}
          />
        </button>

        {isOpenMobile && (
          <ul className="mt-3 pt-2.5 border-t border-gray-200/50 dark:border-gray-800/50 space-y-1 text-xs">
            {headings.map((item) => (
              <li
                key={item.id}
                style={{ paddingLeft: `${(item.level - 2) * 12}px` }}
              >
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`text-left w-full py-1 text-[13px] leading-snug transition-colors cursor-pointer truncate ${
                    activeId === item.id
                      ? "text-sky-700 dark:text-[#BBDFFF] font-medium"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 桌面端悬浮侧栏大纲 */}
      <nav
        aria-label="文章目录"
        className="hidden xl:block sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2"
      >
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-gray-800 dark:text-gray-300 mb-3 uppercase tracking-wider">
          <ListFilter className="w-3.5 h-3.5 text-sky-500 dark:text-[#BBDFFF]" />
          <span>目录大纲</span>
        </div>

        <div className="relative border-l border-gray-200 dark:border-gray-800 pl-3">
          <ul className="space-y-1.5 text-[12px] leading-relaxed font-sans">
            {headings.map((item) => {
              const isActive = activeId === item.id;
              return (
                <li
                  key={item.id}
                  style={{
                    paddingLeft: item.level === 3 ? "0.75rem" : "0",
                  }}
                >
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className={`block w-full text-left py-0.5 transition-all cursor-pointer truncate ${
                      isActive
                        ? "text-sky-700 dark:text-[#BBDFFF] font-medium -ml-[13px] pl-3 border-l-2 border-[#BBDFFF]"
                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    title={item.text}
                  >
                    {item.text}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
