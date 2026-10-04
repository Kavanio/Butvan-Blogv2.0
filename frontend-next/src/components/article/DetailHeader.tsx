"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { useTheme } from "@/hooks/useTheme";

interface DetailHeaderProps {
  backHref?: string;
  className?: string;
}

/**
 * 极简详情页/归档页顶部导航条
 * - 左侧：灰底圆形微返回按钮 ←
 * - 右侧：微型昼夜模式切换按钮
 */
export function DetailHeader({ backHref = "/", className }: DetailHeaderProps) {
  const { playTick } = useSound();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className={`w-full flex items-center justify-between select-none ${className || "mb-12 sm:mb-16"}`}>
      {/* 左侧：极简圆形微返回按钮 */}
      <Link
        href={backHref}
        onClick={playTick}
        aria-label="返回"
        className="group flex size-7 sm:size-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 transition-all duration-150"
      >
        <ArrowLeft className="size-3.5 sm:size-4 transition-transform group-hover:-translate-x-0.5" />
      </Link>

      {/* 右侧：主题切换按钮 */}
      <button
        onClick={toggleTheme}
        aria-label={isDark ? "切换为亮色模式" : "切换为暗色模式"}
        className="flex size-7 items-center justify-center rounded-md text-gray-500 hover:text-gray-1200 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
      >
        {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
      </button>
    </header>
  );
}
