"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Copy, Check, ExternalLink } from "lucide-react";
import { useSound } from "@/hooks/useSound";

interface ArticleCopyrightProps {
  title: string;
  author?: string;
  url?: string;
}

/**
 * 文章原创版权声明微型卡片
 * 紧凑布局，提供 CC BY-NC-SA 4.0 协议和一键复制本文链接
 * 安全处理 SSR Hydration，避免客户端/服务端 window.location 不匹配报错
 */
export function ArticleCopyright({
  title,
  author = "可梵",
  url,
}: ArticleCopyrightProps) {
  const [copied, setCopied] = useState(false);
  const [articleUrl, setArticleUrl] = useState<string>(url || "");
  const { playDroplet } = useSound();

  // 严格在客户端挂载后再同步真实的浏览器地址，消除 SSR Hydration Mismatch
  useEffect(() => {
    if (!url && typeof window !== "undefined") {
      setArticleUrl(window.location.href);
    }
  }, [url]);

  const handleCopy = () => {
    const targetUrl =
      articleUrl || (typeof window !== "undefined" ? window.location.href : "");
    if (!targetUrl) return;
    playDroplet();
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="my-8 p-4 rounded-xl bg-gray-50/70 dark:bg-gray-900/40 border border-gray-200/70 dark:border-gray-800/70 text-xs text-gray-600 dark:text-gray-400">
      <div className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-gray-200 mb-2">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>版权许可与分享协议</span>
      </div>

      <div className="space-y-1.5 font-mono text-[11px] leading-relaxed">
        <div className="flex items-start gap-1">
          <span className="text-gray-400 dark:text-gray-500 shrink-0">本文作者：</span>
          <span className="text-gray-800 dark:text-gray-300 font-sans font-medium">{author}</span>
        </div>

        <div className="flex items-start gap-1">
          <span className="text-gray-400 dark:text-gray-500 shrink-0">本文链接：</span>
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="truncate max-w-[280px] sm:max-w-md text-gray-700 dark:text-gray-300"
              suppressHydrationWarning
            >
              {articleUrl || "..."}
            </span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-0.5 text-pink-600 dark:text-pink-400 hover:underline cursor-pointer shrink-0"
              title="复制文章地址"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-500">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>复制</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-1 pt-1 text-gray-500 dark:text-gray-400 text-[11px]">
          <span className="text-gray-400 dark:text-gray-500 shrink-0">版权声明：</span>
          <span>
            本博客所有文章除特别声明外，均采用{" "}
            <a
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh-hans"
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-600 dark:text-pink-400 underline underline-offset-2 hover:opacity-80 inline-flex items-center gap-0.5"
            >
              CC BY-NC-SA 4.0
              <ExternalLink className="w-2.5 h-2.5" />
            </a>{" "}
            许可协议。转载请署名原作者及出处。
          </span>
        </div>
      </div>
    </div>
  );
}
