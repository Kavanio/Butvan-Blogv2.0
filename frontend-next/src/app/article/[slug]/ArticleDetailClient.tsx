"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  Share2,
  Eye,
  Clock,
  Check,
  ArrowUp,
  FileText,
  Calendar,
  Sparkles,
} from "lucide-react";
import { ArticleDetailVO } from "@/types/article";
import { Badge } from "@/components/ui/Badge";
import { CommentSection } from "@/components/modules/CommentSection";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";
import { articleService } from "@/services";
import { ReadingProgressBar } from "@/components/article/ReadingProgressBar";
import { MarkdownRenderer } from "@/components/article/MarkdownRenderer";
import { ArticleToc, TocItem } from "@/components/article/ArticleToc";
import { ArticleCopyright } from "@/components/article/ArticleCopyright";

interface ArticleDetailClientProps {
  article: ArticleDetailVO;
}

export function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const [likes, setLikes] = useState(article.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const { playSparkle, playDroplet, playTick } = useSound();

  // 本地存储记录点赞状态，防止重复点赞
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
    } catch {
      // ignore
    }
  }, [article.id]);

  // 监听滚动控制顶部标题显示与回到顶部按钮
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 280);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    } catch {
      // 容错降级
    }
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

  // 滚动到顶部
  const scrollToTop = () => {
    playTick();
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const readingTime = article.readingTime || article.readTime || 3;
  const wordCount = article.wordCount || 0;

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)] selection:bg-[#fde3ef] selection:text-[#9b3860]">
      {/* 顶部阅读进度条 */}
      <ReadingProgressBar />

      {/* 顶部微型粘性导航条 */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-gray-bg)]/85 border-b border-gray-200/70 dark:border-gray-800/70">
        <div className="max-w-[68rem] mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* 左侧：返回首页 */}
          <Link
            href="/"
            onClick={playTick}
            className="group inline-flex items-center gap-2 text-xs font-mono text-gray-800 dark:text-gray-400 hover:text-gray-1200 dark:hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>cd .. / 返回首页</span>
          </Link>

          {/* 中间：文章微缩标题（向下滚动时淡入） */}
          <AnimatePresence>
            {showBackToTop && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="hidden md:block truncate max-w-md text-xs font-medium text-gray-700 dark:text-gray-300 text-center select-none"
              >
                {article.title}
              </motion.div>
            )}
          </AnimatePresence>

          {/* 右侧：交互快捷按钮 */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyLink}
              title="复制文章链接"
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            {showBackToTop && (
              <button
                onClick={scrollToTop}
                title="回到页面顶部"
                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 文章主阅读区与目录双栏布局 */}
      <main className="max-w-[68rem] mx-auto px-6 pt-10 pb-24">
        <div className="xl:grid xl:grid-cols-[1fr_260px] xl:gap-14 xl:items-start">
          {/* 左侧主体文章阅读流 */}
          <div className="min-w-0 max-w-[44rem] mx-auto xl:mx-0 w-full">
            {/* Meta 头部区 */}
            <div className="flex flex-col gap-3 mb-8">
              {/* 分类与标签徽章 */}
              <div className="flex items-center gap-2 flex-wrap">
                {article.categoryName && (
                  <Badge tone="pink">{article.categoryName}</Badge>
                )}
                {(article.tags || article.tagNames)?.map((tag, idx) => {
                  const tagName = typeof tag === "string" ? tag : tag.name;
                  const tagKey =
                    typeof tag === "string" ? `${tag}-${idx}` : String(tag.id);
                  return (
                    <Badge key={tagKey} tone="gray">
                      #{tagName}
                    </Badge>
                  );
                })}
              </div>

              {/* 文章大标题 */}
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 leading-snug">
                {article.title}
              </h1>

              {/* 元信息紧凑栏：发布时间、阅读时长、字数、浏览量 */}
              <div className="flex items-center gap-3.5 text-[11px] font-mono text-gray-600 dark:text-gray-400 flex-wrap pt-1 border-b border-gray-200/80 dark:border-gray-800/80 pb-4">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {formatDate(article.publishedAt)}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-pink-500" />
                  {readingTime} min read
                </span>
                {wordCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <FileText className="w-3 h-3 text-gray-400" />
                      {wordCount} 字
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="w-3 h-3 text-gray-400" />
                  {article.viewCount || 0} views
                </span>
              </div>

              {/* 摘要框（如果有） */}
              {article.summary && (
                <div className="p-3.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border-l-2 border-pink-400 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                  {article.summary}
                </div>
              )}

              {/* 封面图（如果有） */}
              {article.coverImageUrl && (
                <div className="my-4 overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-800/80">
                  <img
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="w-full object-cover max-h-80"
                  />
                </div>
              )}

              {/* 移动端快速目录跳转 */}
              <ArticleToc headings={headings} />
            </div>

            {/* Markdown 正文渲染（彻底修复排版与换行 Bug，集成代码高亮与图片预览） */}
            <MarkdownRenderer
              content={article.content}
              contentHtml={article.contentHtml}
              className="prose-editorial"
              onHeadingsExtracted={setHeadings}
            />

            {/* 原创版权声明卡片 */}
            <ArticleCopyright
              title={article.title}
              author={article.authorName || "可梵"}
            />

            {/* 底部点赞交互区 */}
            <div className="mt-8 pt-6 border-t border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-between">
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
                <span>
                  {hasLiked ? "已点赞" : "为本文点赞"} ({likes})
                </span>
              </motion.button>

              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 dark:hover:text-gray-200 font-mono transition-colors cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? "已复制链接" : "分享本文"}</span>
              </button>
            </div>

            {/* 延伸阅读 / 相关文章推荐（极简流线列表排版，紧凑且信息丰富） */}
            {article.relatedArticles && article.relatedArticles.length > 0 && (
              <section className="mt-12 pt-6 border-t border-gray-200/80 dark:border-gray-800/80">
                <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-gray-800 dark:text-gray-300 uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>延伸阅读 / 相关文章</span>
                </div>
                <div className="space-y-2.5">
                  {article.relatedArticles.map((item) => (
                    <Link
                      key={item.id}
                      href={`/article/${item.slug || item.id}`}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-900/30 hover:bg-gray-100/80 dark:hover:bg-gray-800/50 border border-gray-200/60 dark:border-gray-800/60 transition-colors"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-[13px] font-medium text-gray-900 dark:text-gray-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors truncate">
                          {item.title}
                        </h4>
                        {item.summary && (
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                            {item.summary}
                          </p>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-gray-400 dark:text-gray-500 shrink-0">
                        {formatDate(item.publishedAt)}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 评论区挂载 */}
            <CommentSection articleId={article.id} />
          </div>

          {/* 右侧粘性侧栏：桌面端目录大纲与微信息卡片 */}
          <aside className="hidden xl:block">
            <div className="sticky top-24 space-y-6">
              {/* 目录树导航 */}
              <ArticleToc headings={headings} />

              {/* 微信息快捷卡片 */}
              <div className="p-3.5 rounded-xl bg-gray-50/70 dark:bg-gray-900/30 border border-gray-200/60 dark:border-gray-800/60 text-xs font-mono space-y-2 text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between text-[11px]">
                  <span>阅读时长</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    约 {readingTime} 分钟
                  </span>
                </div>
                {wordCount > 0 && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span>全文总字数</span>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">
                      {wordCount} 字
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[11px]">
                  <span>作者</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {article.authorName || "可梵"}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200/50 dark:border-gray-800/50 flex justify-between items-center text-[10px] text-gray-400">
                  <span>Butvan Blog 2.0</span>
                  <button
                    onClick={scrollToTop}
                    className="hover:text-pink-600 dark:hover:text-pink-400 transition-colors flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>回到顶部</span>
                    <ArrowUp className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
