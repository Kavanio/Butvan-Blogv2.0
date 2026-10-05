"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import hljs from "highlight.js";
import { useSound } from "@/hooks/useSound";

interface MarkdownCodeBlockProps {
  code: string;
  lang?: string;
}

/**
 * 极简现代代码块组件（对齐 new md preview / editor 规范）
 * - 无文件名冗余信息
 * - 灰底纯语言徽标（tsx/jsx 映射为 React，其他首字母大写）
 * - 复制成功弹出强反馈气泡 Tooltip + 弹性对勾动画
 * - 保持 JetBrains Mono 等宽字体与优雅暗黑模式适配
 */
export function MarkdownCodeBlock({ code, lang = "" }: MarkdownCodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [maxHeight, setMaxHeight] = useState<string>("none");
  const bodyRef = useRef<HTMLDivElement>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { playDroplet } = useSound();

  const cleanLang = (lang || "").trim();
  const rawLower = cleanLang.toLowerCase();

  // 语言徽标映射规则：tsx/jsx 映射为 React，其他首字母大写
  const displayLang = useMemo(() => {
    if (!cleanLang) return "Code";
    if (rawLower === "tsx" || rawLower === "jsx") return "React";
    if (rawLower === "ts") return "TypeScript";
    if (rawLower === "js") return "JavaScript";
    if (rawLower === "py") return "Python";
    if (rawLower === "rs") return "Rust";
    if (rawLower === "sh" || rawLower === "shell") return "Bash";
    return cleanLang.charAt(0).toUpperCase() + cleanLang.slice(1);
  }, [cleanLang, rawLower]);

  // 计算行数
  const lines = code.endsWith("\n")
    ? code.split("\n").length - 1
    : code.split("\n").length;
  const isCollapsible = lines > 18;

  // 使用 highlight.js 语法高亮
  const highlightedHtml = useMemo(() => {
    const raw = code ?? "";
    try {
      if (cleanLang && hljs.getLanguage(cleanLang)) {
        return hljs.highlight(raw, { language: cleanLang }).value;
      }
      return hljs.highlightAuto(raw).value;
    } catch {
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
        setMaxHeight("380px");
      }
    } else {
      setMaxHeight("none");
    }
  }, [expanded, isCollapsible, code]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, []);

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
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.warn("复制代码失败:", err);
    }
  };

  return (
    <div className="code-card">
      {/* 头部控制栏 */}
      <div className="code-header">
        {/* 左侧：纯语言徽标，不显示文件名 */}
        <span className="code-lang-badge">{displayLang}</span>

        {/* 右侧：带提示气泡与动画切换的复制按钮 */}
        <div className="copy-btn-wrapper">
          <div className={`copy-tooltip ${copied ? "show" : ""}`}>
            已复制到剪贴板
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className={`code-copy-btn ${copied ? "copied" : ""}`}
            title="复制代码"
          >
            {copied ? (
              <svg
                className="icon-pop-animate"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* 代码正文区 */}
      <div
        ref={bodyRef}
        style={{ maxHeight }}
        className="transition-[max-height] duration-300 ease-in-out overflow-hidden relative"
      >
        <pre className="code-body m-0 p-4 text-[13px] leading-relaxed hljs">
          <code
            className={`language-${cleanLang} bg-transparent font-mono`}
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>

        {/* 折叠状态下的渐变遮罩 */}
        {isCollapsible && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-[#121214] to-transparent pointer-events-none" />
        )}
      </div>

      {/* 折叠/展开控制按钮 */}
      {isCollapsible && (
        <div className="flex justify-center border-t border-gray-100 dark:border-gray-800/60 bg-gray-50/60 dark:bg-gray-900/30 py-1.5">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 px-3 py-0.5 text-[11px] font-mono text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
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

