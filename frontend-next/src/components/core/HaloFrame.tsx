"use client";

import React, { useRef } from "react";

interface HaloFrameProps {
  children: React.ReactNode;
  aspect?: string;
  rotate?: number;
  className?: string;
  onClick?: () => void;
}

/**
 * 统一覆膜流光跟随容器 (Halo Frame)
 * 监听光标在容器内的局部坐标并注入 CSS 变量 --lx, --ly
 * 配合 mix-blend-overlay 产生真实覆膜照片与精致卡片的微光流动
 */
export function HaloFrame({
  children,
  aspect = "4/5",
  rotate = 0,
  className = "",
  onClick,
}: HaloFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    containerRef.current.style.setProperty("--lx", `${e.clientX - rect.left}px`);
    containerRef.current.style.setProperty("--ly", `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      style={{
        aspectRatio: aspect,
        transform: `rotate(${rotate}deg)`,
      }}
      className={`group relative overflow-hidden rounded-lg border border-gray-400 bg-gray-200 p-1 shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-md ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[5px]">
        {children}

        {/* 镜面高光光斑层 (Halo Specular Sheen) */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(180px at var(--lx, -999px) var(--ly, -999px), rgba(255,255,255,0.85), transparent 75%)`,
          }}
        />

        {/* 胶片颗粒噪点层 */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-25"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundSize: "140px 140px",
          }}
        />
      </div>
    </div>
  );
}
