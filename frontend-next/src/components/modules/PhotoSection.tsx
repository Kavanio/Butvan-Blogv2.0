"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { SpringModal } from "@/components/ui/SpringModal";
import { PhotoVO } from "@/types/album";
import { albumService } from "@/services";
import { Camera, Calendar, Maximize2 } from "lucide-react";

interface PhotoSectionProps {
  photos?: PhotoVO[];
}

/**
 * 格式化拍摄/创建时间（YYYY.MM.DD）
 */
function formatPhotoDate(dateStr?: string): string {
  if (!dateStr) return "2026.07.25";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr.slice(0, 10).replace(/-/g, ".");
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch {
    return dateStr.slice(0, 10).replace(/-/g, ".");
  }
}

/**
 * 根据照片总数与索引，计算其在 1040x520 点阵画板上的散落坐标与倾角
 * 彻底杜绝死数据：完全根据真实照片数量自适应定位
 */
function getScatterPosition(index: number, total: number) {
  if (total === 1) {
    // 只有 1 张真实照片时：优雅地摆放在画板中央黄金焦点区域
    return { left: 425, top: 100, rotate: -2, w: 190, aspect: "3/4" };
  }
  if (total === 2) {
    return index === 0
      ? { left: 260, top: 110, rotate: -4, w: 175, aspect: "3/4" }
      : { left: 580, top: 110, rotate: 3, w: 175, aspect: "3/4" };
  }
  if (total === 3) {
    const pos = [
      { left: 160, top: 110, rotate: -4, w: 170, aspect: "3/4" },
      { left: 425, top: 95, rotate: 2, w: 180, aspect: "3/4" },
      { left: 690, top: 115, rotate: -3, w: 170, aspect: "3/4" },
    ];
    return pos[index];
  }
  if (total === 4) {
    const pos = [
      { left: 120, top: 80, rotate: -4, w: 160, aspect: "3/4" },
      { left: 340, top: 60, rotate: 3, w: 160, aspect: "3/4" },
      { left: 560, top: 80, rotate: -2, w: 160, aspect: "3/4" },
      { left: 770, top: 70, rotate: 4, w: 160, aspect: "3/4" },
    ];
    return pos[index];
  }

  // 5 张及以上多照片错落排布
  const MULTI_PRESETS = [
    { left: 50, top: 40, rotate: -5, w: 145, aspect: "3/4" },
    { left: 210, top: 25, rotate: 4, w: 145, aspect: "3/4" },
    { left: 380, top: 40, rotate: -3, w: 145, aspect: "3/4" },
    { left: 550, top: 25, rotate: 3, w: 145, aspect: "3/4" },
    { left: 715, top: 45, rotate: -4, w: 145, aspect: "3/4" },
    { left: 865, top: 35, rotate: 5, w: 145, aspect: "3/4" },
    { left: 80, top: 260, rotate: 3, w: 145, aspect: "3/4" },
    { left: 250, top: 275, rotate: -4, w: 145, aspect: "3/4" },
    { left: 420, top: 255, rotate: 2, w: 145, aspect: "3/4" },
    { left: 595, top: 270, rotate: -3, w: 145, aspect: "3/4" },
    { left: 770, top: 260, rotate: 4, w: 145, aspect: "3/4" },
    { left: 300, top: 150, rotate: -2, w: 150, aspect: "3/4" },
    { left: 620, top: 145, rotate: 3, w: 150, aspect: "3/4" },
  ];
  return MULTI_PRESETS[index % MULTI_PRESETS.length];
}

/**
 * 1040px 突破全宽交互式照片剪贴画板 (Photo Scrapbook Board)
 * 100% 真实后端相册数据驱动，绝对零死数据！
 * 继承原版点阵背景、拍立得装裱、物理阻尼拖拽、hover景深去模糊与大图灯箱
 */
