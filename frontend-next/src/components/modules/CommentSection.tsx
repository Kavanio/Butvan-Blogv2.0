"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Heart, CornerDownRight, Send, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { commentService } from "@/services";
import { CommentVO, CommentCreateDTO } from "@/types/comment";
import { Badge } from "@/components/ui/Badge";
import { useSound } from "@/hooks/useSound";
import { formatDate } from "@/utils/date";

interface CommentSectionProps {
  articleId: number;
}

export function CommentSection({ articleId }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentVO[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormExpanded, setIsFormExpanded] = useState(false);
  const [replyTarget, setReplyTarget] = useState<CommentVO | null>(null);
  const [likedMap, setLikedMap] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState<CommentCreateDTO>({
    visitorName: "",
    visitorEmail: "",
    visitorWebsite: "",
    content: "",
    parentId: null,
  });

  const { playDroplet, playSparkle, playTick } = useSound();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await commentService.getComments(articleId);
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
  }, [articleId]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitorName.trim() || !formData.visitorEmail.trim() || !formData.content.trim()) {
      setStatusMessage({ type: "error", text: "请填写称呼、邮箱与评论内容" });
      return;
    }

    try {
      setSubmitting(true);
      setStatusMessage(null);
      const payload: CommentCreateDTO = {
        ...formData,
        parentId: replyTarget ? replyTarget.id : null,
      };

      const newComment = await commentService.createComment(articleId, payload);
      playDroplet();

      // 将新评论加入列表
      if (replyTarget) {
        setComments((prev) =>
          prev.map((c) => {
            if (c.id === replyTarget.id) {
              return {
                ...c,
                replies: [...(c.replies || []), newComment],
              };
            }
            return c;
          })
        );
      } else {
        setComments((prev) => [newComment, ...prev]);
      }

      setFormData({
        visitorName: formData.visitorName,
        visitorEmail: formData.visitorEmail,
        visitorWebsite: formData.visitorWebsite,
        content: "",
        parentId: null,
      });
      setReplyTarget(null);
      setStatusMessage({ type: "success", text: "评论提交成功！" });
    } catch {
      setStatusMessage({ type: "error", text: "提交失败，请稍后重试" });
    } finally {
      setSubmitting(false);
    }
  };

  const renderComment = (item: CommentVO, isChild = false) => {
    const avatarLetter = (item.nickname || "V").slice(0, 1).toUpperCase();
    const isLiked = likedMap[item.id];
    const likes = likeCounts[item.id] ?? (item.likeCount || 0);

    return (
      <div
        key={item.id}
        className={`group relative flex flex-col gap-2 rounded-xl transition-colors ${
          isChild
            ? "ml-6 sm:ml-8 mt-2 p-3.5 rounded-xl bg-gray-100/70 dark:bg-gray-850/60"
            : "p-3.5 rounded-xl bg-gray-100/40 hover:bg-gray-100/70 dark:bg-gray-900/40 dark:hover:bg-gray-900/70 my-2"
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
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-pink-500 to-rose-600 text-white font-mono text-xs flex items-center justify-center font-bold shadow-xs">
                {avatarLetter}
              </div>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.visitorWebsite ? (
                <a
                  href={item.visitorWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-xs text-gray-900 dark:text-gray-100 hover:text-pink-600 underline decoration-gray-300 underline-offset-2 transition-colors"
                >
                  {item.nickname}
                </a>
              ) : (
                <span className="font-semibold text-xs text-gray-900 dark:text-gray-100">
                  {item.nickname}
                </span>
              )}
              {item.isAuthor && <Badge tone="pink">博主</Badge>}
              {item.isPinned && <Badge tone="emerald">置顶</Badge>}
              {item.replyTo && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  回复 <span className="font-medium text-pink-600 dark:text-pink-400">@{item.replyTo}</span>
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

          <button
            onClick={() => {
              playTick();
              setReplyTarget(item);
              setIsFormExpanded(true);
            }}
            className="inline-flex items-center gap-1.5 hover:text-gray-950 dark:hover:text-white transition-colors cursor-pointer"
          >
            <CornerDownRight className="w-3.5 h-3.5" />
            <span>回复</span>
          </button>
        </div>

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

      {/* 区域 1：输入发表表单（默认收起，点击平滑展开） */}
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
            <form onSubmit={handleSubmit} className="space-y-3">
              {replyTarget && (
                <div className="flex items-center justify-between bg-pink-50 dark:bg-pink-950/40 px-3.5 py-2 rounded-xl text-xs text-pink-700 dark:text-pink-300">
                  <span>回复 @{replyTarget.nickname}：</span>
                  <button
                    type="button"
                    onClick={() => setReplyTarget(null)}
                    className="text-xs font-medium underline hover:text-pink-900 dark:hover:text-pink-200 cursor-pointer"
                  >
                    取消回复
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <input
                  type="text"
                  required
                  placeholder="昵称 *"
                  value={formData.visitorName}
                  onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-100 focus:bg-gray-200/60 dark:bg-gray-850/70 dark:hover:bg-gray-850 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:outline-none ring-0 focus:ring-0 transition-colors"
                />
                <input
                  type="email"
                  required
                  placeholder="邮箱 (不公开，用于头像) *"
                  value={formData.visitorEmail}
                  onChange={(e) => setFormData({ ...formData, visitorEmail: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-100 focus:bg-gray-200/60 dark:bg-gray-850/70 dark:hover:bg-gray-850 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:outline-none ring-0 focus:ring-0 transition-colors"
                />
                <input
                  type="url"
                  placeholder="个人主页 (选填)"
                  value={formData.visitorWebsite}
                  onChange={(e) => setFormData({ ...formData, visitorWebsite: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-gray-100/80 hover:bg-gray-100 focus:bg-gray-200/60 dark:bg-gray-850/70 dark:hover:bg-gray-850 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:outline-none ring-0 focus:ring-0 transition-colors"
                />
              </div>

              {/* 相对定位容器：textarea 与固定在右下角的发送按钮 */}
              <div className="relative">
                <textarea
                  required
                  rows={3}
                  placeholder="写下你的想法，支持 Markdown 语法..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full text-xs px-3.5 pt-3 pb-11 rounded-xl bg-gray-100/80 hover:bg-gray-100 focus:bg-gray-200/60 dark:bg-gray-850/70 dark:hover:bg-gray-850 dark:focus:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 border-none outline-none focus:outline-none ring-0 focus:ring-0 transition-colors resize-y min-h-[96px]"
                />

                {/* 固定在 textarea 右下角的发送按钮 */}
                <div className="absolute right-2.5 bottom-2.5 z-10">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-xs font-medium active:scale-95 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? "提交中..." : "发表评论"}</span>
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
