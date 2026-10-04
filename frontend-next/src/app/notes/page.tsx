"use client";

import React, { useState, useEffect } from "react";
import { noteService } from "@/services";
import { NoteItemVO } from "@/types/note";
import { ContentRow } from "@/components/core/ContentRow";
import { ContentRowSkeleton } from "@/components/ui/Skeleton";
import { DetailHeader } from "@/components/article/DetailHeader";
import { formatDate } from "@/utils/date";

const DEFAULT_NOTE_COVERS = [
  "/images/craft/matcha.jpg",
  "/images/craft/cafe.jpg",
  "/images/craft/cat-table.jpg",
  "/images/craft/flowers.jpg",
  "/images/craft/greenhouse.jpg",
  "/images/craft/car-watercolor.jpg",
];

export default function NoteArchivePage() {
  const [notes, setNotes] = useState<NoteItemVO[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)] selection:bg-[#fde3ef] selection:text-[#9b3860]">
      {/* 主容器 */}
      <main className="max-w-[40.5rem] mx-auto px-6 pt-8 sm:pt-12 pb-20">
        {/* 极简内联微返回与主题切换 */}
        <DetailHeader backHref="/" className="mb-6 sm:mb-8" />

        {/* 手记列表（仅展示列表，右侧保留微缩封面图） */}
        <div className="flex flex-col gap-2">
          {loading ? (
            <div className="flex flex-col gap-2 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <ContentRowSkeleton key={i} hasThumb={true} />
              ))}
            </div>
          ) : notes.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-mono">暂无手记</div>
          ) : (
            notes.map((item, index) => (
              <ContentRow
                key={item.id}
                title={item.title}
                date={formatDate(item.publishedAt)}
                badge={item.mood}
                badgeTone="pink"
                href={`/notes/${item.slug || item.id}`}
                thumb={
                  item.coverImageUrl ||
                  (item.coverImageUrls && item.coverImageUrls[0]) ||
                  DEFAULT_NOTE_COVERS[index % DEFAULT_NOTE_COVERS.length]
                }
                showThumb={true}
                tiltDefault={true}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}
