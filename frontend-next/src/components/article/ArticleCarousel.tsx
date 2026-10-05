"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { ImagePreviewModal } from "./ImagePreviewModal";

export interface ArticleCarouselProps {
  images: { alt: string; url: string }[];
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 240 : -240,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 240 : -240,
    opacity: 0,
  }),
};

/**
 * 沉浸式电影级图片画廊组件（无卡片外框，毛玻璃悬浮交互 + 缩略图胶卷联动）
 */
export function ArticleCarousel({ images }: ArticleCarouselProps) {
  const [[page, direction], setPage] = useState([0, 0]);
  const [modalImage, setModalImage] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: "",
    alt: "",
  });

  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const imageIndex =
    images && images.length > 0
      ? ((page % images.length) + images.length) % images.length
      : 0;
  const currentImage = images && images.length > 0 ? images[imageIndex] : null;

  const paginate = useCallback(
    (newDirection: number) => {
      setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
    },
    []
  );

  const jumpTo = useCallback(
    (targetIndex: number) => {
      if (targetIndex === imageIndex) return;
      const dir = targetIndex > imageIndex ? 1 : -1;
      setPage([targetIndex, dir]);
    },
    [imageIndex]
  );

  // 当切图时自动平滑滚动缩略图到视口内
  useEffect(() => {
    if (!thumbnailScrollRef.current) return;
    const container = thumbnailScrollRef.current;
    const activeThumb = container.children[imageIndex] as HTMLElement;
    if (activeThumb) {
      const offsetLeft =
        activeThumb.offsetLeft -
        container.offsetWidth / 2 +
        activeThumb.offsetWidth / 2;
      container.scrollTo({ left: offsetLeft, behavior: "smooth" });
    }
  }, [imageIndex]);

  if (!images || images.length === 0 || !currentImage) return null;

  return (
    <>
      <div className="not-prose my-7 select-none group/carousel">
        {/* 核心主展示视窗（纯粹黑调视窗，无外卡片框） */}
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[480px] rounded-2xl bg-zinc-950 overflow-hidden shadow-lg border border-black/5 dark:border-white/10 flex items-center justify-center">
          {/* 滑动动效图片 */}
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 320, damping: 32 },
                opacity: { duration: 0.18 },
              }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.8}
              onDragEnd={(_, { offset, velocity }) => {
                const swipe = Math.abs(offset.x) * velocity.x;
                if (swipe < -8000 || offset.x < -50) {
                  paginate(1);
                } else if (swipe > 8000 || offset.x > 50) {
                  paginate(-1);
                }
              }}
              className="absolute inset-0 flex items-center justify-center p-2 sm:p-4"
            >
              <div
                className="relative max-w-full max-h-full flex items-center justify-center cursor-zoom-in"
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
                  className="max-w-full max-h-[300px] sm:max-h-[400px] md:max-h-[460px] w-auto h-auto object-contain rounded-lg shadow-sm"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 悬浮左右切换箭头（毛玻璃胶囊） */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => paginate(-1)}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center transition-all opacity-70 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="上一张"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={() => paginate(1)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/75 text-white/90 hover:text-white backdrop-blur-md border border-white/20 shadow-md flex items-center justify-center transition-all opacity-70 hover:opacity-100 hover:scale-105 active:scale-95 cursor-pointer"
                aria-label="下一张"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* 右上角放大按钮 */}
          <button
            type="button"
            onClick={() =>
              setModalImage({
                isOpen: true,
                src: currentImage.url,
                alt: currentImage.alt,
              })
            }
            className="absolute right-3.5 top-3.5 z-20 p-2 rounded-xl bg-black/40 hover:bg-black/75 text-white/80 hover:text-white backdrop-blur-md border border-white/20 shadow-sm transition-all opacity-60 group-hover/carousel:opacity-100 cursor-pointer"
            title="查看大图"
          >
            <Maximize2 size={14} />
          </button>

          {/* 底部渐变信息条（Heads-Up Display）：左侧图说 + 右侧微胶囊页码 */}
          <div className="absolute inset-x-0 bottom-0 z-10 px-4 py-3 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end justify-between gap-3 pointer-events-none">
            <div className="text-xs text-white/85 font-sans font-medium drop-shadow-xs truncate max-w-[70%]">
              {currentImage.alt ? currentImage.alt : `第 ${imageIndex + 1} 张`}
            </div>

            <div className="px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md border border-white/20 text-[11px] font-mono font-medium text-white/95 tracking-wider shadow-xs">
              {imageIndex + 1} / {images.length}
            </div>
          </div>
        </div>

        {/* 底部缩略图胶卷条（当大于1张时展现，极佳交互密度） */}
        {images.length > 1 && (
          <div
            ref={thumbnailScrollRef}
            className="flex items-center gap-2 mt-2.5 px-0.5 overflow-x-auto scroll-smooth py-1"
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => jumpTo(idx)}
                className={`relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-zinc-900 ${
                  idx === imageIndex
                    ? "border-primary shadow-xs ring-2 ring-primary/30 opacity-100 scale-102"
                    : "border-transparent opacity-45 hover:opacity-85 hover:border-zinc-500"
                }`}
                title={img.alt || `第 ${idx + 1} 张`}
              >
                <img
                  src={img.url}
                  alt={img.alt || `缩略图 ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
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
