"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Search } from "lucide-react";
import { articleService } from "@/services";
import { ArticleItemVO } from "@/types/article";
import { ContentRow } from "@/components/core/ContentRow";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";

export default function ArticleArchivePage() {
  const [articles, setArticles] = useState<ArticleItemVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { playTick } = useSound();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await articleService.getPublicArticles({ page: 1, size: 50 });
        setArticles(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 提取所有标签名
  const allTags = Array.from(
    new Set(
      articles.flatMap((a) =>
        (a.tags || []).map((t) => (typeof t === "string" ? t : t.name))
      )
    )
  );

  // 过滤后的文章列表
  const filtered = articles.filter((a) => {
    const matchesKeyword =
      !keyword ||
      a.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (a.summary && a.summary.toLowerCase().includes(keyword.toLowerCase()));
    
    const articleTagNames = (a.tags || []).map((t) => (typeof t === "string" ? t : t.name));
    const matchesTag = !selectedTag || articleTagNames.includes(selectedTag);
    return matchesKeyword && matchesTag;
  });

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)] selection:bg-[#fde3ef] selection:text-[#9b3860]">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-gray-bg)]/80 border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-[40.5rem] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            onClick={playTick}
            className="group inline-flex items-center gap-2 text-xs font-mono text-gray-800 dark:text-gray-400 hover:text-gray-1200 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>cd .. / 返回首页</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-mono">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Archive ({articles.length})</span>
          </div>
        </div>
      </header>

      {/* 主容器 */}
      <main className="max-w-[40.5rem] mx-auto px-6 pt-10 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            全部文章 / Articles
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            设计工程、前端架构、动效美学与产品构建的全量归档与反思。
          </p>
        </div>

        {/* 搜索与标签栏 */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="搜索文章标题或摘要..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-gray-400 dark:focus:border-gray-600 transition-colors"
            />
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  playTick();
                  setSelectedTag(null);
                }}
                className={`text-micro px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  selectedTag === null
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900 border-transparent font-medium"
                    : "border-gray-200 dark:border-gray-800 text-gray-600 hover:text-gray-900"
                }`}
              >
                全部
              </button>
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    playTick();
                    setSelectedTag(tag === selectedTag ? null : tag);
                  }}
                  className={`text-micro px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    selectedTag === tag
                      ? "bg-pink-500 text-white border-pink-500 font-medium"
                      : "border-gray-200 dark:border-gray-800 text-gray-600 hover:text-gray-900"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 文章列表 */}
        <div className="flex flex-col">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">加载全量文章归档中...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">未搜索到相关文章</div>
          ) : (
            filtered.map((item) => (
              <ContentRow
                key={item.id}
                title={item.title}
                date={formatDate(item.publishedAt)}
                badge={item.categoryName}
                badgeTone="pink"
                href={`/article/${item.slug || item.id}`}
                thumb={item.coverImageUrl}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
