"use client";

import React, { useEffect, useState } from "react";

/**
 * 页面滚动阅读进度条
 * 位于窗口顶部，随页面滚动实时展示当前阅读进度百分比
 */
export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setProgress(0);
        return;
      }
      const currentScroll = window.scrollY;
      const pct = Math.min(100, Math.max(0, (currentScroll / scrollHeight) * 100));
      setProgress(pct);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 h-[2px] z-50 pointer-events-none transition-all duration-75"
      style={{
        background: `linear-gradient(90deg, #ec4899 0%, #a855f7 ${progress}%, transparent ${progress}%)`,
      }}
    />
  );
}
