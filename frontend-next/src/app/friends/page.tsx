"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Plus, ExternalLink, Copy, Check, Globe } from "lucide-react";
import { friendService } from "@/services";
import { FriendLinkVO, FriendLinkApplyDTO } from "@/types/friend";
import { SpringModal } from "@/components/ui/SpringModal";
import { useSound } from "@/hooks/useSound";
import { SITE_CONFIG } from "@/constants/site";

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendLinkVO[]>([]);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const [formData, setFormData] = useState<FriendLinkApplyDTO>({
    name: "",
    url: "",
    avatarUrl: "",
    description: "",
    email: "",
  });

  const { playDroplet, playSuccess, playTick } = useSound();

  useEffect(() => {
    friendService.getApprovedFriends().then(setFriends);
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await friendService.apply(formData);
      playSuccess();
      setApplySuccess(true);
      setTimeout(() => {
        setApplySuccess(false);
        setIsApplyOpen(false);
        setFormData({ name: "", url: "", avatarUrl: "", description: "", email: "" });
      }, 1500);
    } catch {
      alert("提交申请失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  const copyMySiteInfo = () => {
    playDroplet();
    const text = `名称: ${SITE_CONFIG.name}\n简介: ${SITE_CONFIG.bio}\n网址: ${SITE_CONFIG.url}\n头像: ${SITE_CONFIG.avatarUrl}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-gray-bg)] text-[var(--color-gray-1200)] selection:bg-[#fde3ef] selection:text-[#9b3860]">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[var(--color-gray-bg)]/80 border-b border-gray-200/60 dark:border-gray-800/60">
        <div className="max-w-[40.5rem] mx-auto px-6 h-14 flex items-center justify-between">
          <Link
            href="/"
            onClick={playTick}
            className="group inline-flex items-center gap-2 text-xs font-mono text-gray-800 dark:text-gray-400 hover:text-gray-1200 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>cd .. / 返回首页</span>
          </Link>
          <button
            onClick={() => {
              playTick();
              setIsApplyOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-300 text-xs font-medium hover:bg-pink-100 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>申请互换</span>
          </button>
        </div>
      </header>

      <main className="max-w-[40.5rem] mx-auto px-6 pt-10 pb-20">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-500" />
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
              友人帐 / Neighbors & Friends
            </h1>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            穿越信息孤岛，致敬仍在坚持独立博客与自由创作的数字同行者。
          </p>
        </div>

        {/* 本站信息卡片 */}
        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-800 mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 font-mono">
              ✦ 本站友链信息
            </span>
            <button
              onClick={copyMySiteInfo}
              className="inline-flex items-center gap-1 text-micro text-gray-600 hover:text-gray-900 font-mono cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "已复制" : "一键复制"}</span>
            </button>
          </div>
          <div className="text-micro font-mono text-gray-600 space-y-1">
            <p>• 名称: {SITE_CONFIG.name}</p>
            <p>• 简介: {SITE_CONFIG.bio}</p>
            <p>• 网址: {SITE_CONFIG.url}</p>
          </div>
        </div>

        {/* 友链卡片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {friends.map((friend) => (
            <a
              key={friend.id}
              href={friend.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 hover:border-gray-400 dark:hover:border-gray-600 transition-all flex items-start gap-3 shadow-xs"
            >
              {friend.avatarUrl ? (
                <img
                  src={friend.avatarUrl}
                  alt={friend.name}
                  className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-black/5"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-pink-500 transition-colors">
                    {friend.name}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-pink-500 transition-colors shrink-0" />
                </div>
                <p className="text-micro text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                  {friend.description || "这位博主很神秘，没有留下介绍"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </main>

      {/* 友链申请弹窗 */}
      <SpringModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        title="申请交换友链 / Add Link"
      >
        {applySuccess ? (
          <div className="py-8 text-center text-emerald-600 font-mono text-xs">
            🎉 申请已提交成功，等待博主审核生效！
          </div>
        ) : (
          <form onSubmit={handleApply} className="flex flex-col gap-3">
            <div>
              <label className="block text-micro font-mono text-gray-600 mb-1">
                站点名称 *
              </label>
              <input
                type="text"
                required
                placeholder="例如：Chloé Maillot"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-micro font-mono text-gray-600 mb-1">
                站点 URL *
              </label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-micro font-mono text-gray-600 mb-1">
                头像图标链接 (可选)
              </label>
              <input
                type="url"
                placeholder="https://.../avatar.png"
                value={formData.avatarUrl}
                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-micro font-mono text-gray-600 mb-1">
                站点一句话介绍
              </label>
              <input
                type="text"
                placeholder="例如：设计工程师、前端与动效"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div>
              <label className="block text-micro font-mono text-gray-600 mb-1">
                联系邮箱 (审核通过将通知您) *
              </label>
              <input
                type="email"
                required
                placeholder="your-email@domain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full text-xs px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:border-pink-500"
              />
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              >
                {submitting ? "提交中..." : "确认提交申请"}
              </button>
            </div>
          </form>
        )}
      </SpringModal>
    </div>
  );
}
