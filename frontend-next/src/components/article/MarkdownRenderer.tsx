"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Marked } from "marked";
import { ExternalLink } from "lucide-react";
import { MarkdownCodeBlock } from "./MarkdownCodeBlock";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { TocItem } from "./ArticleToc";

// 常见 HTML 属性名与 React JSX 驼峰属性名映射表
const ATTR_MAP: Record<string, string> = {
  allowfullscreen: "allowFullScreen",
  frameborder: "frameBorder",
  colspan: "colSpan",
  rowspan: "rowSpan",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  autoplay: "autoPlay",
  crossorigin: "crossOrigin",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  contenteditable: "contentEditable",
  spellcheck: "spellCheck",
};

/**
 * 将原生 CSS 行内 style 字符串解析为 React style 对象映射
 */
function parseStyleString(styleStr: string): Record<string, string> {
  const styleObj: Record<string, string> = {};
  if (!styleStr) return styleObj;
  styleStr.split(";").forEach((rule) => {
    const [k, v] = rule.split(":");
    if (k && v) {
      const camelKey = k
        .trim()
        .replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      styleObj[camelKey] = v.trim();
    }
  });
  return styleObj;
}

interface MarkdownRendererProps {
  content?: string;
  contentHtml?: string;
  className?: string;
  onHeadingsExtracted?: (headings: TocItem[]) => void;
}

/**
 * 专为 Butvan Blog 打造的极客级 Markdown / 富文本渲染引擎
 * 
 * 核心特性：
 * 1. 彻底修复 contentHtml 存放 raw Markdown 导致的无换行与排版错乱 Bug
 * 2. 自动生成标题锚点与 TOC 目录大纲
 * 3. 拦截接管 <pre><code> 代码块为带有 macOS 终端三色控制点、语言标示、高亮和一键复制的交互组件
 * 4. 拦截图片点击，无缝调出全屏高清 Lightbox 查看器
 * 5. 表格自动添加响应式横向滚动包装层
 * 6. 首屏 SSR 优先直出 HTML，客户端 Hydration 后无缝升级为 React 交互组件
 */
