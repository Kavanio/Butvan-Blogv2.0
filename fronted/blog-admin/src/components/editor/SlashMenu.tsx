"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@heroui/react";
import {
  Heading1,
  Heading2,
  Heading3,
  Code,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Table,
  Link,
  Image,
  Globe,
  Highlighter,
  Circle,
  Strikethrough,
  Images,
} from "lucide-react";

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  // markdown 可以是直接替换的字符串，或者是返回替换文本与光标偏置量的函数
  markdown: string | ((currentLineText: string) => { replaceText: string; cursorOffset: number });
}

// 预定义指令列表
export const SLASH_COMMANDS: SlashCommand[] = [
  {
    id: "highlight",
    label: "荧光高亮",
    description: "手绘运笔荧光笔高亮 (==高亮==)",
    icon: Highlighter,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}==高亮内容==`, cursorOffset: base.length + 2 };
    },
  },
  {
    id: "circle",
    label: "手绘圈选",
    description: "手绘椭圆闭环描边圈选 ((圈选))",
    icon: Circle,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}((圈选内容))`, cursorOffset: base.length + 2 };
    },
  },
  {
    id: "strike",
    label: "手绘划线",
    description: "手绘双线错落涂改划线 (~~划线~~)",
    icon: Strikethrough,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}~~划线内容~~`, cursorOffset: base.length + 2 };
    },
  },
  {
    id: "h1",
    label: "标题 1",
    description: "高大醒目的主标题",
    icon: Heading1,
    markdown: (line) => {
      // 移除可能存在的斜杠及其后的字母
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}# `, cursorOffset: base.length + 2 };
    },
  },

  {
    id: "h2",
    label: "标题 2",
    description: "中等大小的二级标题",
    icon: Heading2,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}## `, cursorOffset: base.length + 3 };
    },
  },
  {
    id: "h3",
    label: "标题 3",
    description: "三级子标题",
    icon: Heading3,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}### `, cursorOffset: base.length + 4 };
    },
  },
  {
    id: "code",
    label: "代码块",
    description: "高亮着色的代码编辑区",
    icon: Code,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      // 插入 ```javascript\n\n``` 并把光标定位到中间空行
      return {
        replaceText: `${base}\`\`\`javascript\n\n\`\`\``,
        cursorOffset: base.length + 14, // 刚好在中间换行处
      };
    },
  },
  {
    id: "quote",
    label: "引用",
    description: "段落引用块",
    icon: Quote,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}> `, cursorOffset: base.length + 2 };
    },
  },
  {
    id: "ul",
    label: "无序列表",
    description: "项目符号点列表",
    icon: List,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}- `, cursorOffset: base.length + 2 };
    },
  },
  {
    id: "ol",
    label: "有序列表",
    description: "数字序号列表",
    icon: ListOrdered,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}1. `, cursorOffset: base.length + 3 };
    },
  },
  {
    id: "task",
    label: "任务列表",
    description: "待办复选框列表",
    icon: CheckSquare,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}- [ ] `, cursorOffset: base.length + 6 };
    },
  },
  {
    id: "hr",
    label: "分割线",
    description: "水平装饰分割线",
    icon: Minus,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return { replaceText: `${base}---\n`, cursorOffset: base.length + 4 };
    },
  },
  {
    id: "table",
    label: "表格",
    description: "插入标准 Markdown 数据表格",
    icon: Table,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return {
        replaceText: `${base}| 列 1 | 列 2 |\n| ---- | ---- |\n| 内容 | 内容 |`,
        cursorOffset: base.length + 29, // 定位到第一行第二个竖线前的空白
      };
    },
  },
  {
    id: "link",
    label: "超链接",
    description: "指向外部网址的文本链接",
    icon: Link,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return {
        replaceText: `${base}[链接文字](url)`,
        cursorOffset: base.length + 7, // 定位到 url 的首字母
      };
    },
  },
  {
    id: "image",
    label: "图片",
    description: "插入 Markdown 图片标签",
    icon: Image,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return {
        replaceText: `${base}![图片描述](imageUrl)`,
        cursorOffset: base.length + 9, // 定位到 imageUrl 首字母
      };
    },
  },
  {
    id: "html-file",
    label: "嵌入 HTML 页面",
    description: "选择上传 .html 网页并在编辑器内直接渲染",
    icon: Globe,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return {
        replaceText: base,
        cursorOffset: base.length,
      };
    },
  },
  {
    id: "carousel",
    label: "图片轮播",
    description: "多图横向轮播画廊卡片 (<carousel>)",
    icon: Images,
    markdown: (line) => {
      const base = line.replace(/\/.*$/, "");
      return {
        replaceText: `${base}<carousel>\n</carousel>`,
        cursorOffset: base.length + 11,
      };
    },
  },
];

