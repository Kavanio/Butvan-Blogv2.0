"use client";

import React from "react";
import { ProfileVO } from "@/types/profile";
import { SITE_CONFIG } from "@/constants/site";
import { useClock } from "@/hooks/useClock";
import { useTheme } from "@/hooks/useTheme";
import { useSound } from "@/hooks/useSound";
import { TextLink } from "@/components/ui/TextLink";
import { Sun, Moon } from "lucide-react";

interface HeaderSectionProps {
  profile?: ProfileVO;
}

const ROTATE_PRESETS = [-6, -4, 6, -5, -6, 4, -3];

export function HeaderSection({ profile }: HeaderSectionProps) {
  const clock = useClock(SITE_CONFIG.timezone);
  const { isDark, toggleTheme } = useTheme();
  const { playSparkle } = useSound();

  const name = profile?.nickname || SITE_CONFIG.name;
  const bio = profile?.bio || "JAVA / Agent / VibeCoding 开发者";
  const socialLinks = profile?.socialLinks || {};
  const introLine1 =
    (socialLinks.introLine1 as string) || "大三后端开发｜敲代码｜热爱生活";
  const introLine2 =
    (socialLinks.introLine2 as string) ||
    "欢迎来到我的 Blog 交流学习，分享技术文章也分享生活帖子";
  const github = (socialLinks.github as string) || SITE_CONFIG.socialLinks.github;
  const email = (socialLinks.email as string) || SITE_CONFIG.socialLinks.email;
  const x = (socialLinks.x as string) || (socialLinks.twitter as string) || "";

  // 纯真实数据驱动：仅当博主在后台配置了技术栈徽标且非空时展示，杜绝任何写死假数据
  const configuredBadges = socialLinks.techStack;
  const techStackList =
    Array.isArray(configuredBadges) && configuredBadges.length > 0
      ? configuredBadges
      : [];

  return (
    <header className="relative z-30">
      {/* 顶部个人名字、职位与工具栏 */}
      <div className="animate-in stagger-1 relative z-20 flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-lede font-medium leading-snug text-gray-1200">
            {name}
          </h1>
          <span className="text-lede font-medium leading-snug text-gray-1100">
            {bio}
          </span>
        </div>

        {/* 主题切换工具按钮 (原站同款圆形微触感按钮) */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            type="button"
            aria-label="Toggle theme"
            className="flex size-7 items-center justify-center rounded-full text-gray-1000 transition-colors duration-150 hover:text-gray-1200 cursor-pointer"
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
        </div>
      </div>

      {/* 实时时区时钟 */}
      <div className="animate-in stagger-1 mb-6 mt-2">
        <span className="font-mono text-micro tabular-nums text-gray-1000">
          {SITE_CONFIG.timezoneLabel}
          <span className="mx-1 text-gray-900" aria-hidden="true">·</span>
          <span className="inline-block min-w-[62px]">{clock ?? "--:--:--"}</span>
        </span>
      </div>

      {/* 个人介绍段落（纯真实数据驱动：仅当后台配置徽标时展示展开式技术栈徽标） */}
      <div className="animate-in stagger-2 space-y-4 text-base text-gray-1100 leading-relaxed">
        <p>
          {introLine1}
          {/* 纯真实数据驱动：无数据时完全不渲染，杜绝任何死数据 */}
          {techStackList.length > 0 && (
            <span
              aria-hidden="true"
              className="group/stack relative z-40 ml-1.5 mr-0.5 inline-flex translate-y-[5px] items-center"
            >
              {techStackList.map((logo, index) => {
                const rotateDeg =
                  typeof logo.rotate === "number" && !Number.isNaN(logo.rotate)
                    ? logo.rotate
                    : ROTATE_PRESETS[index % ROTATE_PRESETS.length];

                return (
                  <span
                    key={`${logo.title}-${index}`}
                    style={{ "--spread": `${(index - 1) * 7}px` } as React.CSSProperties}
                    className="group/chip chip-item relative -ml-2.5 inline-block shrink-0 first:ml-0 hover:z-30 cursor-pointer"
                    onMouseEnter={playSparkle}
                  >
                    {/* 悬停技术栈提示气泡 */}
                    <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-1200 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-[var(--color-gray-bg)] opacity-0 shadow-md transition-opacity duration-200 group-hover/chip:opacity-100 z-40">
                      {logo.title}
                    </span>
                    {/* 芯片外框与旋转悬浮放大 */}
                    <span
                      style={{ "--rot": `${rotateDeg}deg` } as React.CSSProperties}
                      className="chip-card block rounded-[7px] border border-gray-400 bg-white dark:bg-[#1c1c1c] p-[2px] shadow-sm"
                    >
                      <span className="flex size-[22px] items-center justify-center overflow-hidden rounded-[4px] bg-gray-100 dark:bg-gray-800 p-0.5">
                        <img
                          src={logo.src}
                          alt={logo.title}
                          width={18}
                          height={18}
                          className="h-full w-full object-contain"
                          draggable={false}
                        />
                      </span>
                    </span>
                  </span>
                );
              })}
            </span>
          )}
          <br />
          {introLine2}
        </p>

        {/* 社交与联系链接（动态过滤非空项，杜绝死链接） */}
        <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-gray-1000">
          <span>Find me on</span>
          {github && (
            <TextLink href={github} external>
              GitHub
            </TextLink>
          )}
          {x && (
            <>
              <span>and</span>
              <TextLink href={x} external>
                X
              </TextLink>
            </>
          )}
          {email && (
            <>
              <span>, or write to me at</span>
              <TextLink href={email.startsWith("mailto:") ? email : `mailto:${email}`} external>
                {email.replace(/^mailto:/, "")}
              </TextLink>
            </>
          )}
          <span className="text-gray-500">·</span>
          <TextLink href="/feed.xml" external>
            RSS
          </TextLink>
        </p>
      </div>
    </header>
  );
}