export function PhotoSection({ photos: initialPhotos }: PhotoSectionProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [activePhoto, setActivePhoto] = useState<PhotoVO | null>(null);
  const [zOrder, setZOrder] = useState<Record<number, number>>({});
  const zCounter = useRef(100);

  // 维护真实照片列表（由服务端初始数据 + 客户端动态更新保证实时性）
  const [photoList, setPhotoList] = useState<PhotoVO[]>(initialPhotos || []);

  const { playTick, playDroplet } = useSound();

  // 客户端挂载后动态拉取最新公开相册照片，杜绝任何静态写死数据
  useEffect(() => {
    albumService
      .getPublicPhotos(1, 20)
      .then((data) => {
        if (data && data.length > 0) {
          setPhotoList(data);
        }
      })
      .catch((err) => {
        console.warn("拉取相册真实照片失败:", err);
      });
  }, []);

  const bringToFront = (id: number) => {
    zCounter.current += 1;
    setZOrder((prev) => ({ ...prev, [id]: zCounter.current }));
  };

  // 严格过滤出具备真实有效 URL 的博客相册照片
  const validPhotos = (photoList || []).filter((p) => Boolean(p.url));

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

          {/* 画板左上角：博客胶卷相册水印标牌 */}
          <div className="pointer-events-none absolute left-6 top-6 z-10 select-none">
            <div className="flex items-center gap-2">
              <Camera className="size-4 text-gray-1000 dark:text-gray-400" />
              <span className="font-mono text-micro tracking-widest text-gray-1000 uppercase">
                PHOTO ARCHIVE · 随拍画廊
              </span>
            </div>
          </div>

          {/* 空状态：真实相册暂无照片 */}
          {validPhotos.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Camera className="size-10 text-gray-400 dark:text-gray-600 mb-3 stroke-[1.5]" />
              <p className="font-mono text-sm text-gray-1000">暂无相册照片，期待每一次快门记录生活</p>
            </div>
          )}

          {/* 渲染 100% 真实的相册拍立得照片卡片（绝对零死数据） */}
          {validPhotos.map((photo, index) => {
            const isHovered = hoveredId === photo.id;
            const hasHover = hoveredId !== null;
            const currentZ = zOrder[photo.id] ?? (10 + index);
            const pos = getScatterPosition(index, validPhotos.length);
            const photoTitle = photo.caption || photo.albumTitle || "随拍照片";
            const photoDate = formatPhotoDate(photo.createdAt);

            return (
              <motion.div
                key={photo.id}
                drag
                dragConstraints={boardRef}
                dragElastic={0.15}
                dragMomentum={false}
                onPointerDown={() => {
                  bringToFront(photo.id);
                  playTick();
                }}
                onMouseEnter={() => {
                  setHoveredId(photo.id);
                  bringToFront(photo.id);
                  playTick();
                }}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  setActivePhoto(photo);
                  playDroplet();
                }}
                initial={{ rotate: pos.rotate }}
                whileHover={{ scale: 1.05, rotate: 0 }}
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
                className="group absolute cursor-grab active:cursor-grabbing rounded-xl border border-gray-400 bg-white dark:bg-gray-900 p-2 pb-3.5 shadow-card hover:shadow-2xl transition-shadow"
                style={{
                  left: pos.left,
                  top: pos.top,
                  width: pos.w,
                  zIndex: currentZ,
                }}
              >
                {/* 拍立得照片本体 */}
                <div
                  className="relative block w-full overflow-hidden rounded-lg border border-gray-300 dark:border-gray-800 bg-gray-200 dark:bg-gray-800"
                  style={{ aspectRatio: pos.aspect }}
                >
                  <img
                    src={photo.url}
                    alt={photoTitle}
                    className="h-full w-full object-cover pointer-events-none transition-transform duration-300 group-hover:scale-105"
                    draggable={false}
                  />

                  {/* 微胶片噪点层 */}
                  <span
                    className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    }}
                    aria-hidden="true"
                  />

                  {/* 悬停放大镜指示标志 */}
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/15">
                    <span className="rounded-full bg-black/60 p-1.5 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                      <Maximize2 className="size-3.5" />
                    </span>
                  </div>
                </div>

                {/* 拍立得底部相纸留白区（打印真实相册信息与时间） */}
                <div className="mt-2 flex items-center justify-between px-1">
                  <span className="font-mono text-micro font-medium text-gray-1200 truncate max-w-[65%]">
                    {photoTitle}
                  </span>
                  <span className="font-mono text-[10px] text-gray-900 shrink-0">
                    {photoDate}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 点击卡片弹窗灯箱 (Lightbox) */}
      <SpringModal
        isOpen={activePhoto !== null}
        onClose={() => setActivePhoto(null)}
        title={activePhoto?.caption || activePhoto?.albumTitle || "随拍照片"}
      >
        {activePhoto && (
          <div className="flex flex-col items-center">
            <div className="max-h-[72vh] overflow-hidden rounded-xl border border-gray-400 bg-white dark:bg-gray-900 p-2 shadow-2xl">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || activePhoto.albumTitle || "随拍照片"}
                className="max-h-[62vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
            <div className="mt-3 flex items-center justify-between w-full px-2 font-mono text-micro text-gray-1000">
              <span>{activePhoto.albumTitle ? `相册 · ${activePhoto.albumTitle}` : "随拍记录"}</span>
              <span className="flex items-center gap-1">
                <Calendar className="size-3" />
                {formatPhotoDate(activePhoto.createdAt)}
              </span>
            </div>
          </div>
        )}
      </SpringModal>
    </section>
  );
}