interface SlashMenuProps {
  /** 模糊搜索过滤词（斜杠后面的字母，如 "/h2" 中的 "h2"） */
  searchQuery: string;
  /** 选中的索引 */
  selectedIndex: number;
  /** 相对定位坐标 */
  position: { top: number; left: number };
  /** 触发插入指令回调 */
  onSelectCommand: (command: SlashCommand) => void;
  /** 菜单项筛选完的回调，告知外层过滤后的指令数 */
  onFilteredCommandsChange: (count: number) => void;
}

export default function SlashMenu({
  searchQuery,
  selectedIndex,
  position,
  onSelectCommand,
  onFilteredCommandsChange,
}: SlashMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. 基于搜索词过滤命令
  const query = searchQuery.trim().toLowerCase();
  const filtered = SLASH_COMMANDS.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(query) ||
      cmd.id.toLowerCase().includes(query) ||
      cmd.description.toLowerCase().includes(query)
  );

  // 通知父组件当前过滤后的条目数量以方便键盘上下按键界限校验
  useEffect(() => {
    onFilteredCommandsChange(filtered.length);
  }, [filtered.length, onFilteredCommandsChange]);

  // 2. 选中项变动时，滚动视窗保证选中项可见
  useEffect(() => {
    if (!containerRef.current) return;
    const activeEl = containerRef.current.querySelector(".active-command-item") as HTMLElement;
    if (!activeEl) return;

    const container = containerRef.current;
    const containerTop = container.scrollTop;
    const containerBottom = containerTop + container.clientHeight;
    const elemTop = activeEl.offsetTop;
    const elemBottom = elemTop + activeEl.offsetHeight;

    if (elemTop < containerTop) {
      container.scrollTop = elemTop;
    } else if (elemBottom > containerBottom) {
      container.scrollTop = elemBottom - container.clientHeight;
    }
  }, [selectedIndex]);

  if (filtered.length === 0) return null;

  return (
    <div
      ref={containerRef}
      style={{
        top: position.top + "px",
        left: position.left + "px",
      }}
      className="absolute max-h-60 w-64 overflow-y-auto rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md p-1.5 shadow-xl z-50 animate-[fadeIn_0.15s_ease-out] select-none"
    >
      <div className="px-2.5 py-1 text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-900/60 mb-1.5">
        基础组件快捷命令
      </div>
      <div className="space-y-0.5">
        {filtered.map((cmd, index) => {
          const Icon = cmd.icon;
          const isSelected = index === selectedIndex;
          return (
            <button
              key={cmd.id}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelectCommand(cmd)}
              className={cn(
                "w-full flex items-center gap-3 px-2.5 py-2 text-left rounded-lg transition-all cursor-pointer group",
                isSelected
                  ? "bg-primary text-white active-command-item shadow-xs"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-md border",
                  isSelected
                    ? "bg-white/20 border-white/10 text-white"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200/50 dark:border-zinc-800 text-zinc-400 group-hover:text-zinc-650 dark:group-hover:text-zinc-250 transition-colors"
                )}
              >
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn("text-xs font-bold leading-tight", isSelected ? "text-white" : "text-zinc-800 dark:text-zinc-200")}>
                  {cmd.label}
                </div>
                <div className={cn("text-[9px] leading-tight mt-0.5", isSelected ? "text-white/80" : "text-zinc-400 dark:text-zinc-550")}>
                  {cmd.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
