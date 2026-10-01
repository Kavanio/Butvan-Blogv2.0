"use client";

import React from "react";
import Image from "next/image";
import { CLIENT_LOGOS } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { play } from "@/lib/sound";

export function ClientStack() {
  const { lang } = useLang();

  return (
    <span
      aria-hidden="true"
      className="group/stack relative z-40 ml-1.5 mr-0.5 inline-flex translate-y-[5px] items-center"
      onMouseEnter={() => play("sparkle", { volume: 0.3 })}
    >
      {CLIENT_LOGOS.map((logo, index) => {
        const titleText = typeof logo.title === "string" ? logo.title : logo.title[lang];
        const offsetPx = (index - 2) * 5;

        return (
          <span
            key={index}
            style={{
              transform: `translateX(${offsetPx}px) rotate(${logo.rotate}deg)`,
            }}
            className="group/chip relative -ml-2.5 inline-flex size-6 items-center justify-center rounded-full border border-gray-400 bg-gray-100 shadow-sm transition-all duration-300 first:ml-0 group-hover/stack:translate-x-0 group-hover/stack:scale-105"
          >
            <Image
              src={logo.src}
              alt={titleText}
              width={16}
              height={16}
              className="size-3.5 object-contain"
            />
            {/* 悬停展示名称 Tooltip */}
            <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-1200 px-1.5 py-0.5 text-[11px] font-medium leading-4 text-gray-bg opacity-0 transition-opacity duration-200 group-hover/chip:opacity-100 shadow-sm">
              {titleText}
            </span>
          </span>
        );
      })}
    </span>
  );
}
