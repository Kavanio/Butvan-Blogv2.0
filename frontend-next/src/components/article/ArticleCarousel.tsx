"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Images, Maximize2 } from "lucide-react";
import { ImagePreviewModal } from "./ImagePreviewModal";

export interface ArticleCarouselProps {
  images: { alt: string; url: string }[];
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

/**
 * 极客文人风格的高品质多图轮播画廊组件
 */
export function ArticleCarousel({ images }: ArticleCarouselProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [modalImage, setModalImage] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: "",
    alt: "",
  });

  const imageIndex = images.length > 0 ? (page % images.length + images.length) % images.length : 0;
  const currentImage = images[imageIndex];

  const paginate = useCallback(
    (newDirection: number) => {
      setPage([page + newDirection, newDirection]);
    },
    [page]
  );

  if (!images || images.length === 0) return null;

  return (
    <>
      <div className="not-prose my-8 rounded-2xl border border-gray-200/80 dark:border-zinc-800/80 bg-gray-50/70 dark:bg-[#121214] overflow-hidden shadow-xs select-none">
        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 dark:bg-zinc-900/60 border-b border-gray-200/60 dark:border-zinc-800/60 text-xs">
          <div className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-gray-300 font-sans">
            <Images size={14} className="text-primary" />
            <span>图片画廊</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full font-semibold">
              {imageIndex + 1} / {images.length}
            </span>
          </div>
        </div>

        {/* 核心展示视窗 */}
        <div className="relative w-full h-[280px] sm:h-[400px] flex items-center justify-center bg-gray-100/40 dark:bg-black/40 overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.15 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -8000 || offset.x < -60) {
                  paginate(1);
                } else if (swipe > 8000 || offset.x > 60) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0 flex items-center justify-center p-3 sm:p-5"
            >
              <div
                className="relative max-w-full max-h-full flex items-center justify-center cursor-zoom-in group"
                onClick={() =>
                  setModalImage({
                    isOpen: true,
                    src: currentImage.url,
                    alt: currentImage.alt,
                  })
                }
              >
                <img
                  src={currentImage.url}
                  alt={currentImage.alt || `轮播图片 ${imageIndex + 1}`}
                  draggable={false}
                  className="max-w-full max-h-[250px] sm:max-h-[360px] object-contain rounded-xl shadow-xs"
                />
                <div className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <Maximize2 size={13} />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 左右切换箭头（图片大于1张时展现） */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => paginate(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 shadow-md backdrop-blur-xs flex items-center justify-center text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                aria-label="上一张"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={() => paginate(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-zinc-800/80 hover:bg-white dark:hover:bg-zinc-700 shadow-md backdrop-blur-xs flex items-center justify-center text-gray-700 dark:text-gray-200 transition-all cursor-pointer"
                aria-label="下一张"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>

        {/* 底部导航条：左侧图片描述 + 右侧圆点胶囊 */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-white/70 dark:bg-zinc-900/60 border-t border-gray-200/60 dark:border-zinc-800/60 text-xs">
          <div className="text-[12px] font-handwriting text-gray-600 dark:text-gray-400 truncate max-w-[65%]">
            {currentImage.alt ? currentImage.alt : `第 ${imageIndex + 1} 张`}
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-1.5 shrink-0">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPage([idx, idx > imageIndex ? 1 : -1])}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === imageIndex
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400"
                  }`}
                  aria-label={`跳转到第 ${idx + 1} 张`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 灯箱全屏查看 */}
      <ImagePreviewModal
        isOpen={modalImage.isOpen}
        src={modalImage.src}
        alt={modalImage.alt}
        onClose={() => setModalImage({ isOpen: false, src: "", alt: "" })}
      />
    </>
  );
}
