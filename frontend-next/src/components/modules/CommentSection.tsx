"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, CornerDownRight, Send, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { commentService } from "@/services";
import { CommentVO, CommentCreateDTO } from "@/types/comment";
import { Badge } from "@/components/ui/Badge";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";

export interface CommentSectionProps {
  /** 文章 ID (用于文章详情页评论) */
  articleId?: number;
  /** 手记 ID (用于手记详情页评论) */
  noteId?: number;
  /** 目标类型：'article'（文章）| 'note'（手记），默认自动推断 */
  targetType?: "article" | "note";
}

interface VisitorData {
  visitorName: string;
  visitorEmail: string;
  visitorWebsite: string;
}

interface CommentInputFormProps {
  targetId: number;
  targetType: "article" | "note";
  parentId: number | null;
  replyTarget?: CommentVO | null;
  visitorData: VisitorData;
  onVisitorChange: (data: VisitorData) => void;
  onSuccess: (newComment: CommentVO) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

/**
 * 统一样式与交互的评论输入表单组件
 * 支持一级独立发表，以及楼层下就地内嵌回复
 */
function CommentInputForm({
  targetId,
  targetType,
  parentId,
  replyTarget,
  visitorData,
  onVisitorChange,
  onSuccess,
  onCancel,
  autoFocus = false,
}: CommentInputFormProps) {
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { playDroplet, playTick } = useSound();

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorData.visitorName.trim() || !visitorData.visitorEmail.trim() || !content.trim()) {
      setStatusMessage({ type: "error", text: "请填写称呼、邮箱与内容" });
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage(null);
      const payload: CommentCreateDTO = {
        ...visitorData,
        content,
        parentId,
      };

      const newComment =
        targetType === "note"
          ? await commentService.createNoteComment(targetId, payload)
          : await commentService.createComment(targetId, payload);
      playDroplet();

      // 缓存游客信息供下次快速调用
      try {
        localStorage.setItem("comment_visitor_name", visitorData.visitorName.trim());
        localStorage.setItem("comment_visitor_email", visitorData.visitorEmail.trim());
        localStorage.setItem("comment_visitor_website", visitorData.visitorWebsite.trim());
      } catch {
        // 容错
      }

      setContent("");
      setStatusMessage({ type: "success", text: parentId ? "回复提交成功！" : "评论提交成功！" });
      onSuccess(newComment);
    } catch {
      setStatusMessage({ type: "error", text: "提交失败，请稍后重试" });
    } finally {
      setSubmitting(false);
    }
  };

  const isContentTyped = content.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {replyTarget && (
        <div className="flex items-center justify-between bg-[#BBDFFF]/30 dark:bg-[#BBDFFF]/15 border border-[#BBDFFF]/40 px-3.5 py-1.5 rounded-xl text-xs text-gray-900 dark:text-[#BBDFFF]">
          <span>回复 @{replyTarget.nickname}：</span>
          {onCancel && (
            <button
              type="button"
              onClick={() => {
                playTick();
                onCancel();
              }}
              className="text-xs font-medium underline hover:opacity-75 transition-opacity cursor-pointer"
            >
              取消回复
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <input
          type="text"
          required
          placeholder="昵称 *"
          value={visitorData.visitorName}
          onChange={(e) => onVisitorChange({ ...visitorData, visitorName: e.target.value })}
          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-100 focus:bg-gray-200/60 dark:bg-gray-850/70 dark:hover:bg-gray-850 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:outline-none ring-0 focus:ring-0 transition-colors"
        />
        <input
          type="email"
          required
          placeholder="邮箱 (不公开，用于头像) *"
          value={visitorData.visitorEmail}
          onChange={(e) => onVisitorChange({ ...visitorData, visitorEmail: e.target.value })}
          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-100 focus:bg-gray-200/60 dark:bg-gray-850/70 dark:hover:bg-gray-850 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:outline-none ring-0 focus:ring-0 transition-colors"
        />
        <input
          type="url"
          placeholder="个人主页 (选填)"
          value={visitorData.visitorWebsite}
          onChange={(e) => onVisitorChange({ ...visitorData, visitorWebsite: e.target.value })}
          className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-100 focus:bg-gray-200/60 dark:bg-gray-850/70 dark:hover:bg-gray-850 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:outline-none ring-0 focus:ring-0 transition-colors"
        />
      </div>

      {/* 相对定位容器：textarea 与固定在右下角的发送按钮 */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          required
          rows={parentId ? 2 : 3}
          placeholder={replyTarget ? `在此写下对 @${replyTarget.nickname} 的回复...` : "写下你的想法，支持 Markdown 语法..."}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full text-xs px-3.5 pt-3 pb-11 rounded-xl bg-gray-100/80 hover:bg-gray-100 focus:bg-gray-200/60 dark:bg-gray-850/70 dark:hover:bg-gray-850 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:outline-none ring-0 focus:ring-0 transition-colors resize-y min-h-[86px]"
        />

        {/* 固定在 textarea 右下角的发送按钮（输入内容后高亮 #BBDFFF 天蓝色） */}
        <div className="absolute right-2.5 bottom-2.5 z-10">
          <button
            type="submit"
            disabled={submitting}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 shadow-xs ${
              isContentTyped
                ? "bg-[#BBDFFF] hover:bg-[#a6d5fc] text-gray-950 shadow-[#BBDFFF]/30 active:scale-95 cursor-pointer"
                : "bg-gray-200/80 text-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-not-allowed"
            } ${submitting ? "opacity-60 cursor-wait" : ""}`}
          >
            <Send className={`w-3.5 h-3.5 ${isContentTyped ? "text-gray-950" : "text-gray-400 dark:text-gray-500"}`} />
            <span>{submitting ? "提交中..." : parentId ? "回复" : "发表评论"}</span>
          </button>
        </div>
      </div>

      {/* 状态提示信息 */}
      <AnimatePresence mode="wait">
        {statusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className={`inline-flex items-center gap-1.5 text-xs font-medium pt-0.5 ${
              statusMessage.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{statusMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

export function CommentSection({ articleId, noteId, targetType }: CommentSectionProps) {
  const effectiveType: "article" | "note" = targetType || (noteId !== undefined ? "note" : "article");
  const targetId = effectiveType === "note" ? (noteId ?? articleId ?? 0) : (articleId ?? noteId ?? 0);

  const [comments, setComments] = useState<CommentVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [replyTarget, setReplyTarget] = useState<CommentVO | null>(null);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});

  const [visitorData, setVisitorData] = useState<VisitorData>({
    visitorName: "",
    visitorEmail: "",
    visitorWebsite: "",
  });

  const { playSparkle, playTick } = useSound();

  // 初始化拉取评论并回显游客缓存信息
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("comment_visitor_name") || "";
      const savedEmail = localStorage.getItem("comment_visitor_email") || "";
      const savedWebsite = localStorage.getItem("comment_visitor_website") || "";
      if (savedName || savedEmail || savedWebsite) {
        setVisitorData({
          visitorName: savedName,
          visitorEmail: savedEmail,
          visitorWebsite: savedWebsite,
        });
      }
    } catch {
      // 容错
    }

    async function load() {
      try {
        setLoading(true);
        const list =
          effectiveType === "note"
            ? await commentService.getNoteComments(targetId)
            : await commentService.getComments(targetId);
        setComments(list);
        const counts: Record<number, number> = {};
        const collectCounts = (items: CommentVO[]) => {
          items.forEach((c) => {
            counts[c.id] = c.likeCount || 0;
            if (c.replies?.length) collectCounts(c.replies);
          });
        };
        collectCounts(list);
        setLikeCounts(counts);
      } catch (err) {
        console.error("加载评论失败", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [targetId, effectiveType]);

  const handleLike = async (commentId: number) => {
    if (likedMap[commentId]) return;
    playSparkle();
    setLikedMap((prev) => ({ ...prev, [commentId]: true }));
    setLikeCounts((prev) => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
    try {
      await commentService.likeComment(commentId);
    } catch {
      // 容错
    }
  };

  // 递归插入新回复到对应楼层
  const handleReplySuccess = (parentId: number, newComment: CommentVO) => {
    const insertReply = (list: CommentVO[]): CommentVO[] => {
      return list.map((c) => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newComment],
          };
        }
        if (c.replies && c.replies.length > 0) {
          return {
            ...c,
            replies: insertReply(c.replies),
          };
        }
        return c;
      });
    };
    setComments((prev) => insertReply(prev));
    setReplyTarget(null);
  };

  const renderComment = (item: CommentVO, isChild = false) => {
    const avatarLetter = (item.nickname || "V").slice(0, 1).toUpperCase();
    const isLiked = likedMap[item.id];
    const likes = likeCounts[item.id] ?? (item.likeCount || 0);
    const isReplyingThis = replyTarget?.id === item.id;

    return (
      <div
        key={item.id}
        className={`relative flex flex-col gap-2 rounded-xl transition-all duration-200 ${
          isReplyingThis
            ? "bg-[#BBDFFF]/15 dark:bg-[#BBDFFF]/10 ring-1 ring-[#BBDFFF]/40 p-3.5 my-2"
            : isChild
            ? "ml-6 sm:ml-8 mt-2 p-3.5 bg-gray-100/70 dark:bg-gray-850/60"
            : "p-3.5 bg-gray-100/40 hover:bg-gray-100/70 dark:bg-gray-900/40 dark:hover:bg-gray-900/70 my-2"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {item.avatarUrl ? (
              <img
                src={item.avatarUrl}
                alt={item.nickname}
                className="w-7 h-7 rounded-full object-cover shadow-xs"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-[#BBDFFF] to-[#80bdfe] text-gray-900 font-mono text-xs flex items-center justify-center font-bold shadow-xs">
                {avatarLetter}
              </div>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              <div className="inline-flex items-center">
                {item.visitorWebsite ? (
                  <a
                    href={item.visitorWebsite}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-xs text-gray-900 dark:text-gray-100 hover:text-sky-500 underline decoration-gray-300 underline-offset-2 transition-colors"
                  >
                    {item.nickname}
                  </a>
                ) : (
                  <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                    {item.nickname}
                  </span>
                )}
                {item.isAuthor && <VerifiedBadge type="admin" />}
              </div>
              {item.isPinned && <Badge tone="emerald">置顶</Badge>}
              {item.replyTo && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  回复 <span className="font-medium text-sky-600 dark:text-[#BBDFFF]">@{item.replyTo}</span>
                </span>
              )}
            </div>
          </div>
          <span className="text-xs text-gray-600 dark:text-gray-400 font-mono">
            {formatDate(item.createdAt)}
          </span>
        </div>

        <div className="text-[13px] text-gray-900 dark:text-gray-100 leading-relaxed break-words pl-9.5">
          {item.content}
        </div>

        {/* 卡片底部操作栏 */}
        <div className="flex items-center justify-end gap-3 pl-9.5 pt-1 text-xs text-gray-700 dark:text-gray-300">
          <button
            onClick={() => handleLike(item.id)}
            className={`inline-flex items-center gap-1.5 transition-colors hover:text-rose-600 cursor-pointer ${
              isLiked ? "text-rose-600 dark:text-rose-400 font-medium" : ""
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
            <span>{likes > 0 ? likes : "点赞"}</span>
          </button>

          {/* 回复 / 取消回复切换按钮 */}
          <button
            onClick={() => {
              playTick();
              if (isReplyingThis) {
                setReplyTarget(null);
              } else {
                setReplyTarget(item);
              }
            }}
            className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              isReplyingThis
                ? "text-sky-600 dark:text-[#BBDFFF] font-semibold"
                : "hover:text-gray-950 dark:hover:text-white"
            }`}
          >
            <CornerDownRight className={`w-3.5 h-3.5 ${isReplyingThis ? "text-[#0ea5e9] dark:text-[#BBDFFF]" : ""}`} />
            <span>{isReplyingThis ? "取消回复" : "回复"}</span>
          </button>
        </div>

        {/* 就地嵌入式回复表单（点击回复时在当前评论正下方直接平滑滑出展开） */}
        <AnimatePresence>
          {isReplyingThis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className="overflow-hidden mt-2 pt-2 border-t border-gray-200/60 dark:border-gray-800/60"
            >
              <CommentInputForm
                targetId={targetId}
                targetType={effectiveType}
                parentId={item.id}
                replyTarget={item}
                visitorData={visitorData}
                onVisitorChange={setVisitorData}
                onCancel={() => setReplyTarget(null)}
                onSuccess={(newComment) => handleReplySuccess(item.id, newComment)}
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 递归渲染子回复 */}
        {item.replies && item.replies.length > 0 && (
          <div className="flex flex-col mt-1">
            {item.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="mt-12 pt-4">
      {/* 区域 1 顶部标题栏与表单折叠切换器 */}
      <div className="flex items-center justify-between py-2.5">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-700 dark:text-gray-300" />
          <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            读者见解 / Discussions
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-mono font-medium">
            {comments.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            playTick();
            setIsFormExpanded(!isFormExpanded);
          }}
          className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors cursor-pointer"
          aria-expanded={isFormExpanded}
        >
          <span className="font-mono">{isFormExpanded ? "收起" : "参与讨论"}</span>
          {isFormExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 区域 1：一级发表评论表单（默认收起，点击平滑展开） */}
      <AnimatePresence initial={false}>
        {isFormExpanded && (
          <motion.div
            key="comment-form-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden pt-3 pb-5"
          >
            <CommentInputForm
              targetId={targetId}
              targetType={effectiveType}
              parentId={null}
              visitorData={visitorData}
              onVisitorChange={setVisitorData}
              onSuccess={(newComment) => {
                setComments((prev) => [newComment, ...prev]);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 区域 2：评论展示列表（常驻展示，不收起） */}
      <div className="mt-2">
        {loading ? (
          <div className="py-8 text-center text-xs text-gray-600 font-mono">加载讨论中...</div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-600 font-mono">暂无见解，欢迎抢先沙发留念 ☕️</div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {comments.map((c) => renderComment(c))}
          </div>
        )}
      </div>
    </section>
  );
}
