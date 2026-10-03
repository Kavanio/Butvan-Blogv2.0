"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Plus, Check } from "lucide-react";
import { FriendLinkVO, FriendLinkApplyDTO } from "@/types/friend";
import { SectionHeader } from "@/components/core/SectionHeader";
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
  const { playTick, playBloom, playSuccess } = useSound();

  const [form, setForm] = useState<FriendLinkApplyDTO>({
    name: "",
    url: "",
    avatarUrl: "",
    description: "",
    email: "",
  });

  const handleOpenApply = () => {
    playBloom();
    setIsApplyOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.url || !form.email) return;

    setIsSubmitting(true);
    try {
      await friendService.apply(form);
      playSuccess();
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsApplyOpen(false);
        setForm({ name: "", url: "", avatarUrl: "", description: "", email: "" });
      }, 1500);
    } catch {
      // 容错处理
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsApplyOpen(false);
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

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

      {/* 友链申请弹窗 */}
      <SpringModal
        isOpen={isApplyOpen}
        onClose={() => setIsApplyOpen(false)}
        className="max-w-md w-full"
      >
        <h3 className="font-serif text-xl italic text-gray-1200">
          Apply for Friend Link
        </h3>
        <p className="mt-1 font-mono text-micro text-gray-1000">
          Exchange links with Butvan's digital garden
        </p>

        {isSuccess ? (
          <div className="my-8 flex flex-col items-center justify-center gap-2 text-emerald-600">
            <Check className="size-8" />
            <span className="text-body font-medium">Application Submitted!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <div>
              <label className="block font-mono text-micro text-gray-1000 mb-1">
                Site Name *
              </label>
              <input
                required
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. My Craft Studio"
                className="w-full rounded-lg border border-gray-400 bg-gray-200 px-3 py-1.5 text-body text-gray-1200 focus:outline-none focus:border-gray-800"
              />
            </div>

            <div>
              <label className="block font-mono text-micro text-gray-1000 mb-1">
                Site URL *
              </label>
              <input
                required
                type="url"
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
                placeholder="https://yourdomain.com"
                className="w-full rounded-lg border border-gray-400 bg-gray-200 px-3 py-1.5 text-body text-gray-1200 focus:outline-none focus:border-gray-800"
              />
            </div>

            <div>
              <label className="block font-mono text-micro text-gray-1000 mb-1">
                Avatar / Favicon URL
              </label>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                placeholder="https://yourdomain.com/avatar.png"
                className="w-full rounded-lg border border-gray-400 bg-gray-200 px-3 py-1.5 text-body text-gray-1200 focus:outline-none focus:border-gray-800"
              />
            </div>

            <div>
              <label className="block font-mono text-micro text-gray-1000 mb-1">
                Email *
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@yourdomain.com"
                className="w-full rounded-lg border border-gray-400 bg-gray-200 px-3 py-1.5 text-body text-gray-1200 focus:outline-none focus:border-gray-800"
              />
            </div>

            <div>
              <label className="block font-mono text-micro text-gray-1000 mb-1">
                Description
              </label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief one-line summary of your site..."
                className="w-full rounded-lg border border-gray-400 bg-gray-200 px-3 py-1.5 text-body text-gray-1200 focus:outline-none focus:border-gray-800"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-lg bg-gray-1200 py-2 text-body font-medium text-gray-bg transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        )}
      </SpringModal>
    </section>
  );
}
