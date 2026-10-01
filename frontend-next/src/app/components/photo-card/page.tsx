"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Copy } from "lucide-react";
import { PhotoCard } from "@/components/PhotoCard";
import { play } from "@/lib/sound";

const CODE_EXAMPLE = `import { PhotoCard } from "@/components/PhotoCard";

export default function Demo() {
  return (
    <PhotoCard
      src="/images/craft/greenhouse.jpg"
      alt="Greenhouse photography"
      aspect="4/5"
      rotate={-2}
    />
  );
}`;

export default function PhotoCardPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_EXAMPLE);
    play("success", { volume: 0.5 });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="mx-auto max-w-[40.5rem] px-6 py-12 sm:py-20">
      {/* 返回首页 */}
      <Link
        href="/"
        onClick={() => play("release", { volume: 0.3 })}
        className="group mb-8 inline-flex items-center gap-1.5 text-body text-gray-1000 transition-colors hover:text-gray-1200"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
        <span>Back</span>
      </Link>

      {/* 头部标题与标签 */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-1200">
          PhotoCard
        </h1>
        <span className="rounded-full bg-[#fde3ef] px-2.5 py-0.5 text-micro uppercase tracking-wider text-[#9b3860] dark:bg-[#462134] dark:text-[#f2aed0]">
          New
        </span>
      </div>

      <p className="mt-2 text-base text-gray-1000 leading-relaxed">
        Interactive framed photo card featuring cursor-tracking specular sheen (Halo),
        subtle film grain noise, and spring physics lightbox modal.
      </p>

      {/* 实时效果预览交互区 */}
      <div className="mt-8 flex items-center justify-center rounded-2xl border border-gray-400 bg-gray-100 p-12">
        <div className="w-56">
          <PhotoCard
            src="/images/craft/greenhouse.jpg"
            alt="Greenhouse demo"
            aspect="4/5"
            rotate={-2}
          />
        </div>
      </div>

      {/* 代码示例展示区 */}
      <div className="mt-8">
        <div className="flex items-center justify-between pb-2">
          <span className="font-mono text-micro text-gray-1000">Usage</span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-400 bg-gray-100 px-2.5 py-1 font-mono text-micro text-gray-1100 transition-colors hover:bg-gray-200"
          >
            {copied ? (
              <>
                <Check className="size-3 text-emerald-500" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-3" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="overflow-x-auto rounded-xl border border-gray-400 bg-gray-100 p-4 font-mono text-caption text-gray-1200">
          <code>{CODE_EXAMPLE}</code>
        </pre>
      </div>
    </main>
  );
}
