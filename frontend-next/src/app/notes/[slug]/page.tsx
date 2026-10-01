import React from "react";
import { notFound } from "next/navigation";
import { noteService } from "@/services";
import { NoteDetailClient } from "./NoteDetailClient";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await noteService.getDetail(slug);
  if (!note) return { title: "手记未找到" };
  return {
    title: `${note.title} — Butvan Note`,
    description: note.summary || note.title,
  };
}

export default async function NoteDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const note = await noteService.getDetail(slug);

  if (!note) {
    notFound();
  }

  return <NoteDetailClient note={note} />;
}
