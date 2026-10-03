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
