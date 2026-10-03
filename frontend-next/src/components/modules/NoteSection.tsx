"use client";

import React from "react";
import { NoteItemVO } from "@/types/note";
import { SectionHeader } from "@/components/core/SectionHeader";
import { ContentRow } from "@/components/core/ContentRow";
import { formatDate } from "@/utils/date";

interface NoteSectionProps {
  notes: NoteItemVO[];
}

// 手记无封面图时的默认优雅手作生活配图兜底
const DEFAULT_NOTE_COVERS = [
  "/images/craft/matcha.jpg",
  "/images/craft/cafe.jpg",
  "/images/craft/cat-table.jpg",
  "/images/craft/flowers.jpg",
  "/images/craft/greenhouse.jpg",
  "/images/craft/car-watercolor.jpg",
];

export function NoteSection({ notes }: NoteSectionProps) {
  if (!notes || notes.length === 0) return null;

  return (
    <section id="notes" className="mt-16 sm:mt-32">
      <SectionHeader
        title="Notes"
        moreHref="/notes"
        moreLabel="View all notes"
        className="animate-in stagger-3"
      />

      <div className="flex flex-col gap-2">
        {notes.map((note, index) => {
          // 优先使用手记自身配置的封面图或首张配图，若无则优雅轮换默认封面
          const thumbUrl =
            note.coverImageUrl ||
            (note.coverImageUrls && note.coverImageUrls[0]) ||
            DEFAULT_NOTE_COVERS[index % DEFAULT_NOTE_COVERS.length];

          return (
            <ContentRow
              key={note.id}
              title={note.title}
              href={`/notes/${note.slug}`}
              date={formatDate(note.publishedAt)}
              badge={note.mood}
              badgeTone="pink"
              thumb={thumbUrl}
              showThumb={true}
              tiltDefault={true}
            />
          );
        })}
      </div>
    </section>
  );
}
