"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { play } from "@/lib/sound";

interface PhotoCardProps {
  src: string;
  alt: string;
  aspect?: string;
  rotate?: number;
  width?: number;
  className?: string;
}

export function PhotoCard({
  src,
  alt,
  aspect = "4/5",
  rotate = 0,
  width,
  className = "",
}: PhotoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // 鼠标移动时注入局部坐标变量以实现光斑反光跟随
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty("--lx", `${x}px`);
    cardRef.current.style.setProperty("--ly", `${y}px`);
  };

  const handleOpen = () => {
    play("droplet", { volume: 0.6 });
    setIsOpen(true);
  };

  const handleClose = () => {
    play("whisper", { volume: 0.35 });
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onClick={handleOpen}
        style={{
          aspectRatio: aspect,
          width: width ? `${width}px` : "100%",
          transform: `rotate(${rotate}deg)`,
        }}
        className={`group relative cursor-zoom-in overflow-hidden rounded-lg border border-gray-400 bg-gray-200 p-1 shadow-sm transition-transform duration-300 hover:scale-[1.02] hover:shadow-md ${className}`}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[5px]">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

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

      {/* 放大 Lightbox 弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0 }}
              className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-xl border border-white/20 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={src}
                alt={alt}
                className="max-h-[85vh] max-w-[85vw] object-contain"
              />
              <button
                onClick={handleClose}
                className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white backdrop-blur-md hover:bg-black/80"
              >
                Esc
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
