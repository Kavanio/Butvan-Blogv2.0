"use client";

import { useEffect, useState } from "react";
import { 
  Search, 
  X, 
  Loader2, 
  Check, 
  Trash, 
  Trash2, 
  ShieldAlert, 
  RotateCcw, 
  Reply, 
  ExternalLink,
  MessageSquare,
  Globe,
  FileText,
  Mail,
  Laptop,
  Ban,
  ArrowUp,
  User
} from "lucide-react";
import { cn } from "@heroui/react";
import { 
  fetchAdminComments, 
  updateCommentStatus, 
  replyComment, 
  deleteComment,
  markCommentAsAuthor,
  togglePinComment,
  banCommentAuthor
} from "@/lib/comments-api";
import { toast } from "@/lib/toast";
import ConfirmModal from "@/components/common/ConfirmModal";
import Portal from "@/components/common/Portal";
import type { CommentItem } from "@/types/comment";
import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true
});

/**
 * 极轻量级、无依赖的前端 HTML XSS 注入净化过滤器，拦截危险标签、事件和伪协议
 */
const sanitizeCommentHtml = (htmlStr: string): string => {
  if (!htmlStr) return '';
  return htmlStr
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<(iframe|object|embed|form|link|meta|style)\b[^>]*>([\s\S]*?)<\/\1>/gi, '')
    .replace(/<(iframe|object|embed|form|link|meta|style)\b[^>]*>/gi, '')
    .replace(/\bon\w+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '')
    .replace(/\bhref\s*=\s*(['"]\s*javascript:[^'"]*['"]|javascript:[^\s>]+)/gi, 'href="#"')
    .replace(/\bsrc\s*=\s*(['"]\s*javascript:[^'"]*['"]|javascript:[^\s>]+)/gi, 'src=""');
};

/**
 * Markdown 解析并全数通过 XSS 过滤器进行安全净化
 */
const getCommentHtml = (contentStr: string) => {
  if (!contentStr) return "";
  try {
    const rawHtml = marked.parse(contentStr) as string;
    return sanitizeCommentHtml(rawHtml);
  } catch (err) {
    return sanitizeCommentHtml(contentStr);
  }
};

/**
 * 极轻量级 UserAgent 友好名称解析器，用于从原始 UA 字符串中提炼出浏览器和操作系统
 */
const parseUA = (ua?: string | null): string => {
  if (!ua) return "未知设备";
  let browser = "Other";
  let os = "Other";
  
  if (ua.includes("Firefox")) browser = "Firefox";
  else if (ua.includes("Chrome")) browser = "Chrome";
  else if (ua.includes("Safari")) browser = "Safari";
  else if (ua.includes("Edge")) browser = "Edge";
  else if (ua.includes("Opera") || ua.includes("OPR")) browser = "Opera";
  
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Macintosh") || ua.includes("Mac OS X")) os = "Mac OS X";
  else if (ua.includes("Linux")) os = "Linux";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  
  return `${browser} · ${os}`;
};

/**
 * IP 地址友好化显示：将 IPv6 本机回环地址转为可读格式
 */
const formatIP = (ip?: string | null): string => {
  if (!ip) return "未知";
  if (ip === "0:0:0:0:0:0:0:1" || ip === "::1") return "127.0.0.1";
  // 如果包含逗号（多级代理），只取第一个
  if (ip.includes(",")) return ip.split(",")[0].trim();
  return ip;
};

/**
 * 解析头像地址，兼容后端返回的相对上传路径
 */
const resolveAvatarUrl = (avatarUrl?: string | null): string => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api";
  const host = apiBase.replace(/\/api$/, "");
  return avatarUrl.startsWith("/") ? `${host}${avatarUrl}` : avatarUrl;
};

/**
 * 站长打勾大V认证徽章组件
 */
