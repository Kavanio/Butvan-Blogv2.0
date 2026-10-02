"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Image as ImageIcon, Calendar, X } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { PhotoVO } from "@/types/album";
import { albumService } from "@/services";
import { formatDate } from "@/utils/date";

interface SlotPosition {
  left: number;
  top: number;
  rotate: number;
  w: number;
  aspect: string;
  round?: boolean;
}

/**
 * 原站 1040px 画板多照片黄金分布槽位 (纯坐标与尺寸，0死数据)
 */
const MULTI_SLOTS: SlotPosition[] = [
  { left: 33, top: 41, rotate: -5, w: 140, aspect: "3/4" },
  { left: 146, top: 13, rotate: 4, w: 140, aspect: "3/4" },
  { left: 349, top: 19, rotate: -3, w: 140, aspect: "3/4" },
  { left: 455, top: 50, rotate: 2, w: 148, aspect: "4/5" },
  { left: 630, top: 37, rotate: -2, w: 140, aspect: "3/4" },
  { left: 754, top: 93, rotate: 6, w: 140, aspect: "3/4" },
  { left: 858, top: 22, rotate: 4, w: 140, aspect: "3/4" },
  { left: 862, top: 147, rotate: -2, w: 150, aspect: "1/1", round: true },
  { left: 172, top: 187, rotate: 5, w: 140, aspect: "3/4" },
  { left: 19, top: 278, rotate: -4, w: 140, aspect: "3/4" },
  { left: 126, top: 306, rotate: 3, w: 140, aspect: "3/4" },
  { left: 349, top: 311, rotate: -2, w: 140, aspect: "3/4" },
  { left: 448, top: 278, rotate: 3, w: 140, aspect: "3/4" },
  { left: 567, top: 286, rotate: -3, w: 140, aspect: "3/4" },
  { left: 629, top: 306, rotate: 4, w: 140, aspect: "3/4" },
  { left: 750, top: 290, rotate: -4, w: 140, aspect: "3/4" },
  { left: 860, top: 295, rotate: 3, w: 140, aspect: "3/4" },
  { left: 910, top: 180, rotate: -3, w: 130, aspect: "3/4" },
];

function getSlotForIndex(index: number, total: number): SlotPosition {
  if (total === 1) {
    return { left: 410, top: 100, rotate: -2, w: 220, aspect: "4/5" };
  }
  if (total === 2) {
    const slots = [
      { left: 280, top: 120, rotate: -4, w: 210, aspect: "3/4" },
      { left: 540, top: 105, rotate: 3, w: 210, aspect: "4/5" },
    ];
    return slots[index] || slots[0];
  }
  if (total === 3) {
    const slots = [
      { left: 200, top: 130, rotate: -5, w: 190, aspect: "3/4" },
      { left: 425, top: 95, rotate: 2, w: 200, aspect: "4/5" },
      { left: 650, top: 135, rotate: -3, w: 185, aspect: "3/4" },
    ];
    return slots[index] || slots[0];
  }
  if (total === 4) {
    const slots = [
      { left: 180, top: 110, rotate: -4, w: 180, aspect: "3/4" },
      { left: 380, top: 75, rotate: 3, w: 190, aspect: "4/5" },
      { left: 580, top: 110, rotate: -3, w: 185, aspect: "3/4" },
      { left: 420, top: 260, rotate: 4, w: 180, aspect: "3/4" },
    ];
    return slots[index] || slots[0];
  }
  return MULTI_SLOTS[index % MULTI_SLOTS.length];
}

interface PhotoSectionProps {
  photos?: PhotoVO[];
}

interface RealCraftPhoto {
  id: string;
  realId: number;
  label: string;
  src: string;
  albumTitle?: string;
  createdAt?: string;
  w: number;
  aspect: string;
  left: number;
  top: number;
  rotate: number;
  round?: boolean;
}

