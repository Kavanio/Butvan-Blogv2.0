"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImagePreviewModal } from "./ImagePreviewModal";

export interface ArticleCarouselProps {
  images: { alt: string; url: string }[];
}

/**
 * 极简纯图片轮播组件（无任何多余背景、容器框或缩略图，纯粹展示图片与轻量交互）
 */
export function ArticleCarousel({ images }: ArticleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalImage, setModalImage] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: "",
    alt: "",
  });

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <>
      <div className="not-prose my-6 max-w-[85%] sm:max-w-[78%] mx-auto select-none group/carousel">
        {/* 图片主体（无背景色，自然贴合图片） */}
        <div className="relative flex items-center justify-center">
          <img
            src={currentImage.url}
            alt={currentImage.alt || `图片 ${currentIndex + 1}`}
            onClick={() =>
              setModalImage({
                isOpen: true,
                src: currentImage.url,
                alt: currentImage.alt,
              })
            }
            className="rounded-xl max-h-[420px] w-auto h-auto max-w-full object-contain mx-auto block shadow-xs border border-black/6 dark:border-white/8 cursor-pointer"
          />

          {/* 左右翻页箭头（hover 时浮现） */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
                aria-label="上一张"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover/carousel:opacity-100 cursor-pointer"
                aria-label="下一张"
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}

          {/* 右下角极简页码 */}
          {images.length > 1 && (
            <div className="absolute right-2.5 bottom-2.5 px-2 py-0.5 rounded-md bg-black/45 text-white/90 text-[11px] font-mono backdrop-blur-xs pointer-events-none">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* 底部轻量小圆点 */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all rounded-full cursor-pointer ${
                  idx === currentIndex
                    ? "w-4 h-1.5 bg-zinc-800 dark:bg-zinc-200"
                    : "w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                }`}
                aria-label={`跳转到第 ${idx + 1} 张`}
              />
            ))}
          </div>
        )}
      </div>

      <ImagePreviewModal
        isOpen={modalImage.isOpen}
        src={modalImage.src}
        alt={modalImage.alt}
        onClose={() => setModalImage({ isOpen: false, src: "", alt: "" })}
      />
    </>
  );
}
