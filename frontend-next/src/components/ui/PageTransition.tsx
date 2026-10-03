"use client";

import React from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

/**
 * 全局页面级路由切换平滑过渡容器 (Page Transition Wrapper)
 * 1. 路由变化时触发轻微垂直位移 (y: 6px -> 0) 与平滑淡入 (opacity: 0 -> 1)；
 * 2. 动画耗时 280ms，曲线采用自然轻快的机械阻尼手感，彻底告别生硬的页面切换；
 * 3. 兼容服务端组件与客户端水合，不侵入页面既有布局。
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  // 路由发生切换时，确保新页面始终从最顶端开始呈现
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // 在下一帧与微任务中二次确认，彻底消除异步组件水合与高度重算导致的滚动位置回退
      const raf = requestAnimationFrame(() => {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });

      return () => cancelAnimationFrame(raf);
    }
  }, [pathname]);

  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full flex-1"
    >
      {children}
    </motion.div>
  );
}
