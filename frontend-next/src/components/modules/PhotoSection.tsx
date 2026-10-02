"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { SpringModal } from "@/components/ui/SpringModal";
import { PhotoVO } from "@/types/album";
import { albumService } from "@/services";

interface CraftItem {
  id: string;
  kind: "photo" | "stamp";
  label: string;
  src: string;
  city?: string;
  numeral?: string;
  round?: boolean;
  w: number;
  aspect: string;
  left: number;
  top: number;
  rotate: number;
}

/**
 * 100% 对齐原版目标设计稿的 18 个经典摄影与艺术邮票槽位 (图1原版效果)
 */
const CRAFT_ITEMS: CraftItem[] = [
  { id: "cat-table", kind: "photo", label: "木桌小憩", src: "/images/craft/cat-table.jpg", w: 140, aspect: "3/4", left: 33, top: 41, rotate: -5 },
  { id: "lobby", kind: "photo", label: "走廊漫步", src: "/images/craft/lobby.jpg", w: 140, aspect: "3/4", left: 146, top: 13, rotate: 4 },
  { id: "run-leaves", kind: "photo", label: "落叶小径", src: "/images/craft/run-leaves.jpg", w: 140, aspect: "3/4", left: 349, top: 19, rotate: -3 },
  { id: "setup", kind: "photo", label: "工作台一隅", src: "/media/setup-poster.jpg", w: 148, aspect: "4/5", left: 455, top: 50, rotate: 2 },
  { id: "p3", kind: "photo", label: "花与曲奇", src: "/images/craft/flowers.jpg", w: 140, aspect: "3/4", left: 630, top: 37, rotate: -2 },
  { id: "cafe", kind: "photo", label: "午后咖啡", src: "/images/craft/cafe.jpg", w: 140, aspect: "3/4", left: 754, top: 93, rotate: 6 },
  { id: "pool", kind: "photo", label: "静谧泳池", src: "/images/craft/pool.jpg", w: 140, aspect: "3/4", left: 858, top: 22, rotate: 4 },
  { id: "beach", kind: "photo", label: "夕阳日落剪影", src: "/media/beach-poster.jpg", round: true, w: 150, aspect: "1/1", left: 862, top: 147, rotate: -2 },
  { id: "crochet-hung", kind: "photo", label: "手作针织", src: "/images/craft/crochet-hung.jpg", w: 140, aspect: "3/4", left: 172, top: 187, rotate: 5 },
  { id: "road-cat", kind: "photo", label: "副驾旅途", src: "/images/craft/road-cat.jpg", w: 140, aspect: "3/4", left: 19, top: 278, rotate: -4 },
  { id: "car-watercolor", kind: "photo", label: "车内水彩", src: "/images/craft/car-watercolor.jpg", w: 140, aspect: "3/4", left: 126, top: 306, rotate: 3 },
  { id: "train-sketch", kind: "photo", label: "高铁速写", src: "/images/craft/train-sketch.jpg", w: 140, aspect: "3/4", left: 349, top: 311, rotate: -2 },
  { id: "matcha", kind: "photo", label: "清爽抹茶", src: "/images/craft/matcha.jpg", w: 140, aspect: "3/4", left: 448, top: 278, rotate: 3 },
  { id: "p1", kind: "photo", label: "绿植温室", src: "/images/craft/greenhouse.jpg", w: 140, aspect: "3/4", left: 567, top: 286, rotate: -3 },
  { id: "cellar", kind: "photo", label: "红酒藏窖", src: "/images/craft/cellar.jpg", w: 140, aspect: "3/4", left: 629, top: 306, rotate: 4 },
  // 右下角三联经典打孔艺术邮票 (图1右下角)
  { id: "stamp-lille", kind: "stamp", label: "Lille 城市邮票", src: "/images/stamps/lille-beffroi.jpg", city: "LILLE", numeral: "I", w: 92, aspect: "2/3", left: 812, top: 352, rotate: -9 },
  { id: "stamp-paris", kind: "stamp", label: "Paris 铁塔邮票", src: "/images/stamps/paris-eiffel.jpg", city: "PARIS", numeral: "II", w: 92, aspect: "2/3", left: 872, top: 338, rotate: -2 },
  { id: "stamp-nancy", kind: "stamp", label: "Nancy 广场邮票", src: "/images/stamps/nancy-stanislas.jpg", city: "NANCY", numeral: "III", w: 92, aspect: "2/3", left: 930, top: 346, rotate: 4 },
];

/**
 * 邮票齿孔数学路径计算 (100% 还原原版微积分轮廓算法)
 */
function getStampPerforationPath(w: number, h: number): string {
  const a = Math.sqrt(w / 92);
  const r = 5 * a;
  const n = 15 * a;
  const getCoords = (len: number) => {
    const count = Math.max(1, Math.floor((len - n) / n));
    const start = (len - (count - 1) * n) / 2;
    return Array.from({ length: count }, (_, idx) => start + idx * n);
  };

  let s = "M 0 0 ";
  for (const t of getCoords(w)) s += `L ${t - r} 0 A ${r} ${r} 0 0 0 ${t + r} 0 `;
  s += `L ${w} 0 `;
  for (const aCoord of getCoords(h)) s += `L ${w} ${aCoord - r} A ${r} ${r} 0 0 0 ${w} ${aCoord + r} `;
  s += `L ${w} ${h} `;
  for (const aCoord of [...getCoords(w)].reverse()) s += `L ${aCoord + r} ${h} A ${r} ${r} 0 0 0 ${aCoord - r} ${h} `;
  s += `L 0 ${h} `;
  for (const eCoord of [...getCoords(h)].reverse()) s += `L 0 ${eCoord + r} A ${r} ${r} 0 0 0 0 ${eCoord - r} `;
  return s + "Z";
}

