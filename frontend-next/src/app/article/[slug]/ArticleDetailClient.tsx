"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { marked } from "marked";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Share2, Eye, Clock, Check } from "lucide-react";
import { ArticleDetailVO } from "@/types/article";
import { Badge } from "@/components/ui/Badge";
import { CommentSection } from "@/components/modules/CommentSection";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";
import { articleService } from "@/services";

interface ArticleDetailClientProps {
  article: ArticleDetailVO;
}

export function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const [likes, setLikes] = useState(article.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { playSparkle, playDroplet, playTick } = useSound();

  // 解析 Markdown（优先使用后端预渲染的 contentHtml，大幅提升首屏加载性能）
  const htmlContent = useMemo(() => {
    if (article.contentHtml) {
      return article.contentHtml;
    }
    try {
      return marked.parse(article.content || "", { async: false }) as string;
    } catch {
      return article.content || "";
    }
  }, [article.content, article.contentHtml]);

  // 点赞处理
  const handleLike = async () => {
    if (hasLiked) return;
    playSparkle();
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    try {
      await articleService.like(article.id);
    } catch {
      // 容错降级
    }
  };

  // 复制链接
  const handleCopyLink = () => {
    playDroplet();
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)] selection:bg-[#fde3ef] selection:text-[#9b3860]">
      {/* 顶部微型导航条 */}
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
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              title="复制文章链接"
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* 文章主容器（严格对齐 max-w-[40.5rem]） */}
      <main className="max-w-[40.5rem] mx-auto px-6 pt-10 pb-20">
        {/* Meta 头部 */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {article.categoryName && (
              <Badge tone="pink">{article.categoryName}</Badge>
            )}
            {(article.tags || article.tagNames)?.map((tag, idx) => {
              const tagName = typeof tag === "string" ? tag : tag.name;
              const tagKey = typeof tag === "string" ? `${tag}-${idx}` : String(tag.id);
              return (
                <Badge key={tagKey} tone="gray">
                  #{tagName}
                </Badge>
              );
            })}
          </div>

          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 leading-snug">
            {article.title}
          </h1>

          <div className="flex items-center gap-4 text-micro font-mono text-gray-600 flex-wrap pt-1 border-b border-gray-200 dark:border-gray-800 pb-4">
            <span>{formatDate(article.publishedAt)}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {article.readingTime || article.readTime || 5} min read
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {article.viewCount || 0} views
            </span>
          </div>

          {/* 摘要框 */}
          {article.summary && (
            <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/40 border-l-2 border-pink-400 text-xs text-gray-700 dark:text-gray-300 italic leading-relaxed">
              {article.summary}
            </div>
          )}

          {/* 封面图 */}
          {article.coverImageUrl && (
            <div className="my-4 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <img
                src={article.coverImageUrl}
                alt={article.title}
                className="w-full object-cover max-h-80"
              />
            </div>
          )}
        </div>

        {/* Markdown 正文 */}
        <article
          className="prose-editorial"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* 底部点赞交互区 */}
        <div className="mt-14 pt-8 border-t border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all cursor-pointer ${
              hasLiked
                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            <Heart
              className={`w-4 h-4 transition-transform ${
                hasLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
            <span>{hasLiked ? "已点赞" : "为本文点赞"} ({likes})</span>
          </motion.button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 dark:hover:text-gray-200 font-mono transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? "已复制链接" : "分享本文"}</span>
          </button>
        </div>

        {/* 评论区挂载 */}
        <CommentSection articleId={article.id} />
      </main>
    </div>
  );
}
