"use client";

import React, { useState } from "react";
import { Heart, Share2, Check } from "lucide-react";
import { motion } from "framer-motion";
import { NoteDetailVO } from "@/types/note";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";
import { noteService } from "@/services";
import { DetailHeader } from "@/components/article/DetailHeader";
import { MarkdownRenderer } from "@/components/article/MarkdownRenderer";
import { CommentSection } from "@/components/modules/CommentSection";

interface NoteDetailClientProps {
  note: NoteDetailVO;
}

/**
 * 极简手记/随笔阅读器
 * 100% 对齐 Chloe Maillot 原版数字花园设计美学：
 * - 纯粹单栏流动排版，极简克制
 * - Instrument Serif 衬线体大标题与微型手记 Meta
 * - 正文自然流淌，伴随优雅点赞交互
 */
export function NoteDetailClient({ note }: NoteDetailClientProps) {
  const [likes, setLikes] = useState(note.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const { playSparkle, playDroplet } = useSound();

  // 确保进入手记详情页时始终处于页面最顶部
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, []);

  const handleLike = async () => {
    if (hasLiked) return;
    playSparkle();
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    try {
      await noteService.like(note.id);
    } catch {}
  };

  const handleCopyLink = () => {
    playDroplet();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const metaTag = note.mood || note.weather || note.location || "Thought";

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)] font-handwriting">
      <main className="max-w-[42rem] mx-auto px-6 pt-8 sm:pt-12 pb-24 font-handwriting">
        {/* 顶部极简导航栏 (← 圆形按钮 + 主题切换，返回手记归档列表) */}
        <DetailHeader backHref="/notes" />

        {/* 标题前置微型 Meta 摘要：Sep 21, 2026 · Mood / Weather */}
        <div className="text-[13px] sm:text-sm text-gray-800 dark:text-gray-400 tracking-tight mb-2.5 flex items-center flex-wrap gap-1 opacity-90">
          <span>{formatDate(note.publishedAt)}</span>
          <span className="mx-1.5 opacity-60">·</span>
          <span>{metaTag}</span>
          {note.location && (
            <>
              <span className="mx-1.5 opacity-60">·</span>
              <span>{note.location}</span>
            </>
          )}
        </div>

        {/* 手绘优雅大标题 */}
        <h1 className="text-2xl sm:text-[2.2rem] text-gray-1200 leading-[1.25] font-bold tracking-tight mb-5">
          {note.title}
        </h1>

        {/* 手记导读摘要卡片：左上角携带专属“摘要”Title，整体被柔和背景颜色包裹 */}
        {note.summary && (
          <div className="my-7 p-4 sm:p-5 rounded-2xl bg-gray-100/75 dark:bg-zinc-900/60 border border-gray-200/80 dark:border-zinc-800/80">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 tracking-wider mb-2 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              <span>摘要</span>
            </div>
            <p className="text-[0.98rem] sm:text-[1.06rem] leading-[1.8] text-gray-1000 dark:text-gray-300 m-0">
              {note.summary}
            </p>
          </div>
        )}

        {/* 沉浸式 Markdown 正文 */}
        <MarkdownRenderer
          content={note.content}
          contentHtml={note.contentHtml}
          className="prose-editorial font-handwriting"
        />

        {/* 文末极简互动区（无多余线条，高对比度清晰交互） */}
        <div className="mt-12 pt-4">
          <div className="flex items-center justify-between text-xs sm:text-[13px]">
            {/* 极简手记共鸣 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                hasLiked
                  ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold"
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
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-800 dark:text-gray-200 transition-colors cursor-pointer font-medium"
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

          <div className="mt-5 text-xs text-gray-600 dark:text-gray-400 text-center sm:text-left">
            © {new Date().getFullYear()} 可梵 · 随手手记
          </div>
        </div>

        {/* 评论区挂载 */}
        <div className="mt-8 font-sans">
          <CommentSection noteId={note.id} targetType="note" />
        </div>
      </main>
    </div>
  );
}
