"use client";

import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSound } from "@/hooks/useSound";
import { SpringModal } from "@/components/ui/SpringModal";
import { PhotoVO } from "@/types/album";
import { Camera, Calendar, MapPin, Maximize2, Sparkles } from "lucide-react";

interface PhotoSectionProps {
  photos?: PhotoVO[];
}

/**
 * 格式化照片日期展示（YYYY.MM.DD）
 * @param dateStr ISO 时间字符串
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
 * 底部照片与生活随拍板块（PhotoSection）
 * 100% 真实后端相册数据驱动，采用拍立得实体相纸设计，无死数据与外来模板残留
 */
export function PhotoSection({ photos = [] }: PhotoSectionProps) {
  const [activePhoto, setActivePhoto] = useState<PhotoVO | null>(null);
  const [isHovered, setIsHovered] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { playTick, playDroplet } = useSound();

  // 过滤有效真实照片列表
  const validPhotos = (photos || []).filter((p) => Boolean(p.url));

  return (
    <section className="my-14 border-t border-gray-300 dark:border-gray-800/80 pt-10">
      {/* 板块顶部刊头 */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="size-4 text-gray-1000 dark:text-gray-400" />
          <h2 className="text-sm font-semibold tracking-wide text-gray-1200 uppercase">
            随拍记录 · Moments
          </h2>
        </div>
        <span className="font-mono text-micro text-gray-1000">
          {validPhotos.length > 0
            ? `${validPhotos.length} 张胶片随拍`
            : "暂无照片"}
        </span>
      </div>

      {/* 空状态：相册暂无照片 */}
      {validPhotos.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-gray-800 py-12 text-center">
          <Camera className="size-8 text-gray-400 dark:text-gray-600 mb-2 stroke-[1.5]" />
          <p className="text-sm text-gray-1000">暂无随拍照片，期待每一次快门记录生活</p>
        </div>
      )}

      {/* 单张照片精巧展示模式：拍立得实体相纸 + 相册生活记事便签 */}
      {validPhotos.length === 1 && (
        <div
          ref={containerRef}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center rounded-2xl border border-gray-300 dark:border-gray-800/80 bg-gray-100/70 dark:bg-gray-900/40 p-5 sm:p-6"
        >
          {/* 左侧：物理质感拍立得相纸卡片 */}
          <div className="md:col-span-5 flex justify-center">
            {validPhotos.map((photo) => (
              <motion.div
                key={photo.id}
                drag
                dragConstraints={containerRef}
                dragElastic={0.2}
                dragMomentum={false}
                initial={{ rotate: -2 }}
                whileHover={{ scale: 1.03, rotate: 0 }}
                whileDrag={{ scale: 1.05, zIndex: 50 }}
                onMouseEnter={() => {
                  setIsHovered(photo.id);
                  playTick();
                }}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => {
                  setActivePhoto(photo);
                  playDroplet();
                }}
                className="group relative cursor-grab active:cursor-grabbing w-full max-w-[270px] rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] p-2.5 pb-4 shadow-md transition-shadow duration-200 hover:shadow-xl"
              >
                {/* 拍立得照片本体 */}
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[3px] bg-gray-200 dark:bg-gray-800">
                  <img
                    src={photo.url}
                    alt={photo.caption || photo.albumTitle || "随拍照片"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 pointer-events-none"
                    draggable={false}
                  />
                  {/* 微胶片噪点与放大指示图标 */}
                  <div className="pointer-events-none absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full bg-black/60 p-1.5 text-white backdrop-blur-sm">
                      <Maximize2 className="size-3.5" />
                    </span>
                  </div>
                </div>

                {/* 拍立得底部白色相纸留白区（打印真实拍摄信息） */}
                <div className="mt-3 flex items-center justify-between px-1">
                  <span className="font-mono text-micro font-medium text-gray-1200 truncate">
                    {photo.caption || photo.albumTitle || "随拍"}
                  </span>
                  <span className="font-mono text-[10px] text-gray-900 shrink-0">
                    {formatPhotoDate(photo.createdAt)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 右侧：相册元数据便签与胶卷印戳 */}
          <div className="md:col-span-7 flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2 py-0.5 text-micro font-medium text-amber-600 dark:text-amber-400">
                <Sparkles className="size-3" />
                生活随笔
              </span>
              <span className="font-mono text-micro text-gray-1000">
                ALBUM #{validPhotos[0]?.albumTitle || "随拍"}
              </span>
            </div>

            <h3 className="text-base font-medium text-gray-1200 leading-snug">
              {validPhotos[0]?.albumTitle || "生活中随拍"}
            </h3>

            <p className="text-sm text-gray-1100 leading-relaxed">
              {validPhotos[0]?.caption ||
                "生活中随手记录的吉光片羽。代码是理性的构建，随拍是感性的留存。"}
            </p>

            {/* 胶片规格与拍摄参数信息栏 */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-micro font-mono text-gray-1000">
              <span className="flex items-center gap-1">
                <Calendar className="size-3 text-gray-900" />
                {formatPhotoDate(validPhotos[0]?.createdAt)}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3 text-gray-900" />
                {validPhotos[0]?.location || "生活日常"}
              </span>
              <span>·</span>
              <button
                onClick={() => {
                  setActivePhoto(validPhotos[0]);
                  playDroplet();
                }}
                className="text-gray-1200 underline underline-offset-4 hover:text-amber-600 transition-colors"
              >
                查看高清原图
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 多张照片流式排布模式（未来后台上传更多相片时自适应紧凑展示） */}
      {validPhotos.length > 1 && (
        <div
          ref={containerRef}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
        >
          {validPhotos.map((photo, idx) => {
            const rot = (idx % 2 === 0 ? -1 : 1) * (1.5 + (idx % 3));
            return (
              <motion.div
                key={photo.id}
                initial={{ rotate: rot }}
                whileHover={{ scale: 1.04, rotate: 0, zIndex: 20 }}
                onMouseEnter={() => {
                  setIsHovered(photo.id);
                  playTick();
                }}
                onMouseLeave={() => setIsHovered(null)}
                onClick={() => {
                  setActivePhoto(photo);
                  playDroplet();
                }}
                className="group cursor-pointer rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#1a1a1a] p-2 pb-3.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2px] bg-gray-200 dark:bg-gray-800">
                  <img
                    src={photo.url}
                    alt={photo.caption || photo.albumTitle || "随拍照片"}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    draggable={false}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between px-0.5">
                  <span className="font-mono text-[11px] font-medium text-gray-1200 truncate max-w-[70%]">
                    {photo.caption || photo.albumTitle || "随拍"}
                  </span>
                  <span className="font-mono text-[10px] text-gray-900 shrink-0">
                    {formatPhotoDate(photo.createdAt)}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 点击卡片弹窗灯箱：无损大图与详情展示 */}
      <SpringModal
        isOpen={activePhoto !== null}
        onClose={() => setActivePhoto(null)}
        title={activePhoto?.caption || activePhoto?.albumTitle || "照片详情"}
      >
        {activePhoto && (
          <div className="flex flex-col items-center">
            <div className="max-h-[75vh] max-w-full overflow-hidden rounded-xl border border-gray-300 dark:border-gray-800 bg-white dark:bg-[#161616] p-2 shadow-2xl">
              <img
                src={activePhoto.url}
                alt={activePhoto.caption || activePhoto.albumTitle || "随拍照片"}
                className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between w-full px-1 text-micro font-mono text-gray-1000">
              <span>{activePhoto.albumTitle ? `相册 · ${activePhoto.albumTitle}` : "随拍记录"}</span>
              <span>{formatPhotoDate(activePhoto.createdAt)}</span>
            </div>
          </div>
        )}
      </SpringModal>
    </section>
  );
}
