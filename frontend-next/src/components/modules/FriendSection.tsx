"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Plus,
  Check,
  Sparkles,
  Loader2,
  Globe,
  SlidersHorizontal,
  AlertCircle,
} from "lucide-react";
import { FriendLinkVO, FriendLinkApplyDTO } from "@/types/friend";
import { SpringModal } from "@/components/ui/SpringModal";
import { friendService } from "@/services";
import { useSound } from "@/hooks/useSound";

interface FriendSectionProps {
  friends: FriendLinkVO[];
}

export function FriendSection({ friends }: FriendSectionProps) {
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { playTick, playBloom, playSuccess, playDroplet } = useSound();

  // 申请表单状态 (分类默认为 TECH，完全对齐后端校验)
  const [form, setForm] = useState<FriendLinkApplyDTO>({
    name: "",
    url: "",
    avatarUrl: "",
    description: "",
    email: "",
    category: "TECH",
  });

  const emailInputRef = useRef<HTMLInputElement>(null);
  const [isFetchingMeta, setIsFetchingMeta] = useState(false);
  const [metaFetched, setMetaFetched] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showCustomFields, setShowCustomFields] = useState(false);

  const handleOpenApply = () => {
    playBloom();
    setIsApplyOpen(true);
    setMetaError(null);
    setSubmitError(null);
  };

  /**
   * 自动从 URL 解析网站元数据（对齐旧前端，自动填入 title, description, favicon）
   */
  const handleFetchMeta = async (overrideUrl?: string) => {
    const rawUrl = (overrideUrl ?? form.url).trim();
    if (!rawUrl) {
      setMetaError("请先输入您的博客网址");
      return;
    }

    // 智能修正 URL 协议头
    let normalizedUrl = rawUrl;
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      normalizedUrl = `https://${normalizedUrl}`;
      setForm((prev) => ({ ...prev, url: normalizedUrl }));
    }

    setIsFetchingMeta(true);
    setMetaError(null);
    setSubmitError(null);

    try {
      const meta = await friendService.fetchWebMeta(normalizedUrl);
      if (meta && meta.success) {
        setForm((prev) => ({
          ...prev,
          url: normalizedUrl,
          name: meta.title?.trim() || prev.name || "我的独立博客",
          description:
            meta.description?.trim() || prev.description || "专注技术与生活的个人站点",
          avatarUrl: meta.faviconUrl?.trim() || prev.avatarUrl || "",
        }));
        setMetaFetched(true);
        playDroplet();
        // 自动聚焦至邮箱输入框，用户只需手动填写邮箱即可提交
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 150);
      } else {
        setMetaError(meta?.errorMsg || "未能自动解析该网站，请核对地址或手动补充下方信息");
        setShowCustomFields(true);
      }
    } catch {
      setMetaError("网络连接超时或目标网站禁止抓取，请手动填写下方信息");
      setShowCustomFields(true);
    } finally {
      setIsFetchingMeta(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const trimmedUrl = form.url.trim();
    const trimmedEmail = form.email.trim();
    const trimmedName = form.name.trim();

    if (!trimmedUrl) {
      setSubmitError("请填写博客地址");
      return;
    }
    if (!trimmedEmail) {
      setSubmitError("请填写联系邮箱，审核结果将发送至该邮箱");
      return;
    }
    if (!trimmedName) {
      setSubmitError("站点名称不能为空，请先抓取或手动填写");
      setShowCustomFields(true);
      return;
    }

    setIsSubmitting(true);
    try {
      await friendService.apply({
        name: trimmedName,
        url: trimmedUrl,
        avatarUrl: form.avatarUrl?.trim() || "",
        description: form.description?.trim() || "优秀的独立博客",
        email: trimmedEmail,
        category: form.category || "TECH",
      });
      playSuccess();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsApplyOpen(false);
        setForm({
          name: "",
          url: "",
          avatarUrl: "",
          description: "",
          email: "",
          category: "TECH",
        });
        setMetaFetched(false);
        setShowCustomFields(false);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "提交申请失败，请稍后重试";
      setSubmitError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 解析当前域名的微标签
  const displayDomain = (() => {
    try {
      if (!form.url) return "";
      const u = form.url.startsWith("http") ? form.url : `https://${form.url}`;
      return new URL(u).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  return (
    <section id="friends" className="mt-16 sm:mt-32">
      <div className="mb-5 flex items-baseline justify-between animate-in stagger-4">
        <h2 className="text-base font-[550] text-gray-1200 tracking-tight">
          Friends & Connections
        </h2>

        <div className="flex items-center gap-2 font-mono text-micro text-gray-1000">
          <Link
            href="/friends"
            className="transition-colors hover:text-gray-1200"
          >
            All friends
          </Link>
          <span className="text-gray-500" aria-hidden="true">·</span>
          <button
            onClick={handleOpenApply}
            className="group inline-flex items-center gap-1 transition-colors hover:text-gray-1200 cursor-pointer"
          >
            <Plus className="size-3 transition-transform group-hover:rotate-90 duration-200" />
            <span>Apply</span>
          </button>
        </div>
      </div>

      {/* 友链卡片网格 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {friends.map((friend) => (
          <a
            key={friend.id}
            href={friend.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={playTick}
            className="group relative flex items-start gap-3 rounded-xl border border-gray-400 bg-gray-100 p-3.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-500 hover:bg-gray-200"
          >
            <div className="relative size-8 shrink-0 overflow-hidden rounded-full border border-gray-400 bg-gray-200">
              <Image
                src={
                  friend.avatarUrl ||
                  "https://minio.server.butvan.top/blog2/USER_AVATAR/20260721/fbc00155-a6f0-4685-9067-fa1ab1c7356f.png"
                }
                alt={friend.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="truncate text-body-sm font-medium text-gray-1200">
                  {friend.name}
                </span>
                <ArrowUpRight className="size-3 text-gray-800 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              {friend.description && (
                <p className="mt-0.5 line-clamp-2 text-micro text-gray-1000 leading-relaxed">
                  {friend.description}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>

      {/* 友链申请弹窗 (通过 Portal 渲染至 body 顶层，彻底杜绝相册遮挡) */}
      <SpringModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        className="max-w-lg w-full"
      >
        <div className="flex items-start justify-between pr-8">
          <div>
            <h3 className="font-serif text-xl italic text-gray-1200">
              Apply for Friend Link
            </h3>
            <p className="mt-1 font-mono text-micro text-gray-1000">
              输入博客网址自动提取站点信息，填写邮箱即可提交
            </p>
          </div>
        </div>

        {isSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center gap-2 text-center text-emerald-600 dark:text-emerald-400">
            <Check className="size-8 animate-bounce" />
            <span className="text-body font-semibold">友链申请已成功提交！</span>
            <p className="font-mono text-micro text-gray-1000 max-w-xs mt-1 leading-relaxed">
              博主审核通过后将即刻呈现在友链网络中，结果将通过邮件通知您。
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {/* 1. 博客地址（第一核心输入项，支持一键智能抓取） */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-mono text-micro font-medium text-gray-1100">
                  Site URL · 博客网址 *
                </label>
                <span className="text-[11px] font-mono text-gray-900">
                  回车或离开输入框自动抓取
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    required
                    type="text"
                    value={form.url}
                    onChange={(e) => {
                      setForm({ ...form, url: e.target.value });
                      if (metaFetched) setMetaFetched(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleFetchMeta();
                      }
                    }}
                    onBlur={() => {
                      if (form.url.trim() && !metaFetched && !form.name) {
                        handleFetchMeta();
                      }
                    }}
                    placeholder="https://yourdomain.com"
                    className="w-full rounded-lg border border-gray-400 bg-gray-200/80 px-3 py-2 text-body text-gray-1200 placeholder:text-gray-900 focus:outline-none focus:border-gray-800 transition-colors font-mono text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleFetchMeta()}
                  disabled={isFetchingMeta || !form.url.trim()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-1200 text-gray-bg hover:opacity-90 transition-opacity text-xs font-mono font-medium disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed shrink-0 shadow-xs"
                  title="自动抓取站点图标、标题与简介"
                >
                  {isFetchingMeta ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  <span>{isFetchingMeta ? "抓取中..." : "自动提取"}</span>
                </button>
              </div>

              {/* 抓取失败警示 */}
              {metaError && (
                <div className="mt-1.5 flex items-center gap-1.5 text-micro text-amber-600 dark:text-amber-400">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{metaError}</span>
                </div>
              )}
            </div>

            {/* 抓取成功的实时卡片预览（极客质感呈现） */}
            {metaFetched && form.name && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 flex items-start justify-between gap-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="size-7 rounded-lg border border-gray-400 bg-white dark:bg-zinc-900 p-0.5 overflow-hidden shrink-0 flex items-center justify-center">
                    {form.avatarUrl ? (
                      <img
                        src={form.avatarUrl}
                        alt="icon"
                        className="h-full w-full object-contain"
                        onError={() => setForm((p) => ({ ...p, avatarUrl: "" }))}
                      />
                    ) : (
                      <Globe className="size-4 text-gray-800" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-gray-1200 truncate">
                        {form.name}
                      </span>
                      {displayDomain && (
                        <span className="font-mono text-[10px] text-gray-900 bg-gray-300/60 dark:bg-gray-800 px-1 rounded">
                          {displayDomain}
                        </span>
                      )}
                    </div>
                    {form.description && (
                      <p className="text-[11px] text-gray-1000 line-clamp-1 mt-0.5">
                        {form.description}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCustomFields((v) => !v)}
                  className="flex items-center gap-1 text-[11px] font-mono text-gray-1000 hover:text-gray-1200 transition-colors shrink-0 cursor-pointer pt-0.5"
                >
                  <SlidersHorizontal className="size-3" />
                  <span>{showCustomFields ? "收起微调" : "微调"}</span>
                </button>
              </div>
            )}

            {/* 2. 联系邮箱（用户唯一需要手动填写的一项，支持自动聚焦） */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-mono text-micro font-medium text-gray-1100">
                  Email · 联系邮箱 *
                </label>
                <span className="text-[11px] font-mono text-gray-900">
                  仅用于审核通过邮件通知，不公开展示
                </span>
              </div>
              <input
                ref={emailInputRef}
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your-email@domain.com"
                className="w-full rounded-lg border border-gray-400 bg-gray-200/80 px-3 py-2 text-body text-gray-1200 placeholder:text-gray-900 focus:outline-none focus:border-gray-800 transition-colors font-mono text-xs"
              />
            </div>

            {/* 3. 可选展开/手动补充字段（当未自动抓取或用户点击微调时显示） */}
            {(!metaFetched || showCustomFields) && (
              <div className="space-y-3 pt-1 border-t border-gray-300/60 dark:border-gray-800 animate-in fade-in duration-200">
                <div>
                  <label className="block font-mono text-micro text-gray-1000 mb-1">
                    Site Name · 站点名称 *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="例如：可梵的技术手记"
                    className="w-full rounded-lg border border-gray-400 bg-gray-200/80 px-3 py-1.5 text-body text-gray-1200 placeholder:text-gray-900 focus:outline-none focus:border-gray-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-mono text-micro text-gray-1000 mb-1">
                    Avatar / Favicon · 图标地址
                  </label>
                  <input
                    type="url"
                    value={form.avatarUrl}
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    placeholder="https://yourdomain.com/favicon.ico"
                    className="w-full rounded-lg border border-gray-400 bg-gray-200/80 px-3 py-1.5 text-body text-gray-1200 placeholder:text-gray-900 focus:outline-none focus:border-gray-800 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-micro text-gray-1000 mb-1">
                    Description · 站点简介
                  </label>
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="一句话介绍您的站点（例如：专注于高并发实践与架构思考）"
                    className="w-full rounded-lg border border-gray-400 bg-gray-200/80 px-3 py-1.5 text-body text-gray-1200 placeholder:text-gray-900 focus:outline-none focus:border-gray-800 text-xs resize-none"
                  />
                </div>
              </div>
            )}

            {/* 提交错误提示 */}
            {submitError && (
              <div className="text-micro text-red-500 font-mono">
                {submitError}
              </div>
            )}

            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isSubmitting || isFetchingMeta}
              className="mt-3 w-full rounded-lg bg-gray-1200 py-2.5 text-body font-semibold text-gray-bg transition-opacity hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>正在提交申请...</span>
                </>
              ) : (
                <span>提交友链申请</span>
              )}
            </button>
          </form>
        )}
      </SpringModal>
    </section>
  );
}
