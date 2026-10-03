"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Marked } from "marked";
import { MarkdownCodeBlock } from "./MarkdownCodeBlock";
import { ImagePreviewModal } from "./ImagePreviewModal";
import { TocItem } from "./ArticleToc";

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

    const headingList: TocItem[] = [];
    const inst = new Marked({
      gfm: true,
      breaks: true,
    });

    inst.use({
      renderer: {
        heading({ text, depth }) {
          const plainText = text.replace(/<[^>]+>/g, "").trim();
          const slug =
            "heading-" +
            plainText
              .toLowerCase()
              .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
              .replace(/^-+|-+$/g, "");
          const id = slug || `heading-${Math.random().toString(36).slice(2, 7)}`;

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

        // 构建 React 属性
        const props: Record<string, any> = {
          key: `${tagName}-${index}`,
        };

        if (element.hasAttribute("class")) {
          props.className = element.getAttribute("class");
        }
        if (element.hasAttribute("id")) {
          props.id = element.getAttribute("id");
        }

        // 拦截图片增强
        if (tagName === "img") {
          const rawSrc = element.getAttribute("src") || "";
          props.src = rawSrc;
          props.alt = element.getAttribute("alt") || "";
          props.className = `${
            element.getAttribute("class") || ""
          } cursor-zoom-in hover:opacity-95 transition-opacity rounded-xl max-h-[520px] object-cover shadow-sm`;
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
          if (
            ["class", "id", "src", "alt", "href", "target", "rel"].includes(
              attr.name
            )
          ) {
            continue;
          }
          if (attr.name.startsWith("on")) continue;

          let reactAttrName = attr.name;
          if (attr.name === "colspan") reactAttrName = "colSpan";
          if (attr.name === "rowspan") reactAttrName = "rowSpan";

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
      <div
        className={`${className} max-w-none`}
        onClick={handleContainerClick}
      >
        {!reactContent ? (
          <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
        ) : (
          reactContent
        )}
      </div>

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