const VerifiedBadge = ({ type }: { type: "admin" | "author" }) => {
  const color = type === "admin" ? "#1d9bf0" : "#10b981"; // 蓝色为站长/管理员，绿色为文章作者
  const title = type === "admin" ? "系统认证站长" : "文章作者";
  return (
    <svg 
      viewBox="0 0 24 24" 
      className="w-3.5 h-3.5 shrink-0 inline-block align-middle select-none ml-1" 
      aria-hidden="true" 
      style={{ verticalAlign: 'sub', fill: color }}
    >
      <title>{title}</title>
      <g>
        <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.99-3.818-3.99-.48 0-.94.1-1.348.27C14.825 2.515 13.512 1.5 12 1.5s-2.825 1.015-3.422 2.28c-.407-.17-.867-.27-1.348-.27-2.108 0-3.818 1.78-3.818 3.99 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.58.875 2.95 2.148 3.6-.154.435-.238.905-.238 1.4 0 2.21 1.71 3.99 3.818 3.99.48 0 .94-.1 1.348-.27.597 1.265 1.91 2.27 3.422 2.27s2.825-1.015 3.422-2.27c.407.17.867.27 1.348.27 2.108 0 3.818-1.78 3.818-3.99 0-.495-.084-.965-.238-1.4 1.273-.65 2.148-2.02 2.148-3.6zm-12.72 4.03l-3.85-3.85 1.43-1.4 2.42 2.42 6.25-6.25 1.43 1.42-7.68 7.66z" />
      </g>
    </svg>
  );
};

/**
 * 评论状态 Tab 定义
 */
const STATUS_TABS = [
  { label: "全部", value: "" },
  { label: "待审核", value: "PENDING" },
  { label: "已通过", value: "APPROVED" },
  { label: "垃圾评论", value: "SPAM" },
  { label: "回收站", value: "TRASH" }
];

