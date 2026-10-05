"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  src: string;
  alt?: string;
  onClose: () => void;
}

/**
 * 文章图片全屏 Lightbox 预览弹窗
 */
export function ImagePreviewModal({
  isOpen,
  src,
  alt = "",
  onClose,
}: ImagePreviewModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // 锁定页面滚动
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || !src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85"
      onClick={onClose}
    >
      {/* 顶部关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white cursor-pointer"
        aria-label="关闭预览"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 图片主体 */}
      <div
        className="relative max-w-5xl max-h-[90vh] flex flex-col items-center justify-center select-none"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl select-none"
        />
        {alt && (
          <p className="mt-3 text-xs text-gray-300 font-mono text-center max-w-xl truncate">
            {alt}
          </p>
        )}
      </div>
    </div>
  );
}