interface PhotoSectionProps {
  photos?: PhotoVO[];
}

/**
 * 1040px 突破全宽交互式照片剪贴画板 (Photo Scrapbook Board)
 * 100% 还原原版设计（图1）：纯粹点阵画板、丰富拍立得照片散落、圆形裁切、齿孔邮票
 * 修复拖拽松手误弹窗放大 Bug，真实融合后端相册数据
 */
export function PhotoSection({ photos: initialPhotos }: PhotoSectionProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<CraftItem | null>(null);
  const [zOrder, setZOrder] = useState<Record<string, number>>({});
  const zCounter = useRef(100);

  // 严格防止拖拽释放时误触发 click 放大
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(0);

  // 客户端维护相册照片状态
  const [photoList, setPhotoList] = useState<PhotoVO[]>(initialPhotos || []);

  const { playTick, playDroplet } = useSound();

  // 客户端挂载后动态请求最新真实相册照片
  useEffect(() => {
    albumService
      .getPublicPhotos(1, 20)
      .then((data) => {
        if (data && data.length > 0) {
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
   * 将真实获取的相册照片动态融入 1040px 画板槽位中
   * 优先展示博主真实拍摄的照片，同时保证整体画板具备图1的丰富度与艺术感
   */
  const items = useMemo(() => {
    const validPhotos = (photoList || []).filter((p) => Boolean(p.url));
    if (validPhotos.length === 0) {
      return CRAFT_ITEMS;
    }

    let photoIdx = 0;
    return CRAFT_ITEMS.map((item) => {
      // 真实相册照片依序注入到 photo 类型的槽位中
      if (item.kind === "photo" && photoIdx < validPhotos.length) {
        const real = validPhotos[photoIdx++];
        return {
          ...item,
          id: `real-photo-${real.id}`,
          label: real.caption || real.albumTitle || item.label,
          src: real.url || item.src,
        };
      }
      return item;
    });
  }, [photoList]);

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] my-16 w-screen overflow-hidden px-4 sm:px-6">
      {/* 1040px 交互式照片拼贴画板 (无多余文字标头，100%还原图1纯净画板) */}
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

          {/* 渲染 18 个绝对定位卡片 (完全对应图1目标效果) */}
          {items.map((item, index) => {
            const isHovered = hoveredId === item.id;
            const hasHover = hoveredId !== null;
            const currentZ = zOrder[item.id] ?? (10 + index);
            const isStamp = item.kind === "stamp";
            const h = Math.round(isStamp ? item.w * 1.5 : item.w * (4 / 3));

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
                  isStamp
                    ? "drop-shadow-[0_1px_3px_rgba(0,0,0,0.12)] drop-shadow-[0_6px_14px_rgba(0,0,0,0.18)]"
                    : item.round
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
                {/* 邮票渲染 (图1右下角) */}
                {isStamp ? (
                  <span
                    className="relative flex items-center justify-center bg-white dark:bg-[#ece9e2]"
                    style={{
                      aspectRatio: item.aspect,
                      clipPath: `path("${getStampPerforationPath(item.w, h)}")`,
                      padding: 10 * Math.sqrt(item.w / 92),
                    }}
                  >
                    <span className="relative block h-full w-full overflow-hidden rounded-[3px]">
                      <img
                        src={item.src}
                        alt={item.label}
                        className="h-full w-full object-cover pointer-events-none"
                        draggable={false}
                      />
                      <svg
                        viewBox="0 0 100 150"
                        className="absolute inset-0 h-full w-full pointer-events-none"
                        preserveAspectRatio="xMidYMid slice"
                      >
                        <text
                          x="93"
                          y="13"
                          fontSize="8.5"
                          fill="#fdf0f4"
                          textAnchor="end"
                          style={{ fontFamily: "serif", letterSpacing: "0.14em" }}
                        >
                          {item.city}
                        </text>
                        <text
                          x="93"
                          y="21"
                          fontSize="5.5"
                          fill="#fdf0f4"
                          textAnchor="end"
                          style={{ fontFamily: "serif", letterSpacing: "0.14em" }}
                        >
                          POSTE · {item.numeral}
                        </text>
                      </svg>
                    </span>
                  </span>
                ) : (
                  /* 照片渲染 (对应图1的圆角纯净白框与圆形日落剪影) */
                  <span
                    className={`relative block h-full w-full overflow-hidden border border-gray-400 ${
                      item.round ? "rounded-full" : "rounded-lg"
                    }`}
                    style={{ aspectRatio: item.aspect }}
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      className="h-full w-full object-cover pointer-events-none"
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
                  </span>
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
          <div className="flex flex-col items-center">
            <div className="max-h-[70vh] overflow-hidden rounded-xl border border-gray-400 bg-white p-2 shadow-xl">
              <img
                src={activeItem.src}
                alt={activeItem.label}
                className="max-h-[60vh] w-auto rounded-lg object-contain"
              />
            </div>
            <p className="mt-3 font-mono text-micro text-gray-1000">
              {activeItem.label}
            </p>
          </div>
        )}
      </SpringModal>
    </section>
  );
}
