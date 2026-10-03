"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MapPin, SunMedium } from "lucide-react";
import { NoteDetailVO } from "@/types/note";
import { Badge } from "@/components/ui/Badge";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";
import { noteService } from "@/services";
import { MarkdownRenderer } from "@/components/article/MarkdownRenderer";

interface NoteDetailClientProps {
  note: NoteDetailVO;
}

export function NoteDetailClient({ note }: NoteDetailClientProps) {
  const [likes, setLikes] = useState(note.likeCount || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const { playSparkle, playTick } = useSound();

  const handleLike = async () => {
    if (hasLiked) return;
    playSparkle();
    setHasLiked(true);
    setLikes((prev) => prev + 1);
    try {
      await noteService.like(note.id);
    } catch {
      // 降级容错
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)] selection:bg-[#fde3ef] selection:text-[#9b3860]">
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
          <span className="text-micro font-mono text-gray-600">Thought Snippet</span>
        </div>
      </header>

      <main className="max-w-[40.5rem] mx-auto px-6 pt-12 pb-24">
        <div className="flex flex-col gap-3 mb-8">
          <div className="flex items-center gap-2 flex-wrap">
            {note.mood && <Badge tone="pink">{note.mood}</Badge>}
            {note.weather && (
              <span className="inline-flex items-center gap-1 text-micro text-gray-600">
                <SunMedium className="w-3 h-3 text-amber-500" />
                {note.weather}
              </span>
            )}
            {note.location && (
              <span className="inline-flex items-center gap-1 text-micro text-gray-600">
                <MapPin className="w-3 h-3 text-gray-400" />
                {note.location}
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-50 leading-snug">
            {note.title}
          </h1>

          <div className="text-micro font-mono text-gray-600 border-b border-gray-200 dark:border-gray-800 pb-3">
            {formatDate(note.publishedAt)}
          </div>
        </div>

        {/* 使用统一 MarkdownRenderer 渲染 */}
        <MarkdownRenderer
          content={note.content}
          contentHtml={note.contentHtml}
          className="prose-editorial"
        />

        <div className="mt-14 pt-6 border-t border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLike}
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all cursor-pointer ${
              hasLiked
                ? "bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400"
                : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-rose-300 dark:hover:border-rose-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform ${
                hasLiked ? "fill-rose-500 text-rose-500 scale-110" : ""
              }`}
            />
            <span>{hasLiked ? "已共鸣" : "随手记录点赞"} ({likes})</span>
          </motion.button>
        </div>
      </main>
    </div>
  );
}
