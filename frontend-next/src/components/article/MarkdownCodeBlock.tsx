"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import hljs from "highlight.js";
import { useSound } from "@/hooks/useSound";

interface MarkdownCodeBlockProps {
  code: string;
  lang?: string;
}

/**
 * macOS 终端风格的高品质代码块组件
 * 包含语法高亮、一键复制、语言标签与长代码自适应折叠展开
 */
export function MarkdownCodeBlock({ code, lang = "" }: MarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>("none");
  const bodyRef = useRef<HTMLDivElement>(null);
  const { playDroplet } = useSound();

  const cleanLang = (lang || "").trim();
  const displayLang = cleanLang ? cleanLang.toUpperCase() : "TEXT";

  // 计算行数
  const lines = code.endsWith("\n")
    ? code.split("\n").length - 1
    : code.split("\n").length;
  const isCollapsible = lines > 16;

  // 使用 highlight.js 语法高亮
  const highlightedHtml = useMemo(() => {
    const raw = code ?? "";
    try {
      if (cleanLang && hljs.getLanguage(cleanLang)) {
        return hljs.highlight(raw, { language: cleanLang }).value;
      }
      return hljs.highlightAuto(raw).value;
    } catch {
      // 容错降级为基础实体转义
      return raw
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  }, [code, cleanLang]);

  // 控制折叠高度
  useEffect(() => {
    if (isCollapsible) {
      if (expanded) {
        setMaxHeight(`${bodyRef.current?.scrollHeight || 800}px`);
      } else {
        setMaxHeight("360px");
      }
    } else {
      setMaxHeight("none");
    }
  }, [expanded, isCollapsible, code]);

  const handleCopy = async () => {
    if (!code) return;
    playDroplet();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn("复制代码失败:", err);
    }
  };

  return (
    <div className="md-codeblock font-mono my-6 overflow-hidden rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-gray-50/70 dark:bg-[#121214] shadow-sm relative group/code">
      {/* 头部状态条 */}
      <div className="flex items-center justify-between border-b border-gray-200/60 dark:border-gray-800/60 px-3.5 py-2 text-[10px] select-none bg-gray-100/50 dark:bg-gray-900/60">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 inline-block" />
        </div>

        {/* 语言标识 */}
        <span className="font-bold text-gray-400 dark:text-gray-500 tracking-wider">
          {displayLang}
        </span>

        {/* 复制代码按钮 */}
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center justify-center rounded p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-200/60 dark:hover:bg-gray-800 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
          title={copied ? "已复制" : "复制代码"}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* 代码正文区 */}
      <div
        ref={bodyRef}
        style={{ maxHeight }}
        className="md-codeblock__body transition-[max-height] duration-300 ease-in-out overflow-hidden relative"
      >
        <pre className="m-0 overflow-x-auto p-4 text-[13px] leading-relaxed hljs">
          <code
            className={`language-${cleanLang} bg-transparent font-mono`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>

        {/* 折叠状态下的渐变遮罩 */}
        {isCollapsible && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 dark:from-[#121214] to-transparent pointer-events-none" />
        )}
      </div>

      {/* 折叠/展开控制按钮 */}
      {isCollapsible && (
        <div className="flex justify-center border-t border-gray-200/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/30 py-1.5">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-0.5 text-[11px] font-mono text-gray-500 hover:text-sky-600 dark:text-gray-400 dark:hover:text-[#BBDFFF] transition-colors cursor-pointer"
          >
            {expanded ? (
              <>
                <span>收起代码</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>展开代码 ({lines} 行)</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
