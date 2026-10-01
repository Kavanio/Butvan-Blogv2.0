import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articleService } from "@/services";
import { ArticleDetailClient } from "./ArticleDetailClient";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await articleService.getDetail(slug);
  if (!article) return { title: "文章未找到" };
  return {
    title: `${article.title} — Butvan`,
    description: article.summary || article.title,
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await articleService.getDetail(slug);

  if (!article) {
    notFound();
  }

  return <ArticleDetailClient article={article} />;
}
