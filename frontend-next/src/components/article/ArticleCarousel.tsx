"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImagePreviewModal } from "./ImagePreviewModal";

export interface ArticleCarouselProps {
  images: { alt: string; url: string }[];
}

/**
 * 极简纯图片轮播组件
 * - 纯净呈现：无多余背景、无卡片框、无右下角数量
 * - 左右切换：丝滑横向平滑滑动动画（CSS GPU 硬件加速）
 * - 自动轮播：鼠标移入暂停，移出继续
 * - 鼠标/手势拖拽：支持鼠标左键按住左右滑动切图，实时跟手位移
 */
export function ArticleCarousel({ images }: ArticleCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const [modalImage, setModalImage] = useState<{ isOpen: boolean; src: string; alt: string }>({
    isOpen: false,
    src: "",
    alt: "",
  });

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const diffXRef = useRef(0);

  const prev = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((p) => (p - 1 + images.length) % images.length);
  }, [images]);

  const next = useCallback(() => {
    if (!images || images.length === 0) return;
    setCurrentIndex((p) => (p + 1) % images.length);
  }, [images]);

  // 1. 自动轮播（3.5 秒一次，鼠标悬浮时暂停）
  useEffect(() => {
    if (!images || images.length <= 1 || isHovered || isDragging) return;
    const timer = setInterval(() => {
      next();
    }, 3500);
    return () => clearInterval(timer);
  }, [images, isHovered, isDragging, next]);

  if (!images || images.length === 0) return null;

  // 2. 鼠标与触控左右拖拽滑动处理
  const onPointerDown = (clientX: number) => {
    if (images.length <= 1) return;
    isDraggingRef.current = true;
    startXRef.current = clientX;
    diffXRef.current = 0;
    setIsDragging(true);
  };

  const onPointerMove = (clientX: number) => {
    if (!isDraggingRef.current) return;
    const diff = clientX - startXRef.current;
    diffXRef.current = diff;
    setDragOffset(diff);
  };

  const onPointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const diff = diffXRef.current;
    setIsDragging(false);
    setDragOffset(0);

    // 拖动位移超过 45px 触发切页
    if (diff < -45) {
      next();
    } else if (diff > 45) {
      prev();
    }
  };

  const handleImageClick = (img: { alt: string; url: string }) => {
    // 只有非拖拽滑动时才弹出全屏大图
    if (Math.abs(diffXRef.current) < 6) {
      setModalImage({
        isOpen: true,
        src: img.url,
        alt: img.alt,
      });
    }
  };

  return (
    <>
      <div
        className="not-prose my-6 max-w-[85%] sm:max-w-[78%] mx-auto select-none group/carousel"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (isDraggingRef.current) {
            onPointerUp();
          }
        }}
      >
        {/* 图片主体视窗（横向溢出隐藏，支持鼠标左右拖动滑动） */}
        <div
          className={`relative overflow-hidden rounded-xl ${
            images.length > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : ""
          }`}
          onMouseDown={(e) => onPointerDown(e.clientX)}
          onMouseMove={(e) => onPointerMove(e.clientX)}
          onMouseUp={onPointerUp}
          onTouchStart={(e) => onPointerDown(e.touches[0].clientX)}
          onTouchMove={(e) => onPointerMove(e.touches[0].clientX)}
          onTouchEnd={onPointerUp}
        >
          {/* 横向平滑滑动轨道 Track */}
          <div
            className="flex w-full items-center"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging
                ? "none"
                : "transform 0.42s cubic-bezier(0.25, 1, 0.5, 1)",
            }}
          >
            {images.map((img, idx) => (
              <div
                key={idx}
                className="w-full shrink-0 flex items-center justify-center p-0.5"
              >
                <img
                  src={img.url}
                  alt={img.alt || `图片 ${idx + 1}`}
                  draggable={false}
                  onClick={() => handleImageClick(img)}
                  className="rounded-xl max-h-[420px] w-auto h-auto max-w-full object-contain mx-auto block shadow-xs border border-black/6 dark:border-white/8 select-none"
                />
              </div>
            ))}
          </div>

          {/* 左右翻页箭头（多张图时 hover 浮现） */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover/carousel:opacity-100 cursor-pointer z-10"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-xs transition-opacity opacity-0 group-hover/carousel:opacity-100 cursor-pointer z-10"
                aria-label="下一张"
              >
                <ChevronRight size={18} />
              </button>
            </>
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
