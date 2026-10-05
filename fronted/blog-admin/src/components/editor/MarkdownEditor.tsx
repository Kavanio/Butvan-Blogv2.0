"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Columns,
  Edit3,
  Eye,
  Image as ImageIcon,
  Code as CodeIcon,
  Globe,
  Images,
  Trash2,
} from "lucide-react";
import SlashMenu, { SLASH_COMMANDS, type SlashCommand } from "./SlashMenu";
import apiClient from "@/lib/api";
import { resolveAssetUrl } from "@/lib/image-url";

/**
 * 测量 textarea 中光标的相对像素坐标 (Mirror Div 方案)
 */
function getCaretCoordinates(element: HTMLTextAreaElement, position: number) {
  if (typeof window === "undefined" || !document) {
    return { top: 32, left: 24, height: 28 };
  }

  const properties = [
    "direction",
    "boxSizing",
    "width",
    "height",
    "overflowX",
    "overflowY",
    "borderTopWidth",
    "borderRightWidth",
    "borderBottomWidth",
    "borderLeftWidth",
    "paddingTop",
    "paddingRight",
    "paddingBottom",
    "paddingLeft",
    "fontStyle",
    "fontVariant",
    "fontWeight",
    "fontStretch",
    "fontSize",
    "fontSizeAdjust",
    "lineHeight",
    "fontFamily",
    "textAlign",
    "textTransform",
    "textIndent",
    "textDecoration",
    "letterSpacing",
    "wordSpacing",
    "tabSize",
  ] as const;

  const div = document.createElement("div");
  div.id = "caret-position-mirror-div";
  document.body.appendChild(div);

  const style = div.style;
  const computed = window.getComputedStyle(element);

  style.whiteSpace = "pre-wrap";
  style.wordBreak = "break-word";
  style.position = "absolute";
  style.visibility = "hidden";
  style.top = "0";
  style.left = "-9999px";

  properties.forEach((prop) => {
    style[prop as any] = computed[prop as any];
  });

  div.textContent = element.value.substring(0, position);

  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  const coordinates = {
    top: span.offsetTop + parseInt(computed.borderTopWidth || "0", 10),
    left: span.offsetLeft + parseInt(computed.borderLeftWidth || "0", 10),
    height: parseInt(computed.lineHeight || "24", 10) || 24,
  };

  document.body.removeChild(div);
  return coordinates;
}

export interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** 当编辑器内图片发生变化时回调，直接传递从文本中提取的图片 URL 数组供封面自动提取 */
  onImageChange?: (urls: string[]) => void;
  height?: number | string;
  placeholder?: string;
  preview?: "edit" | "live" | "preview";
}

/**
 * 跨环境剪贴板复制工具函数（兼容 http、https 与 file://）
 */
function copyTextToClipboard(text: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      if (successful) resolve();
      else reject(new Error("execCommand failed"));
    } catch (err) {
      document.body.removeChild(textArea);
      reject(err);
    }
  });
}

/**
 * 极简代码语法着色函数（使用纯字母类名，绝对避免数字被二次正则污染）
 */
function highlightCode(rawCode: string): string {
  const escape = (str: string) =>
    str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let code = escape(rawCode);

  // 注释
  code = code.replace(/(\/\/.*$)/gm, '<span class="token-comment">$1</span>');

  // 关键字：红色（覆盖主流语言）
  code = code.replace(
    /\b(import|from|function|const|return|let|pub|async|fn|await|class|interface|type|public|private|protected|new|void|static|extends|implements|package|def|struct|enum)\b/g,
    '<span class="token-keyword">$1</span>'
  );

  // JSX / 标签：绿色
  code = code.replace(
    /(&lt;\/?)(div|p|button|[A-Z][a-zA-Z0-9]*)/g,
    '$1<span class="token-tag">$2</span>'
  );

  // 属性与常用 Hook / 方法：紫色
  code = code.replace(
    /\b(onClick|useState|useEffect|useMemo|useCallback|useRef|Counter|Solution)\b/g,
    '<span class="token-fn">$1</span>'
  );

  // 变量名与数值：蓝色
  code = code.replace(/\b(count|setCount)\b/g, '<span class="token-var">$1</span>');
  code = code.replace(/\b(\d+)\b/g, '<span class="token-var">$1</span>');

  return code;
}

/**
 * 行内语法解析器（严格注入内联绝对定位样式，防坍塌、居中对齐）
 */
