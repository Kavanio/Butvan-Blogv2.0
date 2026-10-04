"use client";

import React, { useState, useEffect } from "react";
import { articleService } from "@/services";
import { ArticleItemVO } from "@/types/article";
import { ContentRow } from "@/components/core/ContentRow";
import { ContentRowSkeleton } from "@/components/ui/Skeleton";
import { DetailHeader } from "@/components/article/DetailHeader";
import { formatDate } from "@/utils/date";

export default function ArticleArchivePage() {
  const [articles, setArticles] = useState<ArticleItemVO[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)]">
      {/* 主容器 */}
      <main className="max-w-[40.5rem] mx-auto px-6 pt-8 sm:pt-12 pb-20">
        {/* 极简内联微返回与主题切换 */}
        <DetailHeader backHref="/" className="mb-6 sm:mb-8" />

        {/* 文章列表（仅展示列表，右侧完全不显示图片，纯文本、分类徽章与日期干净对齐） */}
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex flex-col gap-2 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ContentRowSkeleton key={i} hasThumb={false} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">暂无文章</div>
          ) : (
            articles.map((item) => (
              <ContentRow
                key={item.id}
                title={item.title}
                date={formatDate(item.publishedAt)}
                badge={item.categoryName}
                badgeTone="blue"
                isPinned={item.isPinned}
                href={`/article/${item.slug || item.id}`}
                showThumb={false}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
