"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { useTheme } from "@/hooks/useTheme";
import { useLang, Lang } from "@/lib/i18n";

interface DetailHeaderProps {
  backHref?: string;
}

/**
 * 极简详情页顶部导航条
 * 严格还原 Chloe Maillot 原版设计：
 * - 左侧：灰底圆形微返回按钮 ←
 * - 右侧：EN · FR 语言切换与微型昼夜模式切换按钮
 */
export function DetailHeader({ backHref = "/" }: DetailHeaderProps) {
  const { playTick } = useSound();
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();

  const handleLangChange = (targetLang: Lang) => {
    playTick();
    setLang(targetLang);
  };

  return (
    <header className="w-full flex items-center justify-between mb-12 sm:mb-16 select-none">
      {/* 左侧：极简圆形微返回按钮 */}
      <Link
        href={backHref}
        onClick={playTick}
        aria-label="返回"
        className="group flex size-7 sm:size-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 transition-all duration-150"
      >
        <ArrowLeft className="size-3.5 sm:size-4 transition-transform group-hover:-translate-x-0.5" />
      </Link>

      {/* 右侧：EN · FR 与主题切换按钮 */}
      <div className="flex items-center gap-3 text-xs font-mono">
        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
          <button
            onClick={() => handleLangChange("en")}
            className={`transition-colors cursor-pointer ${
              lang === "en"
                ? "font-semibold text-gray-1200 underline underline-offset-4"
                : "hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            EN
          </button>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <button
            onClick={() => handleLangChange("fr")}
            className={`transition-colors cursor-pointer ${
              lang === "fr"
                ? "font-semibold text-gray-1200 underline underline-offset-4"
                : "hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            FR
          </button>
        </div>

        <button
          onClick={toggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex size-7 items-center justify-center rounded-md text-gray-500 hover:text-gray-1200 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
        </button>
      </div>
    </header>
  );
}