/**
 * 100% 对齐原站 chloemaillot.fr 的交互式照片剪贴画板
 * 核心细节特性：
 * 1. 纯真实数据流，零假数据；
 * 2. 真实 3D 透视角度 perspective(600px) rotate(var(--rot))；
 * 3. 动态全息棱镜折射双层流动光斑 (Conic Rainbow Specular Halo Sheen)；
 * 4. 悬停物理景深虚化 (Depth-of-field Blur: 3.5px) 与层叠置顶；
 * 5. 防误触点击放大灯箱、胶片噪点与物理触感音效。
 */
export function PhotoSection({ photos: initialPhotos }: PhotoSectionProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<RealCraftPhoto | null>(null);
  const [zOrder, setZOrder] = useState<Record<string, number>>({});
  const zCounter = useRef(100);

  // 严格防止拖拽释放时误触发 click 放大
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(0);

  // 客户端维护相册照片状态
  const [photoList, setPhotoList] = useState<PhotoVO[]>(initialPhotos || []);

  const { playTick, playDroplet } = useSound();

  // 客户端挂载后动态同步最新真实相册照片
  useEffect(() => {
    albumService
      .getPublicPhotos(1, 18)
      .then((data) => {
        if (data && Array.isArray(data)) {
          setPhotoList(data);
        }
      })
      .catch((err) => {
        console.warn("客户端动态同步相册照片失败:", err);
      });
  }, []);

  const bringToFront = useCallback((id: string) => {
    zCounter.current += 1;
    setZOrder((prev) => ({ ...prev, [id]: zCounter.current }));
  }, []);

  // 注入卡片局部的鼠标坐标与全息旋转角 (100% 对齐原版 --lx, --ly, --la 算法)
  const handleCardMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const lx = e.clientX - rect.left;
      const ly = e.clientY - rect.top;
      const la = ((e.clientX + e.clientY) * 0.22) % 360;

      target.style.setProperty("--lx", `${lx}px`);
      target.style.setProperty("--ly", `${ly}px`);
      target.style.setProperty("--la", `${la}deg`);
    },
    []
  );

  /**
   * 仅处理有效真实照片
   */
  const items: RealCraftPhoto[] = useMemo(() => {
    const validPhotos = (photoList || []).filter((p) => Boolean(p.url && p.url.trim()));
    if (validPhotos.length === 0) {
      return [];
    }

    const total = validPhotos.length;
    return validPhotos.slice(0, 18).map((photo, index) => {
      const slot = getSlotForIndex(index, total);
      const label = photo.caption?.trim() || photo.albumTitle?.trim() || "生活随拍";

      return {
        id: `real-photo-${photo.id}`,
        realId: photo.id,
        label,
        src: photo.url,
        albumTitle: photo.albumTitle,
        createdAt: photo.createdAt,
        w: slot.w,
        aspect: slot.aspect,
        left: slot.left,
        top: slot.top,
        rotate: slot.rotate,
        round: slot.round,
      };
    });
  }, [photoList]);

  // 监听 ESC 键关闭全屏灯箱
  useEffect(() => {
    if (!activeItem) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveItem(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem]);

  return (
    <footer className="relative left-1/2 right-1/2 mt-20 sm:mt-32 -mx-[50vw] w-screen overflow-hidden px-4 sm:px-6">
      {/* 1040px 交互式照片拼贴画板 (对齐原站尺寸与点阵背景) */}
      <div className="mx-auto max-w-[1040px] overflow-x-auto sm:overflow-visible py-4">
        <div
          ref={boardRef}
          className="relative mx-auto h-[520px] w-[1040px] max-w-[1040px] overflow-hidden rounded-2xl border border-gray-400 bg-gray-100 dark:bg-[#141414] shadow-card select-none"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-gray-400) 1px, transparent 1.4px)",
            backgroundSize: "22px 22px",
          }}
        >
          {/* 原站经典周围环境暗角柔光 */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: "radial-gradient(120% 100% at 50% 40%, transparent 55%, rgba(60,50,40,0.09) 100%)",
            }}
            aria-hidden="true"
          />

          {/* 状态一：真实照片为空时的优雅空状态（杜绝以死数据充数） */}
          {items.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-400/80 bg-white/70 dark:bg-gray-900/70 p-8 backdrop-blur-xs shadow-card max-w-sm">
                <div className="mb-3 flex size-12 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-800">
                  <Camera className="size-5 text-gray-800 dark:text-gray-200" />
                </div>
                <h3 className="font-serif italic text-base text-gray-1200 mb-1">
                  光影画廊 · Moments
                </h3>
                <p className="font-mono text-micro text-gray-1000 leading-relaxed">
                  暂无公开相册照片
                  <br />
                  博主正在整理生活记录与胶片印记
                </p>
              </div>
            </div>
          )}

          {/* 状态二：仅渲染真实获取到的相册照片卡片 */}
          {items.map((item, index) => {
            const isHovered = hoveredId === item.id;
            const hasHover = hoveredId !== null;
            const currentZ = zOrder[item.id] ?? (10 + index);

            return (
              <motion.div
                key={item.id}
                drag
                dragConstraints={boardRef}
                dragElastic={0.15}
                dragMomentum={false}
                onDragStart={() => {
                  isDraggingRef.current = true;
                  dragStartTimeRef.current = Date.now();
                }}
                onDragEnd={() => {
                  setTimeout(() => {
                    isDraggingRef.current = false;
                  }, 120);
                }}
                onPointerDown={() => {
                  bringToFront(item.id);
                  playTick();
                }}
                onMouseEnter={() => {
                  setHoveredId(item.id);
                  bringToFront(item.id);
                  playTick();
                }}
                onMouseLeave={() => setHoveredId(null)}
                onMouseMove={handleCardMouseMove}
                onClick={(e) => {
                  if (
                    isDraggingRef.current ||
                    Date.now() - dragStartTimeRef.current < 200
                  ) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  setActiveItem(item);
                  playDroplet();
                }}
                initial={{
                  rotate: item.rotate,
                }}
                whileHover={{
                  scale: 1.04,
                  rotate: 0,
                  transition: { duration: 0.2, ease: "easeOut" },
                }}
                whileDrag={{
                  scale: 1.08,
                  zIndex: 9999,
                }}
                animate={{
                  filter:
                    hasHover && !isHovered
                      ? "blur(3.5px) saturate(0.85) brightness(0.85)"
                      : "blur(0px) saturate(1) brightness(1)",
                }}
                transition={{
                  filter: { duration: 0.25, ease: "easeOut" },
                }}
                className={`group absolute cursor-grab active:cursor-grabbing select-none border border-gray-400 bg-preview-bg shadow-card transition-shadow duration-300 hover:shadow-card-hover ${
                  item.round
                    ? "rounded-full p-1"
                    : "rounded-xl p-1.5"
                }`}
                style={{
                  left: item.left,
                  top: item.top,
                  width: item.w,
                  zIndex: currentZ,
                  transform: `perspective(600px) rotate(${item.rotate}deg)`,
                  WebkitTouchCallout: "none",
                  WebkitUserSelect: "none",
                  userSelect: "none",
                  touchAction: "none",
                }}
              >
                {/* 真实照片实体展示 */}
                <span
                  className={`relative block h-full w-full overflow-hidden border border-gray-500 ${
                    item.round ? "rounded-full" : "rounded-lg"
                  }`}
                  style={{ aspectRatio: item.aspect }}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className="h-full w-full object-cover pointer-events-none"
                    draggable={false}
                    loading="lazy"
                  />

                  {/* 原站微胶片颗粒噪点层 */}
                  <span
                    className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                      backgroundSize: "140px 140px",
                      opacity: 0.28,
                    }}
                    aria-hidden="true"
                  />

                  {/* 原站惊艳的全息彩虹流动光斑层 (Conic Rainbow Specular Sheen) */}
                  <span
                    className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(230px at var(--lx, -999px) var(--ly, -999px), rgba(255,250,240,0.75), rgba(255,250,240,0) 70%), conic-gradient(from var(--la, 0deg) at var(--lx, -999px) var(--ly, -999px), rgba(255,196,214,0.5), rgba(255,228,178,0.5), rgba(196,235,214,0.5), rgba(198,212,255,0.5), rgba(240,200,255,0.5), rgba(255,196,214,0.5))",
                      maskImage:
                        "radial-gradient(230px at var(--lx, -999px) var(--ly, -999px), black, transparent 72%)",
                      WebkitMaskImage:
                        "radial-gradient(230px at var(--lx, -999px) var(--ly, -999px), black, transparent 72%)",
                    }}
                    aria-hidden="true"
                  />
                </span>

                {/* 照片下方微型标签 (单张或较少照片时更具拍立得手作质感) */}
                {!item.round && (
                  <div className="mt-1 px-0.5 flex items-center justify-between text-[11px] font-mono text-gray-1000 truncate">
                    <span className="truncate">{item.label}</span>
                    {item.albumTitle && items.length <= 4 && (
                      <span className="shrink-0 text-[10px] text-gray-800 dark:text-gray-400 ml-1">
                        ✦ {item.albumTitle}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 原站同款全屏 Lightbox 弹窗 (带有 Esc 提示与大图全息光斑) */}
      <AnimatePresence>
        {activeItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.25 } }}
            onClick={() => setActiveItem(null)}
            className="fixed inset-0 z-[9997] flex items-center justify-center overscroll-contain bg-white/90 dark:bg-black/90 p-6 backdrop-blur-md cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.05 }}
              onClick={(e) => e.stopPropagation()}
              onMouseMove={handleCardMouseMove}
              className="relative flex flex-col items-center max-w-[85vw] max-h-[85vh] cursor-default"
            >
              <div className="relative overflow-hidden rounded-2xl border border-gray-400 bg-preview-bg p-2 shadow-2xl">
                <img
                  src={activeItem.src}
                  alt={activeItem.label}
                  className="max-h-[65vh] max-w-[80vw] rounded-xl object-contain pointer-events-none select-none"
                  draggable={false}
                />

                {/* 弹窗大图全息彩虹光斑 */}
                <span
                  className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-overlay"
                  style={{
                    background:
                      "radial-gradient(320px at var(--lx, -999px) var(--ly, -999px), rgba(255,250,240,0.7), rgba(255,250,240,0) 70%), conic-gradient(from var(--la, 0deg) at var(--lx, -999px) var(--ly, -999px), rgba(255,196,214,0.45), rgba(255,228,178,0.45), rgba(196,235,214,0.45), rgba(198,212,255,0.45), rgba(240,200,255,0.45), rgba(255,196,214,0.45))",
                    maskImage:
                      "radial-gradient(320px at var(--lx, -999px) var(--ly, -999px), black, transparent 72%)",
                    WebkitMaskImage:
                      "radial-gradient(320px at var(--lx, -999px) var(--ly, -999px), black, transparent 72%)",
                  }}
                  aria-hidden="true"
                />

                <button
                  onClick={() => setActiveItem(null)}
                  className="absolute top-4 right-4 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-md transition-colors hover:bg-black/80 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* 弹窗底部标题信息 */}
              <div className="mt-4 flex flex-col items-center gap-1.5 text-center">
                <p className="font-serif italic text-base text-gray-1200">
                  {activeItem.label}
                </p>

                <div className="flex items-center gap-3 text-micro font-mono text-gray-1000">
                  {activeItem.albumTitle && (
                    <span className="inline-flex items-center gap-1">
                      <ImageIcon className="size-3 text-gray-600" />
                      相册: {activeItem.albumTitle}
                    </span>
                  )}
                  {activeItem.createdAt && (
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="size-3 text-gray-600" />
                      {formatDate(activeItem.createdAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* 原站经典底部 ESC 键盘按键提示 */}
              <span className="pointer-events-none mt-4 font-mono text-micro uppercase tracking-[0.15em] text-gray-1000 dark:text-white/50">
                Press ESC or click anywhere to close
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
