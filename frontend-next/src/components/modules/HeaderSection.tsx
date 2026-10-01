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

const TECH_STACK_LOGOS = [
  { src: "/images/logos/sephora.png", title: "React & Next.js", rotate: -6 },
  { src: "/images/logos/renault.png?v=2", title: "TypeScript & Node", rotate: -4 },
  { src: "/images/logos/mad.png", title: "Spring Boot & Java", rotate: 6 },
  { src: "/images/logos/canalplus.png?v=2", title: "Tailwind & Motion", rotate: -5 },
  { src: "/images/logos/astrazeneca.png?v=4", title: "Web Audio & Craft", rotate: -6 },
];

export function HeaderSection({ profile }: HeaderSectionProps) {
  const clock = useClock(SITE_CONFIG.timezone);
  const { isDark, toggleTheme } = useTheme();
  const { playSparkle } = useSound();

  const name = profile?.nickname || SITE_CONFIG.name;
  const bio = profile?.bio || SITE_CONFIG.description;
  const github = (profile?.socialLinks?.github as string) || SITE_CONFIG.socialLinks.github;
  const x = (profile?.socialLinks?.x as string) || SITE_CONFIG.socialLinks.x;
  const email = (profile?.socialLinks?.email as string) || SITE_CONFIG.socialLinks.email;

  return (
    <header className="relative z-30">
      {/* 顶部个人名字、职位与工具栏 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-lede font-medium leading-snug text-gray-1200">
            {name}
          </h1>
          <span className="text-lede font-medium leading-snug text-gray-1100">
            Design Engineer & Full-Stack Developer
          </span>
        </div>

        {/* 主题切换工具按钮 */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-400 bg-gray-100 p-0.5 shadow-sm">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="inline-flex size-7 items-center justify-center rounded-md text-gray-1000 transition-colors hover:bg-gray-200 hover:text-gray-1200"
          >
            {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </button>
        </div>
      </div>

      {/* 实时时区时钟 */}
      <div className="mt-2 mb-6">
        <span className="font-mono text-micro tabular-nums text-gray-1000">
          {SITE_CONFIG.timezoneLabel}
          <span className="mx-1 text-gray-600" aria-hidden="true">·</span>
          <span className="inline-block min-w-[62px]">{clock ?? "--:--:--"}</span>
        </span>
      </div>

      {/* 个人介绍段落（包含扑克牌展开式技术栈徽标） */}
      <div className="space-y-4 text-base text-gray-1100 leading-relaxed">
        <p>
          I'm a design engineer who ships what he designs
          {/* 扑克牌式层叠与扇形展开卡片 (100% 对齐原版交互) */}
          <span
            aria-hidden="true"
            className="group/stack relative z-40 ml-1.5 mr-0.5 inline-flex translate-y-[5px] items-center"
          >
            {TECH_STACK_LOGOS.map((logo, index) => (
              <span
                key={logo.src}
                style={{ "--spread": `${(index - 1) * 7}px` } as React.CSSProperties}
                className="group/chip chip-item relative -ml-2.5 inline-block shrink-0 first:ml-0 hover:z-30 cursor-pointer"
                onMouseEnter={playSparkle}
              >
                {/* 悬停品牌提示气泡 */}
                <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-1200 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-[var(--color-gray-bg)] opacity-0 shadow-md transition-opacity duration-200 group-hover/chip:opacity-100 z-40">
                  {logo.title}
                </span>
                {/* 芯片外框与旋转悬浮放大 1.55 倍 */}
                <span
                  style={{ "--rot": `${logo.rotate}deg` } as React.CSSProperties}
                  className="chip-card block rounded-[7px] border border-gray-400 bg-white dark:bg-[#1c1c1c] p-[2px] shadow-sm"
                >
                  <span className="block size-[22px] overflow-hidden rounded-[4px] bg-gray-200 dark:bg-gray-800">
                    <img
                      src={logo.src}
                      alt=""
                      width={22}
                      height={22}
                      className="h-full w-full object-cover"
                      draggable={false}
                    />
                  </span>
                </span>
              </span>
            ))}
          </span>
          <br />
          {bio}
          <br />
          I write about this way of working, and I build tools to make it real.
        </p>

        {/* 社交链接 */}
        <p>
          Find me on{" "}
          <TextLink href={github} external>
            GitHub
          </TextLink>{" "}
          and{" "}
          <TextLink href={x} external>
            X
          </TextLink>
          , or write to me at{" "}
          <TextLink href={email.startsWith("mailto:") ? email : `mailto:${email}`} external>
            {email.replace(/^mailto:/, "")}
          </TextLink>
          .
        </p>
      </div>
    </header>
  );
}
