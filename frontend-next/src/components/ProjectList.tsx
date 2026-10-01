"use client";

import React from "react";
import Link from "next/link";
import { getTitleTilt } from "@/lib/utils";
import { PageThumb } from "@/components/PageThumb";
import { play } from "@/lib/sound";

export interface ProjectListItem {
  title: string;
  description?: string;
  year: string;
  href: string;
  tag?: string;
  tagTone?: "pink" | "gray";
  draft?: boolean;
  live?: boolean;
}

interface ProjectListProps {
  items: ProjectListItem[];
  staggerFrom?: number;
  pageThumb?: boolean;
  showDescription?: boolean;
  dimmed?: boolean;
}

export function ProjectList({
  items,
  pageThumb = false,
  showDescription = false,
  dimmed = false,
}: ProjectListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {items.map((item, index) => {
        const tilt = getTitleTilt(item.title);
        const isDisabled = dimmed && !item.live;

        const content = (
          <div className="group relative -mx-3 flex items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-gray-200">
            {/* 左侧：标题与标签 */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-base text-gray-1100 transition-colors duration-200 group-hover:text-gray-1200">
                  {item.title}
                </span>

                {item.draft && (
                  <span className="shrink-0 rounded-full bg-gray-300 px-2 py-0.5 text-micro uppercase tracking-wider text-gray-1000">
                    Case in progress
                  </span>
                )}

                {item.tag && (
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-micro uppercase tracking-wider ${
                      item.tagTone === "pink"
                        ? "bg-[#fde3ef] text-[#9b3860] dark:bg-[#462134] dark:text-[#f2aed0]"
                        : "bg-gray-300 text-gray-1000"
                    }`}
                  >
                    {item.tag}
                  </span>
                )}
              </div>

              {showDescription && item.description && (
                <p className="mt-0.5 text-body text-gray-1000 leading-relaxed">
                  {item.description}
                </p>
              )}
            </div>

            {/* 右侧：年份与哈希微倾斜缩略图 */}
            <div className="shrink-0 flex items-center gap-4">
              <span className="tabular-nums text-body text-gray-1000 transition-colors duration-200 group-hover:text-gray-1200">
                {item.year}
              </span>

              {pageThumb && (
                <span
                  style={{
                    transform: `rotate(${tilt})`,
                  }}
                  className="shrink-0 transition-transform duration-300 ease-out group-hover:rotate-0 group-hover:scale-105"
                >
                  <PageThumb seed={item.title} size={36} />
                </span>
              )}
            </div>
          </div>
        );

        if (isDisabled) {
          return (
            <li
              key={index}
              className="cursor-not-allowed opacity-50 select-none"
              aria-disabled="true"
            >
              {content}
            </li>
          );
        }

        return (
          <li key={index}>
            <Link
              href={item.href}
              onMouseEnter={() => play("tick", { volume: 0.2 })}
              onClick={() => play("release", { volume: 0.4 })}
            >
              {content}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