const SYNTAX =
  /==([\s\S]+?)==|\(\(([\s\S]+?)\)\)|~~([\s\S]+?)~~|\*\*([\s\S]+?)\*\*|\*([^\n*]+)\*|`([^`\n]+)`|!\[([^\n\]]*)\]\(([^\n)]+)\)|\[([^\n\]]+)\]\(([^\n)]+)\)/g;

function parseInline(text: string, parentEl: HTMLElement) {
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  const regex = new RegExp(SYNTAX);

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parentEl.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));
    }

    const [full, mark, circle, strike, bold, italic, inlineCode, imgAlt, imgSrc, linkText, linkUrl] = match;

    if (mark) {
      const wrap = document.createElement("span");
      wrap.className = "ink-mark";
      wrap.innerHTML = `<span class="ink-swipe"></span><span class="ink-text">${mark}</span>`;
      parentEl.appendChild(wrap);
    } else if (circle) {
      const wrap = document.createElement("span");
      wrap.className = "ink-mark";
      wrap.innerHTML = `
        <span class="ink-text">${circle}</span>
        <svg class="ink-svg-circle" style="position:absolute;left:-0.28em;top:-0.1em;width:calc(100% + 0.56em);height:calc(100% + 0.2em);pointer-events:none;overflow:visible;z-index:3;display:block;" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M8 54 C6 26 30 8 52 7 C76 6 95 20 95 46 C95 74 72 93 48 93 C24 93 7 78 6 52 C6 34 16 20 34 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" vector-effect="non-scaling-stroke" />
        </svg>
      `;
      parentEl.appendChild(wrap);
    } else if (strike) {
      const wrap = document.createElement("span");
      wrap.className = "ink-mark";
      wrap.innerHTML = `
        <span class="ink-text">${strike}</span>
        <svg class="ink-svg-strike" style="position:absolute;left:-0.06em;width:calc(100% + 0.12em);height:0.4em;top:50%;transform:translateY(-40%);pointer-events:none;overflow:visible;z-index:3;display:block;" viewBox="0 0 100 10" preserveAspectRatio="none">
          <path d="M1 4 C24 2 46 7 68 4 C82 2 92 6 99 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" vector-effect="non-scaling-stroke" />
          <path class="line-2" d="M2 7 C26 5 44 9 66 6 C80 4 92 8 98 6" fill="none" stroke="currentColor" stroke-width="1.4" opacity="0.85" vector-effect="non-scaling-stroke" />
        </svg>
      `;
      parentEl.appendChild(wrap);
    } else if (bold) {
      const b = document.createElement("span");
      b.className = "md-bold";
      b.textContent = bold;
      parentEl.appendChild(b);
    } else if (italic) {
      const it = document.createElement("span");
      it.style.fontStyle = "italic";
      it.textContent = italic;
      parentEl.appendChild(it);
    } else if (inlineCode) {
      const c = document.createElement("code");
      c.className = "md-inline-code";
      c.textContent = inlineCode;
      parentEl.appendChild(c);
    } else if (imgSrc) {
      const img = document.createElement("img");
      img.src = imgSrc;
      img.alt = imgAlt || "";
      img.className = "my-4 rounded-xl max-w-[85%] max-h-[360px] w-auto h-auto object-contain mx-auto border border-zinc-200 dark:border-zinc-800 shadow-sm block";
      parentEl.appendChild(img);
    } else if (linkText) {
      const a = document.createElement("a");
      a.className = "md-link";
      a.href = linkUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = linkText;
      parentEl.appendChild(a);
    }

    lastIndex = match.index + full.length;
  }

  if (lastIndex < text.length) {
    parentEl.appendChild(document.createTextNode(text.slice(lastIndex)));
  }
}

/**
 * 生成交互式图片轮播卡片 DOM 节点（沉浸式无边框视窗 + 毛玻璃控制 + 缩略图轨道联动）
 */
function createCarouselDOM(
  images: { alt: string; url: string }[],
  onAppendImages?: () => void
): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "my-7 not-prose select-none group/carousel";

  if (images.length === 0) {
    const emptyCard = document.createElement("div");
    emptyCard.className =
      "relative w-full h-[220px] rounded-2xl bg-zinc-950/80 border border-dashed border-zinc-700/80 flex flex-col items-center justify-center gap-2.5 text-zinc-400 p-6";
    emptyCard.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="text-zinc-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span class="text-xs font-sans">轮播图暂无图片</span>
    `;
    if (onAppendImages) {
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className =
        "px-3 py-1 rounded-lg text-xs font-medium bg-primary text-white hover:opacity-90 transition-all cursor-pointer";
      addBtn.textContent = "+ 上传图片";
      addBtn.addEventListener("click", onAppendImages);
      emptyCard.appendChild(addBtn);
    }
    wrap.appendChild(emptyCard);
    return wrap;
  }

  // 1. 核心大图展示视窗
  let currentIndex = 0;
  const viewport = document.createElement("div");
  viewport.className =
    "relative w-full h-[320px] sm:h-[400px] md:h-[440px] rounded-2xl bg-zinc-950 overflow-hidden shadow-lg border border-black/5 dark:border-white/10 flex items-center justify-center";

  const imgEl = document.createElement("img");
  imgEl.src = images[0].url;
  imgEl.alt = images[0].alt || "";
  imgEl.className =
    "max-w-full max-h-[300px] sm:max-h-[380px] md:max-h-[420px] w-auto h-auto object-contain rounded-lg shadow-sm transition-opacity duration-200 block mx-auto";
  viewport.appendChild(imgEl);

  // 右上角浮层：+ 补传图片胶囊
  if (onAppendImages) {
    const appendBtn = document.createElement("button");
    appendBtn.type = "button";
    appendBtn.className =
      "absolute right-3.5 top-3.5 z-20 px-2.5 py-1 rounded-xl bg-black/50 hover:bg-black/80 text-white/90 hover:text-white backdrop-blur-md border border-white/20 text-xs font-sans flex items-center gap-1 shadow-sm transition-all cursor-pointer";
    appendBtn.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
      <span>补传图片</span>
    `;
    appendBtn.addEventListener("click", onAppendImages);
    viewport.appendChild(appendBtn);
  }

  // 左右切页毛玻璃按钮
  let prevBtn: HTMLButtonElement | null = null;
  let nextBtn: HTMLButtonElement | null = null;

  if (images.length > 1) {
    prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className =
      "absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-70 hover:opacity-100 hover:scale-105 active:scale-95";
    prevBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;

    nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className =
      "absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center transition-all cursor-pointer opacity-70 hover:opacity-100 hover:scale-105 active:scale-95";
    nextBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

    viewport.appendChild(prevBtn);
    viewport.appendChild(nextBtn);
  }

  // 底部渐变 HUD 层：左侧图说 + 右侧微胶囊页码
  const hud = document.createElement("div");
  hud.className =
    "absolute inset-x-0 bottom-0 z-10 px-4 py-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between gap-3 pointer-events-none";

  const altEl = document.createElement("div");
  altEl.className =
    "text-xs text-white/85 font-sans font-medium drop-shadow-xs truncate max-w-[70%]";
  altEl.textContent = images[0].alt || `第 1 张`;

  const counter = document.createElement("div");
  counter.className =
    "px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-[11px] font-mono font-medium text-white/95 tracking-wider shadow-xs";
  counter.textContent = `1 / ${images.length}`;

  hud.appendChild(altEl);
  hud.appendChild(counter);
  viewport.appendChild(hud);
  wrap.appendChild(viewport);

  // 2. 底部缩略图胶卷条（大于 1 张时展示）
  let thumbButtons: HTMLButtonElement[] = [];
  if (images.length > 1) {
    const filmstrip = document.createElement("div");
    filmstrip.className =
      "flex items-center gap-2 mt-2.5 px-0.5 overflow-x-auto scroll-smooth py-1";
    filmstrip.style.scrollbarWidth = "none";

    images.forEach((img, idx) => {
      const thumbBtn = document.createElement("button");
      thumbBtn.type = "button";
      thumbBtn.title = img.alt || `第 ${idx + 1} 张`;
      thumbBtn.className = `relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-zinc-900 ${
        idx === 0
          ? "border-primary shadow-xs ring-2 ring-primary/30 opacity-100 scale-102"
          : "border-transparent opacity-45 hover:opacity-85 hover:border-zinc-500"
      }`;

      const thumbImg = document.createElement("img");
      thumbImg.src = img.url;
      thumbImg.alt = img.alt || "";
      thumbImg.className = "w-full h-full object-cover";

      thumbBtn.appendChild(thumbImg);
      thumbBtn.addEventListener("click", () => updateView(idx));
      filmstrip.appendChild(thumbBtn);
      thumbButtons.push(thumbBtn);
    });

    wrap.appendChild(filmstrip);
  }

  // 视图更新函数
  const updateView = (index: number) => {
    currentIndex = (index + images.length) % images.length;
    imgEl.src = images[currentIndex].url;
    imgEl.alt = images[currentIndex].alt || "";
    altEl.textContent = images[currentIndex].alt || `第 ${currentIndex + 1} 张`;
    counter.textContent = `${currentIndex + 1} / ${images.length}`;

    // 更新缩略图高亮状态
    thumbButtons.forEach((btn, bIdx) => {
      if (bIdx === currentIndex) {
        btn.className =
          "relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden shrink-0 border-2 border-primary shadow-xs ring-2 ring-primary/30 opacity-100 scale-102 transition-all cursor-pointer bg-zinc-900";
        btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      } else {
        btn.className =
          "relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden shrink-0 border-2 border-transparent opacity-45 hover:opacity-85 hover:border-zinc-500 transition-all cursor-pointer bg-zinc-900";
      }
    });
  };

  if (prevBtn && nextBtn) {
    prevBtn.addEventListener("click", () => updateView(currentIndex - 1));
    nextBtn.addEventListener("click", () => updateView(currentIndex + 1));
  }

  return wrap;
}

/**
 * 块级渲染引擎：完全对齐 new md editor.html 规范
 */
function renderMarkdownToDOM(
  source: string,
  container: HTMLElement,
  onAppendCarousel?: (carouselIndex: number) => void
) {
  container.innerHTML = "";
  const lines = source.split("\n");
  let i = 0;
  let carouselCount = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    // 0. iframe 嵌入网页
    if (trimmed.startsWith("<iframe") && trimmed.includes("</iframe>")) {
      const wrapper = document.createElement("div");
      wrapper.className = "my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm";
      wrapper.innerHTML = trimmed;
      container.appendChild(wrapper);
      i++;
      continue;
    }

    // 0.5 图片轮播组件 <carousel> 或 :::carousel
    if (trimmed.startsWith("<carousel>") || trimmed.startsWith(":::carousel")) {
      const isCustomTag = trimmed.startsWith("<carousel>");
      const endTag = isCustomTag ? "</carousel>" : ":::";
      const carouselLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(endTag)) {
        carouselLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;

      const innerText = carouselLines.join("\n");
      const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
      const images: { alt: string; url: string }[] = [];
      let m: RegExpExecArray | null;
      while ((m = imgRegex.exec(innerText)) !== null) {
        images.push({ alt: m[1] || "", url: m[2] });
      }

      const cIdx = carouselCount++;
      const carouselEl = createCarouselDOM(images, () => {
        if (onAppendCarousel) {
          onAppendCarousel(cIdx);
        }
      });
      container.appendChild(carouselEl);
      continue;
    }

    // 1. 多行代码块 ```lang
    if (trimmed.startsWith("```")) {
      const rawLang = trimmed.slice(3).trim();
      let langBadge = "Code";
      if (rawLang) {
        const first = rawLang.split(/\s+/)[0].toLowerCase();
        if (first === "tsx" || first === "jsx") langBadge = "React";
        else langBadge = first.charAt(0).toUpperCase() + first.slice(1);
      }

      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      if (i < lines.length) i++;

      const card = document.createElement("div");
      card.className = "code-card";

      const header = document.createElement("div");
      header.className = "code-header";

      const badge = document.createElement("span");
      badge.className = "code-lang-badge";
      badge.textContent = langBadge;
      header.appendChild(badge);

      const wrapper = document.createElement("div");
      wrapper.className = "copy-btn-wrapper";

      const tooltip = document.createElement("div");
      tooltip.className = "copy-tooltip";
      tooltip.textContent = "已复制到剪贴板";

      const copyBtn = document.createElement("button");
      copyBtn.className = "code-copy-btn";
      copyBtn.title = "复制代码";
      copyBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      `;

      const rawCode = codeLines.join("\n");
      let resetTimer: any = null;
      copyBtn.addEventListener("click", () => {
        copyTextToClipboard(rawCode).then(() => {
          copyBtn.innerHTML = `
            <svg class="icon-pop-animate" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          `;
          copyBtn.classList.add("copied");
          tooltip.classList.add("show");
          if (resetTimer) clearTimeout(resetTimer);
          resetTimer = setTimeout(() => {
            tooltip.classList.remove("show");
            copyBtn.classList.remove("copied");
            copyBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            `;
          }, 1800);
        });
      });

      wrapper.appendChild(tooltip);
      wrapper.appendChild(copyBtn);
      header.appendChild(wrapper);
      card.appendChild(header);

      const body = document.createElement("div");
      body.className = "code-body";
      body.innerHTML = highlightCode(rawCode);
      card.appendChild(body);

      container.appendChild(card);
      continue;
    }

    // 2. 表格
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableWrapper = document.createElement("div");
      tableWrapper.className = "md-table-wrapper";
      const table = document.createElement("table");
      table.className = "md-table";

      let isHeader = true;
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        const rowText = lines[i].trim();
        if (rowText.includes("---")) {
          i++;
          isHeader = false;
          continue;
        }
        const tr = document.createElement("tr");
        const cells = rowText.split("|").slice(1, -1);
        cells.forEach((cell) => {
          const el = document.createElement(isHeader ? "th" : "td");
          parseInline(cell.trim(), el);
          tr.appendChild(el);
        });
        table.appendChild(tr);
        i++;
      }
      tableWrapper.appendChild(table);
      container.appendChild(tableWrapper);
      continue;
    }

    // 3. 分割线
    if (trimmed === "---" || trimmed === "***") {
      const hr = document.createElement("hr");
      hr.className = "md-hr";
      container.appendChild(hr);
      i++;
      continue;
    }

    // 4. 标题 H1 ~ H6
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const h = document.createElement(`h${level}`);
      h.className = `md-h${level}`;
      parseInline(headingMatch[2], h);
      container.appendChild(h);
      i++;
      continue;
    }

    // 5. 引用块
    if (trimmed.startsWith("> ") || trimmed === ">") {
      const q = document.createElement("blockquote");
      q.className = "md-quote";
      const quoteContent = trimmed.startsWith("> ") ? trimmed.slice(2) : "";
      parseInline(quoteContent, q);
      container.appendChild(q);
      i++;
      continue;
    }

    // 6. 任务列表
    const taskMatch = trimmed.match(/^-\s+\[([ xX])\]\s*(.*)$/);
    if (taskMatch) {
      const isChecked = taskMatch[1].toLowerCase() === "x";
      const li = document.createElement("div");
      li.className = "md-li";
      const checkbox = document.createElement("span");
      checkbox.className = "md-task-checkbox";
      checkbox.textContent = isChecked ? "✓" : "";
      li.appendChild(checkbox);

      const wrap = document.createElement("span");
      parseInline(taskMatch[2], wrap);
      li.appendChild(wrap);

      container.appendChild(li);
      i++;
      continue;
    }

    // 7. 有序列表
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (olMatch) {
      const li = document.createElement("div");
      li.className = "md-li";
      const num = document.createElement("span");
      num.className = "md-bullet";
      num.textContent = `${olMatch[1]}.`;
      li.appendChild(num);

      const wrap = document.createElement("span");
      parseInline(olMatch[2], wrap);
      li.appendChild(wrap);

      container.appendChild(li);
      i++;
      continue;
    }

    // 8. 无序列表
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const li = document.createElement("div");
      li.className = "md-li";
      const bullet = document.createElement("span");
      bullet.className = "md-bullet";
      bullet.textContent = "•";
      li.appendChild(bullet);

      const wrap = document.createElement("span");
      parseInline(trimmed.slice(2), wrap);
      li.appendChild(wrap);

      container.appendChild(li);
      i++;
      continue;
    }

    // 9. 普通段落
    const p = document.createElement("div");
    p.className = "md-p";
    parseInline(rawLine, p);
    container.appendChild(p);
    i++;
  }
}