export default function CommentsPage() {
  // 分页与列表状态
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [size] = useState(10);

  // 检索过滤条件
  const [currentTab, setCurrentTab] = useState("");
  const [keyword, setKeyword] = useState("");
  const [searchVal, setSearchVal] = useState("");

  // 回复 Modal 状态
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [targetComment, setTargetComment] = useState<CommentItem | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);

  // 气泡确认框状态
  const [activeConfirm, setActiveConfirm] = useState<{
    commentId: number;
    type: 'approve' | 'ban' | 'reject' | 'pin' | 'unpin' | 'markAuthor' | 'unmarkAuthor' | 'trash' | 'pending' | 'delete';
  } | null>(null);

  // 监听全局点击以关闭气泡确认框
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".action-popover-container")) {
        return;
      }
      setActiveConfirm(null);
    };
    document.addEventListener("click", handleGlobalClick, true); // 使用捕获阶段以获得最精确的全局判断
    return () => {
      document.removeEventListener("click", handleGlobalClick, true);
    };
  }, []);

  // 状态流转加载状态 (防抖/防重点击)
  const [statusLoadingMap, setStatusLoadingMap] = useState<Record<number, boolean>>({});

  /** 加载评论列表数据 */
  const loadComments = async (pageNum: number, tabStatus: string, searchKey: string) => {
    setLoading(true);
    try {
      const data = await fetchAdminComments({
        page: pageNum,
        size,
        status: tabStatus || undefined,
        keyword: searchKey || undefined
      });
      setComments(data.records || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      console.error("加载评论列表失败:", err);
      toast.error(err.message || "加载评论列表失败");
    } finally {
      setLoading(false);
    }
  };

  // 监听条件触发加载 (Tab/页码/搜索关键词)
  useEffect(() => {
    loadComments(page, currentTab, keyword);
  }, [page, currentTab, keyword]);

  /** 触发搜索查询 */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setKeyword(searchVal.trim());
  };

  /** 清空搜索 */
  const handleClearSearch = () => {
    setSearchVal("");
    setKeyword("");
    setPage(1);
  };

  /** 切换 Tab 页签 */
  const handleTabChange = (status: string) => {
    setCurrentTab(status);
    setPage(1);
  };

  /** 更新评论状态的操作 */
  const handleStatusChange = async (id: number, targetStatus: string) => {
    setStatusLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      await updateCommentStatus(id, targetStatus);
      toast.success("评论状态更新成功");
      loadComments(page, currentTab, keyword);
    } catch (err: any) {
      console.error("更新评论状态失败:", err);
      toast.error(err.message || "状态更新失败");
    } finally {
      setStatusLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  /** 打开回复弹窗 */
  const handleOpenReply = (comment: CommentItem) => {
    setTargetComment(comment);
    setReplyContent("");
    setReplyModalOpen(true);
  };

  /** 提交回复 */
  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetComment) return;
    if (!replyContent.trim()) {
      toast.error("请输入回复内容");
      return;
    }

    setReplySubmitting(true);
    try {
      await replyComment(targetComment.id, replyContent.trim());
      toast.success("回复发表成功");
      setReplyModalOpen(false);
      loadComments(page, currentTab, keyword);
    } catch (err: any) {
      console.error("快捷回复失败:", err);
      toast.error(err.message || "快捷回复失败");
    } finally {
      setReplySubmitting(false);
    }
  };

  /** 确认物理删除评论 */
  const handleDeleteConfirm = async (id: number) => {
    setStatusLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      await deleteComment(id);
      toast.success("该评论已从数据库中彻底物理删除");
      if (comments.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        loadComments(page, currentTab, keyword);
      }
    } catch (err: any) {
      console.error("物理删除评论失败:", err);
      toast.error(err.message || "删除评论失败");
    } finally {
      setStatusLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  /** 标记或取消标记博主作者 */
  const handleMarkAsAuthor = async (id: number) => {
    setStatusLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      await markCommentAsAuthor(id);
      toast.success("作者身份标记状态更新成功");
      loadComments(page, currentTab, keyword);
    } catch (err: any) {
      console.error("更新作者标记失败:", err);
      toast.error(err.message || "更新作者标记失败");
    } finally {
      setStatusLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  /** 确认封禁作者 */
  const handleBanConfirm = async (id: number) => {
    setStatusLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      await banCommentAuthor(id);
      toast.success("该评论作者已成功封禁，历史发言已变更为拒绝状态");
      loadComments(page, currentTab, keyword);
    } catch (err: any) {
      console.error("封禁作者失败:", err);
      toast.error(err.message || "封禁作者失败");
    } finally {
      setStatusLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  /** 切换置顶状态 */
  const handleTogglePin = async (id: number) => {
    setStatusLoadingMap(prev => ({ ...prev, [id]: true }));
    try {
      await togglePinComment(id);
      toast.success("置顶状态已更新");
      loadComments(page, currentTab, keyword);
    } catch (err: any) {
      console.error("切换置顶状态失败:", err);
      toast.error(err.message || "切换置顶状态失败");
    } finally {
      setStatusLoadingMap(prev => ({ ...prev, [id]: false }));
    }
  };

  // 计算总页数
  const totalPages = Math.ceil(total / size) || 1;

  return (
    <div className="space-y-4">
      {/* 头部标题区域 */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200/50 dark:border-zinc-900/60 shrink-0">
        <div>
          <h1 className="font-heading text-xl font-bold text-neutral-dark dark:text-zinc-50">评论管理</h1>
          <p className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500 mt-1 font-mono">
            WORKSPACE / COMMENTS (共 {total} 条评论)
          </p>
        </div>
      </div>

      {/* 紧凑过滤区 (Tab 状态切换 & 模糊搜索) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-900/10 p-2 rounded-xl border border-zinc-200/40 dark:border-zinc-850/50">
        {/* 状态 Tabs */}
        <div className="flex items-center gap-1 select-none overflow-x-auto no-scrollbar">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={cn(
                "h-8 px-3.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap outline-none border-0",
                currentTab === tab.value
                  ? "bg-primary text-white shadow-xs"
                  : "text-zinc-500 dark:text-zinc-450 hover:bg-zinc-150/60 dark:hover:bg-zinc-800/60 hover:text-zinc-800 dark:hover:text-zinc-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 搜索框 */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex h-8 items-center gap-2 rounded-lg border border-zinc-200/65 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-2.5 flex-1 w-full sm:w-60 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search size={13} className="text-zinc-400 shrink-0" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder="搜索发言人、邮箱或评论正文..."
              className="flex-1 border-0 bg-transparent p-0 text-xs text-zinc-850 dark:text-zinc-150 outline-none placeholder-zinc-400 dark:placeholder-zinc-600 focus:ring-0 leading-normal"
            />
            {searchVal && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-zinc-400 hover:text-zinc-650 cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="h-8 px-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            搜索
          </button>
        </form>
      </div>

      {/* 评论列表 - 大卡片流式布局, 高度还原大厂视觉体验 */}
      {loading ? (
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-955 p-16 text-center select-none shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2 text-zinc-400">
            <Loader2 size={18} className="animate-spin text-primary" />
            <span className="text-[11px] font-medium tracking-wide">正在加载评论列表...</span>
          </div>
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-955 p-16 text-center text-zinc-400 select-none shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2">
            <MessageSquare size={20} className="text-zinc-300 dark:text-zinc-800" />
            <span className="text-[11px]">暂无评论数据记录</span>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const isPending = comment.status === "PENDING";
            const isApproved = comment.status === "APPROVED";
            const isSpam = comment.status === "SPAM";
            const isTrash = comment.status === "TRASH";
            const isActionLoading = statusLoadingMap[comment.id] || false;

            return (
              <div
                key={comment.id}
                className="group rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200"
              >
                {/* 顶层：头像、姓名、状态、时间 */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={resolveAvatarUrl(comment.avatarUrl)}
                      alt="avatar"
                      className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800 object-cover transition-all duration-300 group-hover:scale-105 group-hover:ring-2 group-hover:ring-primary/45"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-neutral-dark dark:text-zinc-200 leading-snug flex items-center">
                          <span>{comment.nickname}</span>
                          {comment.isAuthor ? (
                            <VerifiedBadge type="admin" />
                          ) : null}
                        </span>
                        {comment.replyTo && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-450 dark:text-zinc-500 bg-zinc-105/60 dark:bg-zinc-900 border border-zinc-200/30 dark:border-zinc-850 px-1.5 py-0.5 rounded leading-none select-none">
                            回复 @{comment.replyTo}
                          </span>
                        )}
                        {comment.visitorWebsite && (
                          <a
                            href={comment.visitorWebsite}
                            target="_blank"
                            rel="noreferrer"
                            className="w-4 h-4 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-primary transition-colors cursor-pointer"
                            title="访问访客网站"
                          >
                            <Globe size={11} />
                          </a>
                        )}
                      </div>
                      
                      {/* 设备、IP、邮箱元数据信息 */}
                      <div className="flex flex-wrap items-center gap-3.5 mt-1.5 text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
                        {comment.ipAddress && (
                          <span className="flex items-center gap-1" title="评论者 IP">
                            <Globe size={11} className="text-zinc-450 shrink-0" />
                            <span>{formatIP(comment.ipAddress)}</span>
                          </span>
                        )}
                        {comment.visitorEmail && (
                          <span className="flex items-center gap-1" title="访客电子邮箱">
                            <Mail size={11} className="text-zinc-450 shrink-0" />
                            <a href={`mailto:${comment.visitorEmail}`} className="hover:text-primary hover:underline">{comment.visitorEmail}</a>
                          </span>
                        )}
                        {comment.userAgent && (
                          <span className="flex items-center gap-1" title="浏览器 User Agent">
                            <Laptop size={11} className="text-zinc-455 shrink-0" />
                            <span>{parseUA(comment.userAgent)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* 右上侧：状态 Badge 与创建时间 */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0 select-none">
                    {comment.isPinned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold leading-none bg-violet-50 text-violet-600 border border-violet-200/40 dark:bg-violet-955/15 dark:text-violet-400 dark:border-violet-900/30">
                        置顶
                      </span>
                    )}
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold leading-none border",
                        isApproved && "bg-emerald-50 text-emerald-600 border-emerald-200/40 dark:bg-emerald-955/15 dark:text-emerald-400 dark:border-emerald-900/30",
                        isPending && "bg-amber-50 text-amber-600 border-amber-200/40 dark:bg-amber-955/15 dark:text-amber-400 dark:border-amber-900/30",
                        isSpam && "bg-red-50 text-red-600 border-red-200/40 dark:bg-red-950/15 dark:text-red-400 dark:border-red-900/30",
                        isTrash && "bg-zinc-100 text-zinc-500 border-zinc-200/40 dark:bg-zinc-850 dark:text-zinc-400 dark:border-zinc-800"
                      )}
                    >
                      {isApproved && "已发布"}
                      {isPending && "待审核"}
                      {isSpam && "垃圾/拒绝"}
                      {isTrash && "回收站"}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                      {new Date(comment.createdAt).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit"
                      })}
                    </span>
                  </div>
                </div>

                {/* 评论 Markdown 内容 */}
                <div className="mt-3.5 pl-0 pr-1">
                  <div 
                    className="comment-content-prose max-h-48 overflow-y-auto custom-scrollbar pr-1 break-words leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{ __html: getCommentHtml(comment.content) }}
                  />
                </div>

                {/* 归属文章 / 手记条状卡片 */}
                {comment.articleTitle ? (
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50/50 dark:bg-zinc-900/15 px-3.5 py-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span className="bg-primary/10 text-primary dark:bg-primary/20 dark:text-[#b0a2ff] px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 select-none">
                        <FileText size={10} />
                        <span>文章</span>
                      </span>
                      <span className="font-semibold">{comment.articleTitle}</span>
                    </div>
                    {comment.articleSlug && (
                      <a
                        href={`/articles/${comment.articleId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 font-mono font-bold text-primary hover:underline text-[10px]"
                      >
                        <span>详情</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                ) : comment.noteTitle ? (
                  <div className="mt-4 flex items-center justify-between rounded-lg bg-zinc-50/50 dark:bg-zinc-900/15 px-3.5 py-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                      <span className="bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 select-none">
                        <FileText size={10} />
                        <span>手记</span>
                      </span>
                      <span className="font-semibold">{comment.noteTitle}</span>
                    </div>
                  </div>
                ) : null}

                {/* 底栏操作项 */}
                <div className="mt-3.5 pt-0 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
                  <div className="flex items-center gap-5">
                    {/* 回复 */}
                    {!isTrash && !isSpam && (
                      <button
                        onClick={() => handleOpenReply(comment)}
                        className="flex items-center gap-1.5 text-blue-400/80 hover:text-blue-500 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                      >
                        <Reply size={13} />
                        <span>回复</span>
                      </button>
                    )}

                    {/* 通过 */}
                    {isPending && (
                      <div className="relative inline-block action-popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveConfirm({ commentId: comment.id, type: "approve" });
                          }}
                          className="flex items-center gap-1.5 text-emerald-400/80 hover:text-emerald-500 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                        >
                          <Check size={13} />
                          <span>通过</span>
                        </button>
                        {activeConfirm?.commentId === comment.id && activeConfirm?.type === "approve" && (
                          <ConfirmPopover 
                            title="确定通过这条评论吗？"
                            onConfirm={() => handleStatusChange(comment.id, "APPROVED")}
                            onCancel={() => setActiveConfirm(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* 封禁 */}
                    {!isTrash && !isSpam && (
                      <div className="relative inline-block action-popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveConfirm({ commentId: comment.id, type: "ban" });
                          }}
                          className="flex items-center gap-1.5 text-red-400/70 hover:text-red-500 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                        >
                          <Ban size={13} />
                          <span>封禁</span>
                        </button>
                        {activeConfirm?.commentId === comment.id && activeConfirm?.type === "ban" && (
                          <ConfirmPopover 
                            title="确定封禁该评论的作者吗？"
                            description="封禁后将不再接受同一用户或邮箱地址的后续评论，并关联历史评论全部拒绝"
                            onConfirm={() => handleBanConfirm(comment.id)}
                            onCancel={() => setActiveConfirm(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* 拒绝 */}
                    {(isPending || isApproved) && (
                      <div className="relative inline-block action-popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveConfirm({ commentId: comment.id, type: "reject" });
                          }}
                          className="flex items-center gap-1.5 text-amber-400/80 hover:text-amber-500 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                        >
                          <ShieldAlert size={13} />
                          <span>拒绝</span>
                        </button>
                        {activeConfirm?.commentId === comment.id && activeConfirm?.type === "reject" && (
                          <ConfirmPopover 
                            title="确定拒绝这条评论吗？"
                            onConfirm={() => handleStatusChange(comment.id, "SPAM")}
                            onCancel={() => setActiveConfirm(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* 置顶 */}
                    {!comment.parentId && !isTrash && !isSpam && (
                      <div className="relative inline-block action-popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveConfirm({ commentId: comment.id, type: comment.isPinned ? "unpin" : "pin" });
                          }}
                          className={cn(
                            "flex items-center gap-1.5 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium",
                            comment.isPinned ? "text-violet-500 hover:text-violet-600" : "text-violet-400/80 hover:text-violet-500"
                          )}
                        >
                          <ArrowUp size={13} className={cn(comment.isPinned && "stroke-[2.5px]")} />
                          <span>{comment.isPinned ? "取消置顶" : "置顶"}</span>
                        </button>
                        {activeConfirm?.commentId === comment.id && (activeConfirm?.type === "pin" || activeConfirm?.type === "unpin") && (
                          <ConfirmPopover 
                            title={comment.isPinned ? "确定取消置顶这条评论吗？" : "确定置顶这条评论吗？"}
                            onConfirm={() => handleTogglePin(comment.id)}
                            onCancel={() => setActiveConfirm(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* 标记/取消标记作者 (仅针对普通游客评论提供此功能) */}
                    {!comment.userId && !isTrash && !isSpam && (
                      <div className="relative inline-block action-popover-container">
                        {comment.isAuthor ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveConfirm({ commentId: comment.id, type: "unmarkAuthor" });
                            }}
                            className="flex items-center gap-1.5 text-indigo-400/80 hover:text-indigo-500 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                          >
                            <User size={13} />
                            <span>取消作者标记</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveConfirm({ commentId: comment.id, type: "markAuthor" });
                            }}
                            className="flex items-center gap-1.5 text-indigo-400/80 hover:text-indigo-500 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                          >
                            <User size={13} />
                            <span>标记为作者</span>
                          </button>
                        )}
                        {activeConfirm?.commentId === comment.id && (activeConfirm?.type === "markAuthor" || activeConfirm?.type === "unmarkAuthor") && (
                          <ConfirmPopover 
                            title={comment.isAuthor ? "确定取消该评论的作者标记吗？" : "确定将该评论标记为作者发表吗？"}
                            onConfirm={() => handleMarkAsAuthor(comment.id)}
                            onCancel={() => setActiveConfirm(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* 移至回收站 */}
                    {!isTrash ? (
                      <div className="relative inline-block action-popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveConfirm({ commentId: comment.id, type: "trash" });
                          }}
                          className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                        >
                          <Trash size={13} />
                          <span>移至回收站</span>
                        </button>
                        {activeConfirm?.commentId === comment.id && activeConfirm?.type === "trash" && (
                          <ConfirmPopover 
                            title="确定将这条评论移至回收站吗？"
                            onConfirm={() => handleStatusChange(comment.id, "TRASH")}
                            onCancel={() => setActiveConfirm(null)}
                          />
                        )}
                      </div>
                    ) : (
                      // 恢复为待审核
                      <div className="relative inline-block action-popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveConfirm({ commentId: comment.id, type: "pending" });
                          }}
                          className="flex items-center gap-1.5 text-sky-400/80 hover:text-sky-500 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                        >
                          <RotateCcw size={13} />
                          <span>还原为待审核</span>
                        </button>
                        {activeConfirm?.commentId === comment.id && activeConfirm?.type === "pending" && (
                          <ConfirmPopover 
                            title="确定将这条评论还原为待审核吗？"
                            onConfirm={() => handleStatusChange(comment.id, "PENDING")}
                            onCancel={() => setActiveConfirm(null)}
                          />
                        )}
                      </div>
                    )}

                    {/* 彻底删除 */}
                    {(isSpam || isTrash) && (
                      <div className="relative inline-block action-popover-container">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveConfirm({ commentId: comment.id, type: "delete" });
                          }}
                          className="flex items-center gap-1.5 text-rose-400/80 hover:text-rose-500 transition-colors cursor-pointer outline-none border-0 bg-transparent font-medium"
                        >
                          <Trash2 size={13} />
                          <span>删除</span>
                        </button>
                        {activeConfirm?.commentId === comment.id && activeConfirm?.type === "delete" && (
                          <ConfirmPopover 
                            title="确定要彻底删除这条评论吗？"
                            description="此操作属于敏感的不可逆行为，数据一旦丢失将永久无法恢复"
                            onConfirm={() => handleDeleteConfirm(comment.id)}
                            onCancel={() => setActiveConfirm(null)}
                          />
                        )}
                      </div>
                    )}
                  </div>

                  {isActionLoading && (
                    <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px]">
                      <Loader2 size={11} className="animate-spin text-primary" />
                      <span>正在处理中...</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分页控制区 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 select-none">
          <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
            SHOWING PAGE {page} OF {totalPages} (TOTAL {total} RECORDS)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => p - 1)}
              className="h-7 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer outline-none"
            >
              上一页
            </button>
            <span className="text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300 px-2 select-none">
              {page}
            </span>
            <button
              disabled={page >= totalPages || loading}
              onClick={() => setPage(p => p + 1)}
              className="h-7 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-655 dark:text-zinc-355 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer outline-none"
            >
              下一页
            </button>
          </div>
        </div>
      )}

      {/* 管理员快捷回复 Modal */}
      {replyModalOpen && targetComment && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center select-none">
            {/* 遮罩 */}
            <div
              className="absolute inset-0 bg-zinc-955/45 backdrop-blur-xs animate-fade-in"
              onClick={() => !replySubmitting && setReplyModalOpen(false)}
            />

            {/* 弹窗面板 */}
            <div className="relative z-10 w-full max-w-md mx-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 shadow-xl animate-slide-up">
              <div className="p-6">
                <div className="flex items-center justify-between pb-3">
                  <h3 className="font-heading text-base font-bold text-neutral-dark dark:text-zinc-150 flex items-center gap-1.5">
                    <Reply size={16} className="text-primary" />
                    <span>快捷回复评论</span>
                  </h3>
                  <button
                    disabled={replySubmitting}
                    onClick={() => setReplyModalOpen(false)}
                    className="p-1 rounded-md text-zinc-400 hover:text-zinc-655 dark:hover:text-zinc-200 transition-colors cursor-pointer border-0 bg-transparent"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleReplySubmit} className="mt-4 space-y-4">
                  {/* 原评论预览 - Markdown 渲染 */}
                  <div className="rounded-xl bg-zinc-50/80 dark:bg-zinc-955/40 p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                      <span>评论人: {targetComment.nickname}</span>
                      <span>•</span>
                      <span>{new Date(targetComment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div 
                      className="comment-content-prose max-h-24 overflow-y-auto custom-scrollbar pr-1 break-words text-xs leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: getCommentHtml(targetComment.content) }}
                    />
                  </div>

                  {/* 回复内容框 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-wider">
                      我的回复内容 (支持 Markdown)
                    </label>
                    <textarea
                      disabled={replySubmitting}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="输入对该评论的回复内容，支持换行与 Markdown..."
                      rows={4}
                      className="w-full rounded-xl border border-zinc-250/85 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-800 dark:text-zinc-100 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none leading-relaxed"
                    />
                  </div>

                  {/* 底栏按钮 */}
                  <div className="flex items-center gap-3 pt-3">
                    <button
                      type="button"
                      disabled={replySubmitting}
                      onClick={() => setReplyModalOpen(false)}
                      className="flex-1 h-9 rounded-xl border border-zinc-200 dark:border-zinc-855 text-xs font-bold text-zinc-650 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                    >
                      取消
                    </button>
                    <button
                      type="submit"
                      disabled={replySubmitting}
                      className="flex-1 h-9 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {replySubmitting && <Loader2 size={13} className="animate-spin" />}
                      <span>发布回复</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </Portal>
      )}

    </div>
  );
}

/**
 * 评论管理气泡悬浮确认框组件 (Popover)
 */
interface ConfirmPopoverProps {
  title: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmPopover = ({ title, description, onConfirm, onCancel }: ConfirmPopoverProps) => {
  return (
    <div 
      className="absolute bottom-[calc(100%+10px)] left-[-12px] z-50 w-60 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 p-3.5 rounded-xl shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 cursor-default"
      onClick={(e) => e.stopPropagation()}
    >
      {/* 45度旋转的小正方形作为气泡三角，指向按钮图标 */}
      <div className="absolute -bottom-1.5 left-5 w-2.5 h-2.5 bg-white dark:bg-zinc-900 border-r border-b border-zinc-200 dark:border-zinc-850 rotate-45"></div>
      
      {/* 警告图标与标题描述 */}
      <div className="flex gap-2 items-start">
        {/* 黄色警告三角形 SVG */}
        <svg 
          viewBox="0 0 24 24" 
          className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-zinc-800 dark:text-zinc-200 text-xs font-bold leading-normal">{title}</span>
          {description && (
            <span className="text-[10px] text-zinc-400 dark:text-zinc-550 leading-normal">{description}</span>
          )}
        </div>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex justify-end gap-1.5 text-[11px] font-medium select-none mt-0.5">
        <button
          type="button"
          onClick={onCancel}
          className="px-2.5 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-600 dark:text-zinc-450 rounded-md transition-colors cursor-pointer"
        >
          取消
        </button>
        <button
          type="button"
          onClick={() => {
            onConfirm();
            onCancel();
          }}
          className="px-2.5 py-1 bg-[#8247e5] hover:bg-[#723fd3] text-white rounded-md transition-colors cursor-pointer"
        >
          确认
        </button>
      </div>
    </div>
  );
};
