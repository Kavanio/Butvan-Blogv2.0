"use client";

import React from "react";
import { ArticleItemVO } from "@/types/article";
import { SectionHeader } from "@/components/core/SectionHeader";
import { ContentRow } from "@/components/core/ContentRow";
import { formatDate } from "@/utils/date";

interface ArticleSectionProps {
  articles: ArticleItemVO[];
}

export function ArticleSection({ articles }: ArticleSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section id="articles" className="mt-16 sm:mt-32">
      <SectionHeader
        title="Articles"
        moreHref="/article"
        moreLabel="View all articles"
        className="animate-in stagger-4"
      />

      <div className="flex flex-col gap-2">
        {articles.map((article) => (
          <ContentRow
            key={article.id}
            title={article.title}
            href={`/article/${article.slug || article.id}`}
            date={formatDate(article.publishedAt)}
            badge={article.categoryName}
            badgeTone="gray"
            isPinned={article.isPinned}
            showThumb={true}
          />
        ))}
      </div>
    </section>
  );
}
