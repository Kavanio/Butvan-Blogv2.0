"use client";

import React, { useState, useEffect } from "react";
import { Heart, Share2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { ArticleDetailVO } from "@/types/article";
import { CommentSection } from "@/components/modules/CommentSection";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";
import { articleService } from "@/services";
import { DetailHeader } from "@/components/article/DetailHeader";
import { MarkdownRenderer } from "@/components/article/MarkdownRenderer";

interface ArticleDetailClientProps {
  article: ArticleDetailVO;
}

/**
 * 极简深度长文阅读器
 * 100% 对齐 Chloe Maillot 原版数字花园设计美学：
 * - 纯粹单栏流动排版，无喧宾夺主的大目录与大卡片
 * - Instrument Serif 衬线体大标题与微型 Meta 摘要
 * - 导言与细微分割线自然过渡
 */
export function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const [likes, setLikes] = useState(article.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { playSparkle, playDroplet } = useSound();

  // 确保进入文章详情页时始终处于页面最顶部
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  // 本地持久化已点赞状态
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const likedListStr = localStorage.getItem("liked_articles");
      if (likedListStr) {
        const list = JSON.parse(likedListStr);
        if (Array.isArray(list) && list.includes(article.id)) {
          setHasLiked(true);
        }
      }
    } catch {}
  }, [article.id]);

  // 点赞处理
  const handleLike = async () => {
    if (hasLiked) return;
    playSparkle();
    setHasLiked(true);
    setLikes((prev) => prev + 1);

    try {
      const likedListStr = localStorage.getItem("liked_articles");
      const list = likedListStr ? JSON.parse(likedListStr) : [];
      if (!list.includes(article.id)) {
        list.push(article.id);
        localStorage.setItem("liked_articles", JSON.stringify(list));
      }
      await articleService.like(article.id);
    } catch {}
  };

  // 复制链接
  const handleCopyLink = () => {
    playDroplet();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const readingTime = article.readingTime || article.readTime || 3;
  const metaCategory = article.categoryName || (article.tagNames && article.tagNames[0]) || "Writing";

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)]">
      <main className="max-w-[40.5rem] mx-auto px-6 pt-8 sm:pt-12 pb-24">
        {/* 顶部极简导航栏 (← 圆形按钮 + 主题切换，返回文章归档列表) */}
        <DetailHeader backHref="/article" />

        {/* 标题前置微型 Meta 摘要：Sep 21, 2026 · Category · 10 min */}
        <div className="text-xs sm:text-[13px] text-gray-800 dark:text-gray-400 font-mono tracking-tight mb-3">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="mx-1.5 opacity-60">·</span>
          <span>{metaCategory}</span>
          <span className="mx-1.5 opacity-60">·</span>
          <span>{readingTime} min</span>
        </div>

        {/* 衬线体优雅大标题 (Instrument Serif) */}
        <h1 className="font-serif text-3xl sm:text-[2.6rem] text-gray-1200 leading-[1.18] font-normal tracking-tight mb-5">
          {article.title}
        </h1>

        {/* 导语段落与极浅水平分割线 */}
        {article.summary && (
          <>
            <p className="text-[15px] sm:text-base leading-relaxed text-gray-1100 mb-8 font-sans">
              {article.summary}
            </p>
            <div className="w-full h-px bg-gray-200/80 dark:bg-gray-800/80 mb-10" />
          </>
        )}

        {/* 沉浸式 Markdown 正文 (彻底移除突兀的重复目录，保持纯净阅读) */}
        <MarkdownRenderer
          content={article.content}
          contentHtml={article.contentHtml}
          className="prose-editorial"
        />

        {/* 文末极简互动条与版权署名（无多余线条，高对比度清晰交互） */}
        <div className="mt-14 pt-4">
          <div className="flex items-center justify-between text-xs font-mono">
            {/* 极简点赞微交互 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                hasLiked
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-medium"
                  : "bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200"
              }`}
            >
              <Heart
                className={`size-3.5 transition-transform ${
                  hasLiked ? "fill-rose-500 text-rose-500 scale-110" : "text-gray-700 dark:text-gray-300"
                }`}
              />
              <span className="font-semibold">{likes}</span>
            </motion.button>

            {/* 极简分享链接 */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer font-medium"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">已复制链接</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5 text-gray-700 dark:text-gray-300" />
                  <span>分享</span>
                </>
              )}
            </button>
          </div>

          {/* 极简版权小注 */}
          <div className="mt-5 text-xs text-gray-600 dark:text-gray-400 text-center sm:text-left font-sans">
            © {new Date().getFullYear()} 可梵 · CC BY-NC-SA 4.0 许可
          </div>
        </div>

        {/* 评论区挂载 */}
        <CommentSection articleId={article.id} />
      </main>
    </div>
  );
}
