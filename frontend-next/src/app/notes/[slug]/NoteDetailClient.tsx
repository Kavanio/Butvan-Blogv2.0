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
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)] selection:bg-[#fde3ef] selection:text-[#9b3860]">
      <main className="max-w-[40.5rem] mx-auto px-6 pt-8 sm:pt-12 pb-24">
        {/* 顶部极简导航栏 (← 圆形按钮 + EN · FR + 主题切换，返回手记归档列表) */}
        <DetailHeader backHref="/notes" />

        {/* 标题前置微型 Meta 摘要：Sep 21, 2026 · Mood / Weather */}
        <div className="text-xs sm:text-[13px] text-gray-800 dark:text-gray-400 font-mono tracking-tight mb-3">
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

        {/* 衬线体优雅大标题 (Instrument Serif) */}
        <h1 className="font-serif text-2xl sm:text-[2.2rem] text-gray-1200 leading-[1.2] font-normal tracking-tight mb-5">
          {note.title}
        </h1>

        {/* 摘要导言（若存在） */}
        {note.summary && (
          <>
            <p className="text-[15px] sm:text-base leading-relaxed text-gray-1100 mb-8 font-sans">
              {note.summary}
            </p>
            <div className="w-full h-px bg-gray-200/80 dark:bg-gray-800/80 mb-10" />
          </>
        )}

        {/* 沉浸式 Markdown 正文 */}
        <MarkdownRenderer
          content={note.content}
          contentHtml={note.contentHtml}
          className="prose-editorial"
        />

        {/* 文末极简互动区 */}
        <div className="mt-16 pt-8 border-t border-gray-200/60 dark:border-gray-800/60">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 font-mono">
            {/* 极简手记共鸣 */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                hasLiked
                  ? "text-rose-600 dark:text-rose-400 font-medium"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <Heart
                className={`size-3.5 transition-transform ${
                  hasLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
                }`}
              />
              <span>{likes}</span>
            </motion.button>

            {/* 极简分享链接 */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-500" />
                  <span className="text-emerald-500">已复制链接</span>
                </>
              ) : (
                <>
                  <Share2 className="size-3.5" />
                  <span>分享</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 text-[11px] font-mono text-gray-400 dark:text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} 可梵 · 随手手记
          </div>
        </div>
      </main>
    </div>
  );
}
