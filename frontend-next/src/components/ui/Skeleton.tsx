"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 极简流光骨架屏基础块 (Atomic Skeleton)
 */
export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      style={style}
      className={`animate-shimmer rounded-md bg-gray-200/80 dark:bg-gray-800/80 ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * 内容行高保真骨架条 (ContentRow Skeleton)
 * 精确对齐手记与文章行高度、间距与布局
 */
export function ContentRowSkeleton({ hasThumb = false }: { hasThumb?: boolean }) {
  return (
    <div className="-mx-4 flex w-full items-center justify-between gap-4 rounded-xl px-4 py-2.5">
      {/* 左侧：标题骨架条与徽章 */}
      <div className="flex flex-1 items-center gap-3">
        <Skeleton className="h-4 w-48 sm:w-64 max-w-[70%]" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>

      {/* 右侧：日期与可选封面缩略图小框 */}
      <div className="flex shrink-0 items-center gap-4">
        <Skeleton className="h-3.5 w-16" />
        {hasThumb && (
          <Skeleton className="size-12 rounded-lg border border-gray-300 dark:border-gray-700" />
        )}
      </div>
    </div>
  );
}

/**
 * 详情页高保真阅读骨架屏 (Article/Note Detail Skeleton)
 */
export function DetailSkeleton() {
  return (
    <main className="mx-auto max-w-[40.5rem] px-6 py-12 sm:py-20 animate-in">
      {/* 顶部返回按钮与元信息 */}
      <div className="mb-8 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-md" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* 标题 */}
      <Skeleton className="mb-4 h-10 w-4/5" />
      <Skeleton className="mb-10 h-10 w-2/3" />

      {/* 分隔与标签 */}
      <div className="mb-12 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* 正文多段骨架 */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="h-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-4/5" />
        <div className="h-4" />
        <Skeleton className="h-36 w-full rounded-xl" />
        <div className="h-4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </main>
  );
}

/**
 * 首页首屏骨架屏 (Home Page Loading Skeleton)
 */
export function HomePageSkeleton() {
  return (
    <main className="mx-auto max-w-[40.5rem] px-6 py-12 sm:py-20 animate-in">
      {/* 头部名片骨架 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>

      {/* 手记列表骨架板块 */}
      <section className="mt-16 sm:mt-24">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <ContentRowSkeleton key={i} hasThumb={true} />
          ))}
        </div>
      </section>

      {/* 文章列表骨架板块 */}
      <section className="mt-16 sm:mt-24">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <ContentRowSkeleton key={i} hasThumb={false} />
          ))}
        </div>
      </section>
    </main>
  );
}
