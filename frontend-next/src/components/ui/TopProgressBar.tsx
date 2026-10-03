"use client";

import React, { useEffect, useState, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * 全局顶栏路由导航加载进度条 (Top Navigation Progress Bar)
 * 1. 拦截站内链接点击即时启动进度条流动（0% -> 80%）；
 * 2. 路由完成时平滑冲至 100% 并淡出消失；
 * 3. 采用系统专属天蓝色调 (#BBDFFF) 与柔和微光辉光，对齐顶级极客博客体验。
 */
export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [, startTransition] = useTransition();

  // 路由变化完成时触发收尾
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // 全局拦截站内链接点击
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // 仅拦截站内跳转，排除新标签页、锚点、外部链接及文件下载
      const isExternal =
        target.target === "_blank" ||
        href.startsWith("http") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:");
      const isAnchor = href.startsWith("#");

      if (isExternal || isAnchor) return;

      // 启动顶栏进度流动
      setVisible(true);
      setProgress(25);
      const timer = setTimeout(() => {
        setProgress(75);
      }, 100);

      return () => clearTimeout(timer);
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="pointer-events-none fixed top-0 left-0 right-0 z-[9999] h-[2.5px] overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="h-full bg-[#BBDFFF] transition-all duration-300 ease-out"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
          boxShadow: "0 0 10px rgba(187, 223, 255, 0.8), 0 0 4px rgba(187, 223, 255, 0.5)",
        }}
      />
    </div>
  );
}
