"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Camera, Image as ImageIcon, Calendar } from "lucide-react";
import { useSound } from "@/hooks/useSound";
import { SpringModal } from "@/components/ui/SpringModal";
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
 * 当真实照片较多（>= 5 张）时的 18 个黄金分布槽位坐标
 * 仅用于视觉排版定位，不包含任何硬编码假图片或虚假文案
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

/**
 * 根据照片总数计算最佳的槽位排版参数
 * 确保无论只有 1 张、少量几张还是多张照片，视觉上都居中平衡、典雅自然
 */
function getSlotForIndex(index: number, total: number): SlotPosition {
  if (total === 1) {
    // 单张照片：放置于画板黄金焦点，尺寸放大，居中精致呈现
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
  // 5 张及以上，从多槽位模板中按序取用
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
 * 1040px 交互式照片剪贴画板 (Photo Scrapbook Board)
 * 100% 真实后端数据驱动，彻底杜绝任何死数据与本地假图
 * 具备自适应数量排版、物理自由拖拽、防误触全屏灯箱、胶片噪点与原生触感音效
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

  // 客户端挂载后动态获取最新真实公开相册照片
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

  const bringToFront = (id: string) => {
    zCounter.current += 1;
    setZOrder((prev) => ({ ...prev, [id]: zCounter.current }));
  };

  /**
   * 仅处理有效真实照片，严禁任何写死假数据兜底填充
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

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] my-16 w-screen overflow-hidden px-4 sm:px-6">
      {/* 1040px 交互式照片拼贴画板 */}
      <div className="mx-auto max-w-[1040px] overflow-x-auto sm:overflow-visible py-4">
        <div
          ref={boardRef}
          className="relative mx-auto h-[520px] w-[1040px] max-w-[1040px] overflow-hidden rounded-2xl border border-gray-400 bg-gray-100 shadow-xl select-none"
          style={{
            backgroundImage: "radial-gradient(circle, var(--color-gray-400) 1px, transparent 1.4px)",
            backgroundSize: "22px 22px",
          }}
        >
          {/* 周围环境暗角柔光 */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: "radial-gradient(120% 100% at 50% 40%, transparent 55%, rgba(60,50,40,0.09) 100%)",
            }}
            aria-hidden="true"
          />

          {/* 状态一：真实照片为空时的优雅手作空状态（绝不以假数据充数） */}
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

          {/* 状态二：仅渲染真实获取到的相册照片 */}
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
                  // 延时清除拖拽标记，防止松开鼠标瞬间误触发 click 弹窗放大
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
                onClick={(e) => {
                  // 若刚才在拖拽，彻底拦截点击放大事件
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
                initial={{ rotate: item.rotate }}
                whileHover={{ scale: 1.04, rotate: 0 }}
                whileDrag={{ scale: 1.08, zIndex: 9999 }}
                animate={{
                  filter:
                    hasHover && !isHovered
                      ? "blur(3.5px) saturate(0.85) brightness(0.85)"
                      : "blur(0px) saturate(1) brightness(1)",
                }}
                transition={{
                  filter: { duration: 0.25, ease: "easeOut" },
                  scale: { duration: 0.2 },
                }}
                className={`group absolute cursor-grab active:cursor-grabbing ${
                  item.round
                    ? "rounded-full border border-gray-400 bg-white dark:bg-gray-900 p-1 shadow-card"
                    : "rounded-xl border border-gray-400 bg-white dark:bg-gray-900 p-1.5 shadow-card"
                }`}
                style={{
                  left: item.left,
                  top: item.top,
                  width: item.w,
                  zIndex: currentZ,
                }}
              >
                {/* 真实照片卡片渲染 */}
                <span
                  className={`relative block h-full w-full overflow-hidden border border-gray-400 bg-gray-200 dark:bg-gray-800 ${
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
                  {/* 微胶片噪点层 */}
                  <span
                    className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                    aria-hidden="true"
                  />
                </span>

                {/* 照片下方微型标题说明（单张或较少照片时更显拍立得质感） */}
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

      {/* 点击卡片弹窗灯箱 (仅在单纯点击时触发，拖拽松开鼠标绝不误触发) */}
      <SpringModal
        isOpen={activeItem !== null}
        onClose={() => setActiveItem(null)}
        title={activeItem?.label}
      >
        {activeItem && (
          <div className="flex flex-col items-center max-w-full">
            <div className="max-h-[70vh] overflow-hidden rounded-xl border border-gray-400 bg-white dark:bg-gray-900 p-2 shadow-xl">
              <img
                src={activeItem.src}
                alt={activeItem.label}
                className="max-h-[60vh] w-auto rounded-lg object-contain"
              />
            </div>
            
            {/* 照片详细信息 */}
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
          </div>
        )}
      </SpringModal>
    </section>
  );
}
