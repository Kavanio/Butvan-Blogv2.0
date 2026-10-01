"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Search } from "lucide-react";
import { noteService } from "@/services";
import { NoteItemVO } from "@/types/note";
import { ContentRow } from "@/components/core/ContentRow";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";

export default function NoteArchivePage() {
  const [notes, setNotes] = useState<NoteItemVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { playTick } = useSound();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await noteService.getPublicNotes({ page: 1, size: 50 });
        setNotes(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 提取所有心情与状态标签
  const allMoods = Array.from(
    new Set(notes.map((n) => n.mood).filter(Boolean))
  ) as string[];

  // 过滤后的手记列表
  const filtered = notes.filter((n) => {
    const matchesKeyword =
      !keyword ||
      n.title.toLowerCase().includes(keyword.toLowerCase()) ||
      (n.summary && n.summary.toLowerCase().includes(keyword.toLowerCase())) ||
      (n.location && n.location.toLowerCase().includes(keyword.toLowerCase()));

    const matchesMood = !selectedMood || n.mood === selectedMood;
    return matchesKeyword && matchesMood;
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
            <Sparkles className="w-3.5 h-3.5" />
            <span>Notes ({notes.length})</span>
          </div>
        </div>
      </header>

      {/* 主容器 */}
      <main className="max-w-[40.5rem] mx-auto px-6 pt-10 pb-20">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            全部手记 / Notes
          </h1>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            即兴灵感、代码顿悟、生活碎片与技术折腾的轻量微记录。
          </p>
        </div>

        {/* 搜索与过滤工具栏 */}
        <div className="mb-6 space-y-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索手记标题、摘要或地点..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-pink-500 text-gray-1200 placeholder:text-gray-500 transition-colors"
            />
          </div>

          {allMoods.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-micro text-gray-500 font-mono mr-1">心情:</span>
              <button
                onClick={() => {
                  playTick();
                  setSelectedMood(null);
                }}
                className={`text-micro px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  selectedMood === null
                    ? "bg-pink-500 text-white border-pink-500 font-medium"
                    : "border-gray-200 dark:border-gray-800 text-gray-600 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                全部
              </button>
              {allMoods.map((mood) => (
                <button
                  key={mood}
                  onClick={() => {
                    playTick();
                    setSelectedMood(mood === selectedMood ? null : mood);
                  }}
                  className={`text-micro px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    selectedMood === mood
                      ? "bg-pink-500 text-white border-pink-500 font-medium"
                      : "border-gray-200 dark:border-gray-800 text-gray-600 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 手记列表 */}
        <div className="flex flex-col">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">加载手记归档中...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">未搜索到相关手记</div>
          ) : (
            filtered.map((item) => (
              <ContentRow
                key={item.id}
                title={item.title}
                date={formatDate(item.publishedAt)}
                badge={item.mood}
                badgeTone="pink"
                href={`/notes/${item.slug || item.id}`}
                thumb={item.coverImageUrl}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
