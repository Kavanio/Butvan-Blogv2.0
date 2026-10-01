"use client";

import React from "react";
import { NoteItemVO } from "@/types/note";
import { SectionHeader } from "@/components/core/SectionHeader";
import { ContentRow } from "@/components/core/ContentRow";
import { formatDate } from "@/utils/date";

interface NoteSectionProps {
  notes: NoteItemVO[];
}

export function NoteSection({ notes }: NoteSectionProps) {
  if (!notes || notes.length === 0) return null;

  return (
    <section id="notes" className="mt-16 sm:mt-28">
      <SectionHeader title="Notes" moreHref="/notes" moreLabel="View all notes" />

      <div className="flex flex-col gap-1">
        {notes.map((note) => (
          <ContentRow
            key={note.id}
            title={note.title}
            href={`/notes/${note.slug}`}
            date={formatDate(note.publishedAt)}
            badge={note.mood}
            badgeTone="pink"
            showThumb={true}
          />
        ))}
      </div>
    </section>
  );
}
