"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { LangToggle } from "@/components/LangToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ParisClock } from "@/components/ParisClock";
import { ClientStack } from "@/components/ClientStack";
import { SpotifyPlayer } from "@/components/SpotifyPlayer";

export function Header() {
  const { lang, t } = useLang();

  const linkStyle =
    "font-medium text-gray-1200 underline decoration-gray-600 underline-offset-[3px] transition-colors duration-200 hover:decoration-gray-1100";

  return (
    <header className="relative z-30">
      {/* 顶部个人名字、职位与工具栏 */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-lede font-medium leading-snug text-gray-1200">
            Chloé Maillot
          </h1>
          <span className="text-lede font-medium leading-snug text-gray-1100">
            {t("roleBadge")}{" "}
            <a
              href="https://www.linkedin.com/company/artefact-global/"
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-0.5 ${linkStyle}`}
            >
              <span>Artefact</span>
              <ArrowUpRight className="size-3 text-gray-800" />
            </a>
          </span>
        </div>

        {/* 语言与主题切换器 */}
        <div className="flex items-center gap-1 rounded-lg border border-gray-400 bg-gray-100 p-0.5 shadow-sm">
          <LangToggle />
          <span className="h-3.5 w-px bg-gray-400" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </div>

      {/* 巴黎实时时钟 */}
      <div className="mt-2 mb-6">
        <ParisClock />
      </div>

      {/* 个人介绍段落 */}
      <div className="space-y-4 text-base text-gray-1100 leading-relaxed">
        <p>
          {t("bioSeg1")}
          <ClientStack />
          <br />
          {t("bioSeg2")}
          <br />
          {t("bioSeg2b")}
          <Link href="#notes" className={linkStyle}>
            {t("bioWriteLink")}
          </Link>
          {t("bioSeg3")}
          <a
            href="https://github.com/chloemaillot"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-0.5 ${linkStyle}`}
          >
            <span>{t("bioToolsLink")}</span>
            <ArrowUpRight className="size-3 text-gray-800" />
          </a>
          {t("bioSeg4")}
        </p>

        {/* 社交链接 */}
        <p>
          {t("findMePrefix")}{" "}
          <a
            href="https://www.linkedin.com/in/chlo%C3%A9-maillot-889a33172/"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-0.5 ${linkStyle}`}
          >
            <span>LinkedIn</span>
            <ArrowUpRight className="size-3 text-gray-800" />
          </a>{" "}
          {t("findMeAnd")}{" "}
          <a
            href="https://x.com/ChloMaillott"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-0.5 ${linkStyle}`}
          >
            <span>X</span>
            <ArrowUpRight className="size-3 text-gray-800" />
          </a>
          {t("findMeMid")}{" "}
          <a
            href="mailto:hello@chloemaillot.fr"
            className={`inline-flex items-center gap-0.5 ${linkStyle}`}
          >
            <span>hello@chloemaillot.fr</span>
            <ArrowUpRight className="size-3 text-gray-800" />
          </a>
          .
        </p>

        {/* 音乐试听组件 */}
        <div className="pt-2">
          <SpotifyPlayer />
        </div>
      </div>
    </header>
  );
}