export function MarkdownRenderer({
  content,
  contentHtml,
  className = "prose-editorial",
  onHeadingsExtracted,
}: MarkdownRendererProps) {
  const [reactContent, setReactContent] = useState<React.ReactNode>(null);
  const [previewImage, setPreviewImage] = useState<{
    isOpen: boolean;
    src: string;
    alt: string;
  }>({
    isOpen: false,
    src: "",
    alt: "",
  });

  // 1. 获取最可靠的 Markdown 原始源文本
  const sourceText = useMemo(() => {
    // 优先使用 content（纯原始 Markdown），若无则尝试 contentHtml
    const raw = (content ?? "").trim() || (contentHtml ?? "").trim();
    return raw;
  }, [content, contentHtml]);

  // 2. 使用 Marked 进行语法编译与大纲提取
  const { cleanHtml, headings } = useMemo(() => {
    if (!sourceText) {
      return { cleanHtml: "", headings: [] };
    }

    let headingIndex = 0;
    const headingList: TocItem[] = [];
    const inst = new Marked({
      gfm: true,
      breaks: true,
    });

    inst.use({
      renderer: {
        heading({ text, depth }) {
          const plainText = text.replace(/<[^>]+>/g, "").trim();
          headingIndex += 1;
          const slug =
            "heading-" +
            plainText
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
              .replace(/^-+|-+$/g, "");
          const id = slug && slug !== "heading-" ? slug : `heading-${headingIndex}`;

          if (depth === 2 || depth === 3) {
            headingList.push({ id, text: plainText, level: depth });
          }

          return `<h${depth} id="${id}" class="group relative flex items-center">${text}<a href="#${id}" class="heading-anchor opacity-0 group-hover:opacity-100 ml-2 text-pink-500 font-mono text-xs transition-opacity" aria-label="锚点链接">#</a></h${depth}>`;
        },
        link({ href, title, text }) {
          const isExternal =
            href.startsWith("http://") || href.startsWith("https://");
          return `<a href="${href}" ${
            isExternal ? 'target="_blank" rel="noopener noreferrer"' : ""
          } ${title ? `title="${title}"` : ""}>${text}</a>`;
        },
        table({ header, rows }) {
          return `<div class="my-6 overflow-x-auto rounded-xl border border-gray-200/80 dark:border-gray-800/80"><table class="w-full text-left border-collapse text-xs">${header}${rows}</table></div>`;
        },
      },
    });

    try {
      const parsed = inst.parse(sourceText) as string;
      return { cleanHtml: parsed, headings: headingList };
    } catch (e) {
      console.error("Markdown 解析异常，降级显示:", e);
      return { cleanHtml: sourceText, headings: [] };
    }
  }, [sourceText]);

  // 通知外部目录大纲
  useEffect(() => {
    if (onHeadingsExtracted) {
      onHeadingsExtracted(headings);
    }
  }, [headings, onHeadingsExtracted]);

  // 3. 客户端拦截转换：将代码块提升为 React 交互组件
  useEffect(() => {
    if (typeof window === "undefined" || !cleanHtml) return;

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanHtml, "text/html");

    const convertNode = (node: Node, index: number): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();

        // 拦截 <pre><code> 渲染为高质量代码块
        if (tagName === "pre") {
          const codeEl = element.querySelector("code");
          if (codeEl) {
            const codeText = codeEl.textContent || "";
            let lang = "";
            const classList = Array.from(codeEl.classList);
            const langClass = classList.find((c) => c.startsWith("language-"));
            if (langClass) {
              lang = langClass.replace("language-", "");
            }
            return (
              <MarkdownCodeBlock
                key={`code-block-${index}`}
                code={codeText}
                lang={lang}
              />
            );
          }
        }

        // 拦截 <iframe> 标签并进行精美 macOS 窗口卡片包装
        if (tagName === "iframe") {
          const rawSrc = element.getAttribute("src") || "";
          const rawTitle =
            element.getAttribute("title") ||
            element.getAttribute("name") ||
            "HTML 交互页面演示";
          const allowFullScreen =
            element.hasAttribute("allowfullscreen") ||
            element.getAttribute("allowfullscreen") === "true";
          const inlineStyle = parseStyleString(element.getAttribute("style") || "");

          return (
            <div
              key={`iframe-card-${index}`}
              className="my-6 not-prose rounded-xl border border-gray-200/80 dark:border-gray-800/80 bg-white dark:bg-[#121214] overflow-hidden shadow-sm transition-all"
            >
              {/* 顶部 macOS 窗口控制栏 */}
              <div className="flex items-center justify-between px-3.5 py-2 bg-gray-50/80 dark:bg-gray-900/60 border-b border-gray-200/60 dark:border-gray-800/60 text-xs select-none">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]/90 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]/90 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]/90 inline-block" />
                  </div>
                  <span className="truncate max-w-[240px] sm:max-w-[360px] font-mono text-[11px] text-gray-700 dark:text-gray-300 font-medium">
                    {rawTitle}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium font-mono">
                    HTML 预览
                  </span>
                  {rawSrc && (
                    <a
                      href={rawSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="在新标签页独立打开预览"
                      className="p-1 rounded text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* iframe 真正嵌入区 */}
              <iframe
                src={rawSrc}
                title={rawTitle}
                style={{
                  width: inlineStyle.width || "100%",
                  height: inlineStyle.height || "450px",
                  border: "none",
                  ...inlineStyle,
                }}
                className="w-full min-h-[380px] border-none bg-white block"
                allowFullScreen={allowFullScreen}
              />
            </div>
          );
        }

        // 构建通用 React 属性映射
        const props: Record<string, any> = {
          key: `${tagName}-${index}`,
        };

        if (element.hasAttribute("class")) {
          props.className = element.getAttribute("class");
        }
        if (element.hasAttribute("id")) {
          props.id = element.getAttribute("id");
        }

        // 拦截图片增强（自适应原图宽高比，避免 object-cover 截断技术图表）
        if (tagName === "img") {
          const rawSrc = element.getAttribute("src") || "";
          props.src = rawSrc;
          props.alt = element.getAttribute("alt") || "";
          props.loading = "lazy";
          props.className = `${
            element.getAttribute("class") || ""
          } cursor-zoom-in hover:opacity-95 transition-opacity rounded-xl max-w-full h-auto shadow-sm my-4`;
        }

        if (tagName === "a") {
          props.href = element.getAttribute("href") || "#";
          if (element.getAttribute("target")) {
            props.target = element.getAttribute("target");
          }
          if (element.getAttribute("rel")) {
            props.rel = element.getAttribute("rel");
          }
        }

        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          const attrNameLower = attr.name.toLowerCase();

          if (
            ["class", "id", "src", "alt", "href", "target", "rel"].includes(
              attrNameLower
            )
          ) {
            continue;
          }
          if (attr.name.startsWith("on")) continue;

          // 核心修复：将 HTML style 字符串解析为 React 对象映射，防止 Runtime Error
          if (attrNameLower === "style") {
            props.style = parseStyleString(attr.value);
            continue;
          }

          // 核心修复：转换 allowfullscreen -> allowFullScreen 等 React 驼峰属性
          const reactAttrName = ATTR_MAP[attrNameLower] || attr.name;
          props[reactAttrName] = attr.value;
        }

        const children = Array.from(element.childNodes).map((child, childIdx) =>
          convertNode(child, childIdx)
        );

        return React.createElement(
          tagName,
          props,
          children.length > 0 ? children : null
        );
      }

      return null;
    };

    const childNodes = Array.from(doc.body.childNodes);
    const elements = childNodes.map((node, idx) => convertNode(node, idx));
    setReactContent(<React.Fragment>{elements}</React.Fragment>);
  }, [cleanHtml]);

  // 全局事件代理：捕获正文所有图片点击开启灯箱
  const handleContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName.toLowerCase() === "img") {
        const imgEl = target as HTMLImageElement;
        const src = imgEl.getAttribute("src") || imgEl.currentSrc || imgEl.src;
        const alt = imgEl.alt || "";
        if (src) {
          setPreviewImage({
            isOpen: true,
            src,
            alt,
          });
        }
      }
    },
    []
  );

  return (
    <>
      {!reactContent ? (
        <div
          className={`${className} max-w-none`}
          onClick={handleContainerClick}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
          suppressHydrationWarning
        />
      ) : (
        <div
          className={`${className} max-w-none`}
          onClick={handleContainerClick}
          suppressHydrationWarning
        >
          {reactContent}
        </div>
      )}

      {/* 图片全屏预览模态框 */}
      <ImagePreviewModal
        isOpen={previewImage.isOpen}
        src={previewImage.src}
        alt={previewImage.alt}
        onClose={() => setPreviewImage({ isOpen: false, src: "", alt: "" })}
      />
    </>
  );
}