/**
 * 从 Markdown 文本中提取所有图片 URL
 */
function extractImagesFromMarkdown(text: string): string[] {
  const urls: string[] = [];
  const mdImgRegex = /!\[.*?\]\((.*?)\)/g;
  let match: RegExpExecArray | null;
  while ((match = mdImgRegex.exec(text)) !== null) {
    const u = match[1]?.trim();
    if (u && !urls.includes(u)) {
      urls.push(u);
    }
  }
  const htmlImgRegex = /<img[^>]+src=["'](.*?)["']/g;
  while ((match = htmlImgRegex.exec(text)) !== null) {
    const u = match[1]?.trim();
    if (u && !urls.includes(u)) {
      urls.push(u);
    }
  }
  return urls;
}

/**
 * INK EDITOR 极简手绘 Markdown 双栏沉浸式编辑器
 */
export default function MarkdownEditor({
  value,
  onChange,
  onImageChange,
  height = "100%",
  placeholder = "在此输入 Markdown 文本，支持 ==高亮==、((圈选))、~~划线~~...",
  preview = "live",
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<"edit" | "live" | "preview">(preview);
  const [uploading, setUploading] = useState(false);

  // 斜杠指令菜单状态
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [filteredCount, setFilteredCount] = useState(SLASH_COMMANDS.length);

  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const previewContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const htmlFileInputRef = useRef<HTMLInputElement>(null);
  const carouselFileInputRef = useRef<HTMLInputElement>(null);
  const carouselInsertPosRef = useRef<number | null>(null);
  const appendCarouselIndexRef = useRef<number | null>(null);

  const textValue = value ?? "";
  const charCount = textValue.length;

  // 搜索词变更时重置选中索引，避免越界
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // 图片更新同步
  useEffect(() => {
    if (onImageChange) {
      const imgs = extractImagesFromMarkdown(textValue);
      onImageChange(imgs);
    }
  }, [textValue, onImageChange]);

  // 光标居中保鲜逻辑
  const keepCaretInView = useCallback(() => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const textBeforeCursor = textarea.value.substring(0, textarea.selectionStart);
    const currentLine = textBeforeCursor.split("\n").length;
    const lineHeight = 28;
    const paddingTop = 32;
    const caretY = (currentLine - 1) * lineHeight + paddingTop;

    const viewTop = textarea.scrollTop;
    const viewBottom = viewTop + textarea.clientHeight - 80;

    if (caretY > viewBottom) {
      textarea.scrollTop = caretY - textarea.clientHeight + 100;
    }
  }, []);

  // 预览区点击 "+ 补传图片" 的回调
  const handleAppendCarousel = useCallback((carouselIndex: number) => {
    appendCarouselIndexRef.current = carouselIndex;
    carouselInsertPosRef.current = null;
    carouselFileInputRef.current?.click();
  }, []);

  // 触发实时渲染
  const updatePreview = useCallback(
    (text: string) => {
      if (previewContentRef.current) {
        renderMarkdownToDOM(text, previewContentRef.current, handleAppendCarousel);
      }
    },
    [handleAppendCarousel]
  );

  // 文本变动时实时渲染预览
  useEffect(() => {
    updatePreview(textValue);
  }, [textValue, updatePreview]);

  // 双向平滑滚动同步
  useEffect(() => {
    const editorEl = editorRef.current;
    const previewEl = previewScrollRef.current;
    if (!editorEl || !previewEl || viewMode !== "live") return;

    let isSyncingLeft = false;
    let isSyncingRight = false;

    const handleLeftScroll = () => {
      if (isSyncingRight) return;
      isSyncingLeft = true;
      const maxEditor = editorEl.scrollHeight - editorEl.clientHeight;
      const maxPreview = previewEl.scrollHeight - previewEl.clientHeight;
      if (maxEditor > 0) {
        const ratio = editorEl.scrollTop / maxEditor;
        previewEl.scrollTop = ratio * maxPreview;
      }
      requestAnimationFrame(() => {
        isSyncingLeft = false;
      });
    };

    const handleRightScroll = () => {
      if (isSyncingLeft) return;
      isSyncingRight = true;
      const maxEditor = editorEl.scrollHeight - editorEl.clientHeight;
      const maxPreview = previewEl.scrollHeight - previewEl.clientHeight;
      if (maxPreview > 0) {
        const ratio = previewEl.scrollTop / maxPreview;
        editorEl.scrollTop = ratio * maxEditor;
      }
      requestAnimationFrame(() => {
        isSyncingRight = false;
      });
    };

    editorEl.addEventListener("scroll", handleLeftScroll, { passive: true });
    previewEl.addEventListener("scroll", handleRightScroll, { passive: true });

    return () => {
      editorEl.removeEventListener("scroll", handleLeftScroll);
      previewEl.removeEventListener("scroll", handleRightScroll);
    };
  }, [viewMode]);

  // 快捷语法包裹
  const insertSyntax = (prefix: string, suffix: string, placeholderText = "标记内容") => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const selected = val.substring(start, end) || placeholderText;
    const replacement = prefix + selected + suffix;

    const nextVal = val.substring(0, start) + replacement + val.substring(end);
    onChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selected.length;
    }, 0);
  };

  // 插入代码块
  const insertCodeBlock = () => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const val = textarea.value;
    const snippet = "\n```tsx\n// 在此编写代码\nconst greeting = 'Hello World';\n```\n";
    const nextVal = val.substring(0, start) + snippet + val.substring(end);
    onChange(nextVal);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + snippet.length;
      textarea.selectionEnd = start + snippet.length;
    }, 0);
  };

  // 异步上传图片处理
  const handleUploadFile = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", "ARTICLE");
      formData.append("sourceDetail", "文章正文插图");
      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.code === 200 || res.data.code === 0) {
        let url = res.data.data.fileUrl;
        if (url.startsWith("/")) {
          url = resolveAssetUrl(url);
        }
        if (editorRef.current) {
          const textarea = editorRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const val = textarea.value;
          const mdImg = `\n![${file.name.replace(/\.[^/.]+$/, "")}](${url})\n`;
          const nextVal = val.substring(0, start) + mdImg + val.substring(end);
          onChange(nextVal);
          setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + mdImg.length;
            textarea.selectionEnd = start + mdImg.length;
          }, 0);
        }
      }
    } catch (err: any) {
      console.error("图片上传失败:", err);
      alert(err.message || "图片上传失败");
    } finally {
      setUploading(false);
    }
  };

  // 异步上传 HTML 页面文件处理
  const handleUploadHtmlFile = async (file: File) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("sourceType", "ARTICLE_EMBED");
      formData.append("sourceDetail", "文章正文嵌入 HTML 页面");
      const res = await apiClient.post("/admin/media/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.code === 200 || res.data.code === 0) {
        let url = res.data.data.fileUrl;
        if (url.startsWith("/")) {
          url = resolveAssetUrl(url);
        }
        if (editorRef.current) {
          const textarea = editorRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const val = textarea.value;
          const title = file.name.replace(/\.(html|htm)$/i, "");
          const iframeSnippet = `\n<iframe src="${url}" title="${title}" width="100%" height="450px" style="width: 100%; height: 450px; border: none; border-radius: 12px; overflow: hidden;" allowfullscreen></iframe>\n\n`;
          const nextVal = val.substring(0, start) + iframeSnippet + val.substring(end);
          onChange(nextVal);
          setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + iframeSnippet.length;
            textarea.selectionEnd = start + iframeSnippet.length;
          }, 0);
        }
      }
    } catch (err: any) {
      console.error("HTML 页面上传失败:", err);
      alert(err.message || "HTML 页面上传失败");
    } finally {
      setUploading(false);
    }
  };

  // 批量上传轮播图片处理（支持初次插入与向指定轮播块补传）
  const handleUploadCarouselFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      const uploadedImages: { name: string; url: string }[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sourceType", "ARTICLE_CAROUSEL");
        formData.append("sourceDetail", "文章正文轮播图");
        const res = await apiClient.post("/admin/media/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.code === 200 || res.data.code === 0) {
          let url = res.data.data.fileUrl;
          if (url.startsWith("/")) {
            url = resolveAssetUrl(url);
          }
          uploadedImages.push({
            name: file.name.replace(/\.[^/.]+$/, ""),
            url,
          });
        }
      }

      if (uploadedImages.length === 0) {
        alert("未能成功上传图片，请重试");
        return;
      }

      const textarea = editorRef.current;
      const currentVal = textarea ? textarea.value : textValue;

      // 判断是向既有轮播块补传，还是新插入轮播块
      if (appendCarouselIndexRef.current !== null) {
        const appendIdx = appendCarouselIndexRef.current;
        appendCarouselIndexRef.current = null;

        // 匹配轮播图块 <carousel>...</carousel> 或 :::carousel...:::
        const carouselRegex = /<carousel>([\s\S]*?)<\/carousel>|:::carousel([\s\S]*?):::/g;
        let match: RegExpExecArray | null;
        let currentIdx = 0;
        let targetPos: number | null = null;

        while ((match = carouselRegex.exec(currentVal)) !== null) {
          if (currentIdx === appendIdx) {
            if (match[1] !== undefined) {
              targetPos = match.index + match[0].lastIndexOf("</carousel>");
            } else {
              targetPos = match.index + match[0].lastIndexOf(":::");
            }
            break;
          }
          currentIdx++;
        }

        const newImgsMd =
          uploadedImages.map((img) => `![${img.name}](${img.url})`).join("\n") + "\n";

        if (targetPos !== null) {
          const nextVal =
            currentVal.slice(0, targetPos) + newImgsMd + currentVal.slice(targetPos);
          onChange(nextVal);
          setTimeout(() => {
            if (textarea) {
              textarea.focus();
              const cursor = targetPos! + newImgsMd.length;
              textarea.selectionStart = cursor;
              textarea.selectionEnd = cursor;
              keepCaretInView();
            }
          }, 0);
          return;
        }
      }

      // 新插入轮播块
      const insertPos =
        carouselInsertPosRef.current ?? (textarea ? textarea.selectionStart : currentVal.length);
      carouselInsertPosRef.current = null;

      const imgsMd = uploadedImages
        .map((img) => `![${img.name}](${img.url})`)
        .join("\n");
      const snippet = `\n<carousel>\n${imgsMd}\n</carousel>\n\n`;
      const nextVal =
        currentVal.slice(0, insertPos) + snippet + currentVal.slice(insertPos);
      onChange(nextVal);

      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const targetCursor = insertPos + snippet.length;
          textarea.selectionStart = targetCursor;
          textarea.selectionEnd = targetCursor;
          keepCaretInView();
        }
      }, 0);
    } catch (err: any) {
      console.error("轮播图上传失败:", err);
      alert(err.message || "轮播图上传失败");
    } finally {
      setUploading(false);
      if (carouselFileInputRef.current) {
        carouselFileInputRef.current.value = "";
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleUploadFile(file);
          return;
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    const files = e.dataTransfer?.files;
    if (files && files.length > 0 && files[0].type.startsWith("image/")) {
      e.preventDefault();
      handleUploadFile(files[0]);
    }
  };

  // 检测光标所在位置是否处于 / 指令状态并计算浮层位置
  const checkSlashCommand = useCallback(() => {
    if (!editorRef.current) return;
    const textarea = editorRef.current;
    const pos = textarea.selectionStart;
    const textBefore = textarea.value.slice(0, pos);

    // 匹配行首、空白或换行后的 '/'
    const match = textBefore.match(/(?:^|\n|[ ])\/([a-zA-Z0-9_\u4e00-\u9fa5]*)$/);
    if (match) {
      const query = match[1] || "";
      setSearchQuery(query);
      setMenuOpen(true);

      const coords = getCaretCoordinates(textarea, pos);
      const visualTop = coords.top - textarea.scrollTop;
      const visualLeft = coords.left - textarea.scrollLeft;

      let top = visualTop + coords.height + 6;
      if (visualTop + coords.height + 260 > textarea.clientHeight && visualTop > 260) {
        top = visualTop - 250;
      }

      let left = visualLeft;
      if (left + 270 > textarea.clientWidth) {
        left = Math.max(16, textarea.clientWidth - 280);
      } else if (left < 16) {
        left = 16;
      }

      setMenuPosition({ top, left });
    } else {
      setMenuOpen(false);
    }
  }, []);

  // 执行选中的斜杠命令
  const executeCommand = useCallback(
    (cmd: SlashCommand) => {
      if (!editorRef.current) return;
      const textarea = editorRef.current;
      const pos = textarea.selectionStart;
      const fullText = textarea.value;
      const textBefore = fullText.slice(0, pos);
      const textAfter = fullText.slice(pos);

      // 找到匹配的斜杠指令起点
      const match = textBefore.match(/(?:^|\n|[ ])\/([a-zA-Z0-9_\u4e00-\u9fa5]*)$/);
      if (!match) {
        setMenuOpen(false);
        return;
      }

      const matchText = match[0];
      const slashIndexInMatch = matchText.indexOf("/");
      const replaceStart = textBefore.length - matchText.length + slashIndexInMatch;

      // 针对需要上传文件的特殊指令处理
      if (cmd.id === "image") {
        const nextVal = fullText.slice(0, replaceStart) + textAfter;
        onChange(nextVal);
        setMenuOpen(false);
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = replaceStart;
          textarea.selectionEnd = replaceStart;
          fileInputRef.current?.click();
        }, 0);
        return;
      }

      if (cmd.id === "carousel") {
        const nextVal = fullText.slice(0, replaceStart) + textAfter;
        onChange(nextVal);
        setMenuOpen(false);
        carouselInsertPosRef.current = replaceStart;
        appendCarouselIndexRef.current = null;
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = replaceStart;
          textarea.selectionEnd = replaceStart;
          carouselFileInputRef.current?.click();
        }, 0);
        return;
      }

      if (cmd.id === "html-file") {
        const nextVal = fullText.slice(0, replaceStart) + textAfter;
        onChange(nextVal);
        setMenuOpen(false);
        setTimeout(() => {
          textarea.focus();
          textarea.selectionStart = replaceStart;
          textarea.selectionEnd = replaceStart;
          htmlFileInputRef.current?.click();
        }, 0);
        return;
      }

      // 如果 cmd.markdown 是一个函数
      if (typeof cmd.markdown === "function") {
        const lineStart = textBefore.lastIndexOf("\n") + 1;
        const currentLine = textBefore.slice(lineStart);
        const result = cmd.markdown(currentLine);
        const nextVal = fullText.slice(0, lineStart) + result.replaceText + textAfter;
        onChange(nextVal);
        setMenuOpen(false);
        setTimeout(() => {
          textarea.focus();
          const targetCursor = lineStart + result.cursorOffset;
          if (cmd.id === "highlight" || cmd.id === "circle" || cmd.id === "strike") {
            const placeholderLen = 4;
            textarea.selectionStart = targetCursor;
            textarea.selectionEnd = targetCursor + placeholderLen;
          } else {
            textarea.selectionStart = targetCursor;
            textarea.selectionEnd = targetCursor;
          }
          keepCaretInView();
        }, 0);
        return;
      }

      // 如果 cmd.markdown 是一个字符串
      if (typeof cmd.markdown === "string") {
        const nextVal = fullText.slice(0, replaceStart) + cmd.markdown + textAfter;
        onChange(nextVal);
        setMenuOpen(false);
        setTimeout(() => {
          textarea.focus();
          const targetCursor = replaceStart + cmd.markdown.length;
          textarea.selectionStart = targetCursor;
          textarea.selectionEnd = targetCursor;
          keepCaretInView();
        }, 0);
      }
    },
    [onChange, keepCaretInView]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // 1. 如果斜杠菜单处于打开状态，拦截方向键、回车、Tab 与 Escape
    if (menuOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (filteredCount > 0 ? (prev + 1) % filteredCount : 0));
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filteredCount > 0 ? (prev - 1 + filteredCount) % filteredCount : 0
        );
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const query = searchQuery.trim().toLowerCase();
        const filtered = SLASH_COMMANDS.filter(
          (cmd) =>
            cmd.label.toLowerCase().includes(query) ||
            cmd.id.toLowerCase().includes(query) ||
            cmd.description.toLowerCase().includes(query)
        );
        const activeCommand = filtered[selectedIndex];
        if (activeCommand) {
          executeCommand(activeCommand);
        }
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setMenuOpen(false);
        return;
      }
    }

    if (e.key === "Enter") {
      setTimeout(keepCaretInView, 0);
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (!editorRef.current) return;
      const textarea = editorRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;
      const nextVal = val.substring(0, start) + "  " + val.substring(end);
      onChange(nextVal);
      setTimeout(() => {
        textarea.selectionStart = start + 2;
        textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div
      style={{ height: typeof height === "number" ? `${height}px` : height }}
      className="flex flex-col w-full h-full bg-white dark:bg-[#09090b] rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden shadow-sm select-none"
    >
      {/* 顶部极简工具栏 */}
      <header className="h-11 min-h-[44px] px-3.5 border-b border-zinc-200/70 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          {/* 品牌与模式标识 */}
          <div className="flex items-center gap-1.5 font-bold text-xs tracking-tight text-zinc-900 dark:text-zinc-100 mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            <span>INK EDITOR</span>
            <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded">
              即时所见即所得
            </span>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1 hidden sm:block" />

          {/* 快捷语法按钮组 */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              type="button"
              onClick={() => insertSyntax("==", "==", "高亮内容")}
              className="px-2 py-1 rounded text-xs font-mono font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="荧光高亮 (==text==)"
            >
              <span className="bg-[#fef08a] dark:bg-amber-950/60 text-[#713f12] dark:text-amber-300 px-1 rounded text-[11px]">
                ==高亮==
              </span>
            </button>

            <button
              type="button"
              onClick={() => insertSyntax("((", "))", "圈选内容")}
              className="px-2 py-1 rounded text-xs font-mono font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="手绘圈选 ((text))"
            >
              <span>((圈选))</span>
            </button>

            <button
              type="button"
              onClick={() => insertSyntax("~~", "~~", "划线内容")}
              className="px-2 py-1 rounded text-xs font-mono font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="手绘涂改 (~~text~~)"
            >
              <span className="line-through decoration-zinc-400">~~划线~~</span>
            </button>

            <button
              type="button"
              onClick={() => insertSyntax("**", "**", "加粗文本")}
              className="p-1 px-1.5 rounded text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              title="文本加粗 (**text**)"
            >
              <b>B</b>
            </button>

            <button
              type="button"
              onClick={insertCodeBlock}
              className="p-1 px-2 rounded text-xs font-mono font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
              title="插入多行代码块"
            >
              <CodeIcon size={12} />
              <span>代码块</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="p-1 px-2 rounded text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="上传并插入图片"
            >
              <ImageIcon size={12} />
              <span>{uploading ? "上传中..." : "插图"}</span>
            </button>

            <button
              type="button"
              onClick={() => htmlFileInputRef.current?.click()}
              disabled={uploading}
              className="p-1 px-2 rounded text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="上传并嵌入 HTML 网页"
            >
              <Globe size={12} />
              <span>{uploading ? "处理中..." : "嵌入网页"}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (editorRef.current) {
                  carouselInsertPosRef.current = editorRef.current.selectionStart;
                  appendCarouselIndexRef.current = null;
                  carouselFileInputRef.current?.click();
                }
              }}
              disabled={uploading}
              className="p-1 px-2 rounded text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
              title="插入多图轮播 (<carousel>)"
            >
              <Images size={12} />
              <span>{uploading ? "处理中..." : "轮播图"}</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUploadFile(e.target.files[0]);
                }
              }}
            />

            <input
              ref={carouselFileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleUploadCarouselFiles(e.target.files);
                }
              }}
            />

            <input
              ref={htmlFileInputRef}
              type="file"
              accept=".html,.htm"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleUploadHtmlFile(e.target.files[0]);
                }
              }}
            />
          </div>
        </div>

        {/* 右侧：视图模式切换与统计 */}
        <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-mono">
          <span className="hidden md:inline">{charCount} 字符</span>

          {/* 模式切换 */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg border border-zinc-200/50 dark:border-zinc-700/50">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                viewMode === "edit"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="仅编辑模式"
            >
              <Edit3 size={11} className="inline mr-1" />
              <span>编辑</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("live")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                viewMode === "live"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="双栏分屏所见即所得"
            >
              <Columns size={11} className="inline mr-1" />
              <span>分屏</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                viewMode === "preview"
                  ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
              }`}
              title="仅预览模式"
            >
              <Eye size={11} className="inline mr-1" />
              <span>预览</span>
            </button>
          </div>

          {/* 清空按钮 */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm("确定要清空编辑内容吗？")) {
                onChange("");
              }
            }}
            className="p-1 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
            title="清空文本"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </header>

      {/* 编辑器核心双栏主体 */}
      <main className="flex-1 w-full min-h-0 flex flex-row overflow-hidden bg-white dark:bg-[#09090b]">
        {/* 左侧纯 Markdown 编写区 */}
        {(viewMode === "live" || viewMode === "edit") && (
          <section
            className={`h-full flex flex-col relative bg-white dark:bg-[#09090b] ${
              viewMode === "live"
                ? "w-1/2 border-r border-zinc-200/70 dark:border-zinc-800/80"
                : "w-full"
            }`}
          >
            <textarea
              ref={editorRef}
              value={textValue}
              onChange={(e) => {
                onChange(e.target.value);
                setTimeout(checkSlashCommand, 0);
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={(e) => {
                if (e.key !== "ArrowUp" && e.key !== "ArrowDown" && e.key !== "Enter") {
                  checkSlashCommand();
                }
              }}
              onClick={checkSlashCommand}
              onScroll={() => {
                if (menuOpen) {
                  checkSlashCommand();
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  setMenuOpen(false);
                }, 200);
              }}
              onPaste={handlePaste}
              onDrop={handleDrop}
              placeholder={placeholder}
              spellCheck={false}
              className="flex-1 w-full h-full p-6 pb-48 font-mono text-[13px] sm:text-[14px] leading-relaxed resize-none border-none outline-none bg-transparent text-zinc-800 dark:text-zinc-200 custom-scrollbar select-text placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            />

            {/* 斜杠指令浮动菜单 */}
            {menuOpen && (
              <SlashMenu
                searchQuery={searchQuery}
                selectedIndex={selectedIndex}
                position={menuPosition}
                onFilteredCommandsChange={setFilteredCount}
                onSelectCommand={executeCommand}
              />
            )}
          </section>
        )}

        {/* 右侧所见即所得手写预览区 */}
        {(viewMode === "live" || viewMode === "preview") && (
          <section
            ref={previewScrollRef}
            className={`h-full overflow-y-auto custom-scrollbar p-6 sm:p-10 pb-48 bg-[#fafafa] dark:bg-[#0d0d10] font-handwriting ${
              viewMode === "live" ? "w-1/2" : "w-full"
            }`}
          >
            <div
              ref={previewContentRef}
              className="max-w-[640px] mx-auto text-[1.4rem] sm:text-[1.55rem] leading-[2.2] sm:leading-[2.35] text-zinc-900 dark:text-zinc-100 select-text relative"
            />
          </section>
        )}
      </main>
    </div>
  );
}
