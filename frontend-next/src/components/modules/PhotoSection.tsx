"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { SpringModal } from "@/components/ui/SpringModal";
import { PhotoVO } from "@/types/album";

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

const CRAFT_ITEMS: CraftItem[] = [
  { id: "cat-table", kind: "photo", label: "Le chat sur la table", src: "/images/craft/cat-table.jpg", w: 140, aspect: "3/4", left: 33, top: 41, rotate: -5 },
  { id: "lobby", kind: "photo", label: "Le lobby", src: "/images/craft/lobby.jpg", w: 140, aspect: "3/4", left: 146, top: 13, rotate: 4 },
  { id: "run-leaves", kind: "photo", label: "Courir sous les feuilles", src: "/images/craft/run-leaves.jpg", w: 140, aspect: "3/4", left: 349, top: 19, rotate: -3 },
  { id: "setup", kind: "photo", label: "Mon setup", src: "/media/setup-poster.jpg", w: 148, aspect: "4/5", left: 455, top: 50, rotate: 2 },
  { id: "p3", kind: "photo", label: "Fleurs & cookies", src: "/images/craft/flowers.jpg", w: 140, aspect: "3/4", left: 630, top: 37, rotate: -2 },
  { id: "cafe", kind: "photo", label: "Pause café", src: "/images/craft/cafe.jpg", w: 140, aspect: "3/4", left: 754, top: 93, rotate: 6 },
  { id: "pool", kind: "photo", label: "La piscine", src: "/images/craft/pool.jpg", w: 140, aspect: "3/4", left: 858, top: 22, rotate: 4 },
  { id: "beach", kind: "photo", label: "Plage au coucher de soleil", src: "/media/beach-poster.jpg", round: true, w: 150, aspect: "1/1", left: 862, top: 147, rotate: -2 },
  { id: "crochet-hung", kind: "photo", label: "Sacs au crochet, suspendus", src: "/images/craft/crochet-hung.jpg", w: 140, aspect: "3/4", left: 172, top: 187, rotate: 5 },
  { id: "road-cat", kind: "photo", label: "Sur la route, avec le chat", src: "/images/craft/road-cat.jpg", w: 140, aspect: "3/4", left: 19, top: 278, rotate: -4 },
  { id: "car-watercolor", kind: "photo", label: "Aquarelle en voiture", src: "/images/craft/car-watercolor.jpg", w: 140, aspect: "3/4", left: 126, top: 306, rotate: 3 },
  { id: "train-sketch", kind: "photo", label: "Croquis dans le train", src: "/images/craft/train-sketch.jpg", w: 140, aspect: "3/4", left: 349, top: 311, rotate: -2 },
  { id: "matcha", kind: "photo", label: "Matcha à la rose", src: "/images/craft/matcha.jpg", w: 140, aspect: "3/4", left: 448, top: 278, rotate: 3 },
  { id: "p1", kind: "photo", label: "Sous serre", src: "/images/craft/greenhouse.jpg", w: 140, aspect: "3/4", left: 567, top: 286, rotate: -3 },
  { id: "cellar", kind: "photo", label: "La cave", src: "/images/craft/cellar.jpg", w: 140, aspect: "3/4", left: 629, top: 306, rotate: 4 },
  // 右下角三联经典邮票
  { id: "stamp-lille", kind: "stamp", label: "Timbre Lille, le beffroi", src: "/images/stamps/lille-beffroi.jpg", city: "LILLE", numeral: "I", w: 92, aspect: "2/3", left: 812, top: 352, rotate: -9 },
  { id: "stamp-paris", kind: "stamp", label: "Timbre Paris, la tour Eiffel", src: "/images/stamps/paris-eiffel.jpg", city: "PARIS", numeral: "II", w: 92, aspect: "2/3", left: 872, top: 338, rotate: -2 },
  { id: "stamp-nancy", kind: "stamp", label: "Timbre Nancy, la place Stanislas", src: "/images/stamps/nancy-stanislas.jpg", city: "NANCY", numeral: "III", w: 92, aspect: "2/3", left: 930, top: 346, rotate: 4 },
];

/**
 * 邮票齿孔数学路径计算 (100% 还原原版算法)
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

export function PhotoSection({ photos }: PhotoSectionProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<CraftItem | null>(null);
  const [zOrder, setZOrder] = useState<Record<string, number>>({});
  const zCounter = useRef(100);

  const { playTick, playDroplet } = useSound();

  const bringToFront = (id: string) => {
    zCounter.current += 1;
    setZOrder((prev) => ({ ...prev, [id]: zCounter.current }));
  };

  return (
    <section className="relative left-1/2 right-1/2 -mx-[50vw] my-16 w-screen overflow-hidden px-4 sm:px-6">
      {/* 1040px 交互式照片拼贴画板 (Photo Scrapbook Board) */}
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

          {/* 渲染 18 个绝对定位卡片 */}
          {CRAFT_ITEMS.map((item, index) => {
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
                onClick={() => {
                  setActiveItem(item);
                  playDroplet();
                }}
                initial={{ rotate: item.rotate }}
                whileHover={{ scale: 1.04, rotate: 0 }}
                whileDrag={{ scale: 1.08, zIndex: 9999 }}
                animate={{
                  filter: hasHover && !isHovered ? "blur(3.5px) saturate(0.85) brightness(0.85)" : "blur(0px) saturate(1) brightness(1)",
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
                {/* 邮票渲染 */}
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
                  /* 照片/视频渲染 */
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

      {/* 点击卡片弹窗灯箱 (Lightbox) */}
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
